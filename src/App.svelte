<script lang="ts">
    /*
        LittleJS Hello World Starter Game
    */

    'use strict';

    // popup errors if there are any (help diagnose issues on mobile devices)
    onerror = (...parameters)=> alert(parameters);

    let player: EngineObject;
    let weapon: EngineObject;

    ///////////////////////////////////////////////////////////////////////////////
    function gameInit()
    {
        // create tile collision and visible tile layer
        initTileCollision(vec2(48, 24));
        const tileLayer = new TileLayer(vec2(), tileCollisionSize);
        const pos = vec2();

        // get level data from the tiles image
        const imageLevelDataRow = 1;
        mainContext.drawImage(tileImage, 0, 0);
        // setTileCollisionData(pos, 1);

        const mirror = randInt(2);
        for(let x = 0; x < tileCollisionSize.x; x++) {
            for(let y = 0; y < tileCollisionSize.y; y++) {
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

        player.addChild(
            weapon,
            vec2(.4, .1),
            0
        );

        // enable gravity
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
    }

    ///////////////////////////////////////////////////////////////////////////////
    let last_input = vec2();

    const bullets: EngineObject[] = []

    let shoot_cooldown = 0;
    function gameUpdate()
    {
        const moveInput = isUsingGamepad ? gamepadStick(0) : 
            vec2(Number(keyIsDown(39)) - Number(keyIsDown(37)), Number(keyIsDown(38)) - Number(keyIsDown(40)));

        player.velocity = moveInput.divide(vec2(20, 20));
        
        if (shoot_cooldown == 0 && mouseIsDown(0)) {
            const bullet = new EngineObject(player.children[0].pos, vec2(1, 1), 12, vec2(16, 16), player.children[0].localAngle);
            bullets.push(bullet);

            // if (bullet.angle > )

            bullet.velocity = vec2(Math.cos(bullet.angle), Math.sin(2*PI - bullet.angle)).normalize().divide(vec2(3, 3));
            bullet.damping = 1;

            shoot_cooldown++;
        }

        bullets.forEach(v => {
            // v.velocity =
        })

        if (shoot_cooldown > 0)
            shoot_cooldown++;
        
        if (shoot_cooldown >= 7)
            shoot_cooldown = 0;

        last_input = moveInput;
    }

    ///////////////////////////////////////////////////////////////////////////////
    function gameUpdatePost()
    {

    }

    ///////////////////////////////////////////////////////////////////////////////
    let animation_frame = 0;
    let player_frame = 0;
    function gameRender()
    {
        // draw a grey square in the background without using webgl
        // drawRect(cameraPos, tileCollisionSize.add(vec2(5)), new Color(.2,.2,.2), 0, false);

        if (animation_frame % 30 == 0) {
            player_frame++;

            if (player_frame > 2)
                player_frame = 0;
        }

        player.tileIndex = 8 + player_frame;

        player.children[0].localAngle =
            Math.atan2(
                mousePos.x - player.children[0].pos.x,
                mousePos.y - player.children[0].pos.y
            ) - 90 * PI / 180;

        player.children[0].update();
        player.update();

        animation_frame++;
    }

    ///////////////////////////////////////////////////////////////////////////////
    function gameRenderPost()
    {

    }

    ///////////////////////////////////////////////////////////////////////////////
    // Startup LittleJS Engine
    engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, 'media/tiles.png');
</script>

<style>

</style>