(function () {
    'use strict';

    function noop() { }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.51.0' }, detail), { bubbles: true }));
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\App.svelte generated by Svelte v3.51.0 */

    function create_fragment(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function gameUpdatePost() {
    	
    }

    ///////////////////////////////////////////////////////////////////////////////
    function gameRenderPost() {
    	
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	// popup errors if there are any (help diagnose issues on mobile devices)
    	onerror = (...parameters) => alert(parameters);

    	let player;
    	let weapon;

    	///////////////////////////////////////////////////////////////////////////////
    	function gameInit() {
    		// create tile collision and visible tile layer
    		initTileCollision(vec2(48, 24));

    		const tileLayer = new TileLayer(vec2(), tileCollisionSize);
    		vec2();

    		mainContext.drawImage(tileImage, 0, 0);

    		// setTileCollisionData(pos, 1);
    		const mirror = randInt(2);

    		for (let x = 0; x < tileCollisionSize.x; x++) {
    			for (let y = 0; y < tileCollisionSize.y; y++) {
    				const data = new TileLayerData(Math.max(randInt(30) - 26, 0), 0, Boolean(mirror));
    				tileLayer.setData(vec2(x, y), data);
    			}
    		}

    		tileLayer.redraw();

    		// move camera to center of collision
    		cameraPos = tileCollisionSize.scale(.5);

    		cameraScale = 32;
    		player = new EngineObject(vec2(tileCollisionSize.x / 2, tileCollisionSize.y / 2), vec2(1, 1), 8, vec2(16, 16));
    		weapon = new EngineObject(vec2(0, 0), vec2(1, 1), 11, vec2(16, 16), 90);
    		player.addChild(weapon, vec2(.4, .1), 0);
    	} // enable gravity
    	// gravity = -.01;

    	// create particle emitter
    	// const center = tileCollisionSize.scale(.5).add(vec2(0,9));
    	// particleEmiter = new ParticleEmitter(
    	//     center, 0, 1, 0, 500, PI, // pos, angle, emitSize, emitTime, emitRate, emiteCone
    	//     0, vec2(16),                            // tileIndex, tileSize
    	//     new Color(1,1,1),   new Color(0,0,0),   // colorStartA, colorStartB
    	//     new Color(1,1,1,0), new Color(0,0,0,0), // colorEndA, colorEndB
    	//     2, .2, .2, .1, .05,     // particleTime, sizeStart, sizeEnd, particleSpeed, particleAngleSpeed
    	//     .99, 1, 1, PI, .05,     // damping, angleDamping, gravityScale, particleCone, fadeRate, 
    	//     .5, true, true                // randomness, collide, additive, randomColorLinear, renderOrder
    	// );
    	// particleEmiter.elasticity = .3; // bounce when it collides
    	// particleEmiter.trailScale = 2;  // stretch in direction of motion
    	///////////////////////////////////////////////////////////////////////////////
    	let last_input = vec2();

    	const bullets = [];
    	let shoot_cooldown = 0;

    	function gameUpdate() {
    		const moveInput = isUsingGamepad
    		? gamepadStick(0)
    		: vec2(Number(keyIsDown(39)) - Number(keyIsDown(37)), Number(keyIsDown(38)) - Number(keyIsDown(40)));

    		player.velocity = moveInput.divide(vec2(20, 20));

    		if (shoot_cooldown == 0 && mouseIsDown(0)) {
    			const bullet = new EngineObject(player.children[0].pos, vec2(1, 1), 12, vec2(16, 16), player.children[0].localAngle);
    			bullets.push(bullet);

    			// if (bullet.angle > )
    			bullet.velocity = vec2(Math.cos(bullet.angle), Math.sin(2 * PI - bullet.angle)).normalize().divide(vec2(3, 3));

    			bullet.damping = 1;
    			shoot_cooldown++;
    		}

    		bullets.forEach(v => {
    			
    		}); // v.velocity =

    		if (shoot_cooldown > 0) shoot_cooldown++;
    		if (shoot_cooldown >= 5) shoot_cooldown = 0;
    		last_input = moveInput;
    	}

    	///////////////////////////////////////////////////////////////////////////////
    	let animation_frame = 0;

    	let player_frame = 0;

    	function gameRender() {
    		// draw a grey square in the background without using webgl
    		// drawRect(cameraPos, tileCollisionSize.add(vec2(5)), new Color(.2,.2,.2), 0, false);
    		if (animation_frame % 30 == 0) {
    			player_frame++;
    			if (player_frame > 2) player_frame = 0;
    		}

    		player.tileIndex = 8 + player_frame;
    		player.children[0].localAngle = Math.atan2(mousePos.x - player.children[0].pos.x, mousePos.y - player.children[0].pos.y) - 90 * PI / 180;
    		player.children[0].update();
    		player.update();
    		animation_frame++;
    	}

    	///////////////////////////////////////////////////////////////////////////////
    	// Startup LittleJS Engine
    	engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, 'media/tiles.png');

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		player,
    		weapon,
    		gameInit,
    		last_input,
    		bullets,
    		shoot_cooldown,
    		gameUpdate,
    		gameUpdatePost,
    		animation_frame,
    		player_frame,
    		gameRender,
    		gameRenderPost
    	});

    	$$self.$inject_state = $$props => {
    		if ('player' in $$props) player = $$props.player;
    		if ('weapon' in $$props) weapon = $$props.weapon;
    		if ('last_input' in $$props) last_input = $$props.last_input;
    		if ('shoot_cooldown' in $$props) shoot_cooldown = $$props.shoot_cooldown;
    		if ('animation_frame' in $$props) animation_frame = $$props.animation_frame;
    		if ('player_frame' in $$props) player_frame = $$props.player_frame;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    new App({
        target: document.body
    });

})();
//# sourceMappingURL=build.js.map
