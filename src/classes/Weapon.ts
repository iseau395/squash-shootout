/// <reference path="../index.d.ts"/>

import type { Child } from "../util";

export class Weapon extends EngineObject implements Child {
    localAngle: number;
    localPos: Vector2;
    parent: EngineObject;

    protected sprite_index: number;
    shoot_cooldown: number;

    protected bullet_spawn = vec2(0, 0)

    constructor(id: number, cooldown: number)
    {
        super(vec2(0, 0), vec2(1.5, 1), 7 + id, vec2(48, 32), 90);

        this.sprite_index = id;

        this.shoot_cooldown = cooldown;
    }

    target: Vector2 = vec2(0, 0);
    setTarget(pos: Vector2) {
        this.target = pos;
    }

    update()
    {
        super.update(); // update object physics and position

        this.localAngle =
            Math.atan2(
                this.target.x - this.pos.x,
                this.target.y - this.pos.y
            ) - 90 * PI / 180;
    }

    shoot(): EngineObject {
        console.error("Unimplimented");
        return;
    }

    render()
    {
        super.render(); // draw object as a sprite
    }
}

export class Gun extends Weapon {
    constructor() {
        super(0, 16);
    }

    shoot(): EngineObject {
        const bullet = new EngineObject(
            this.pos.add(vec2(.5, .25).rotate(-this.localAngle)),
            vec2(.5, .5),
            0 + this.sprite_index, vec2(16, 16),
            this.localAngle
        );


        bullet.velocity = vec2().setAngle(bullet.angle + .5 * PI).normalize().divide(vec2(3, 3));
        bullet.damping = 1;

        return bullet;
    }
}