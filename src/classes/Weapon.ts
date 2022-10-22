/// <reference path="../index.d.ts"/>

import type { Child } from "../util";

export class Weapon extends EngineObject implements Child {
    localAngle: number;
    localPos: Vector2;
    parent: EngineObject;

    protected sprite_index: number;
    shoot_cooldown: number;

    constructor(id: number, cooldown: number)
    {
        super(vec2(0, 0), vec2(1, 1), 48 + id, vec2(16, 16), 90);

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

        console.log(this.pos);
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
        super(0, 8);
    }

    shoot(): EngineObject {
        const bullet = new EngineObject(
            this.pos.add(
                vec2()
                .setAngle(this.localAngle + .5 * PI)
                .divide(vec2(2.2, 2.2))),
            vec2(1, 1),
            56 + this.sprite_index, vec2(16, 16),
            this.localAngle
        );


        bullet.velocity = vec2().setAngle(bullet.angle + .5 * PI).normalize().divide(vec2(3, 3));
        bullet.damping = 1;

        return bullet;
    }
}