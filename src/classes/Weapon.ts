/// <reference path="../index.d.ts"/>

import type { Child } from "../util";

export class Weapon extends EngineObject implements Child {
    localAngle: number;
    localPos: Vector2;
    parent: EngineObject;

    private readonly bullets: EngineObject[] = [];

    protected sprite_index: number;
    protected shoot_cooldown: number;

    constructor(id: number, cooldown: number)
    {
        super(vec2(0, 0), vec2(1, 1), 16 + id, vec2(16, 16), 90);

        this.sprite_index = id;

        this.shoot_cooldown = cooldown;
    }

    private shoot_counter = 0;
    update()
    {
        super.update(); // update object physics and position

        if (this.shoot_counter > 0)
            this.shoot_counter++;

        if (this.shoot_counter >= this.shoot_cooldown)
            this.shoot_counter = 0;
        
        if (this.shoot_counter == 0 && mouseIsDown(0)) {
            this.bullets.push(this.shoot());

            this.shoot_counter++;
        }
    }

    shoot(): EngineObject {
        console.error("Unimplimented");
        return;
    }

    render()
    {
        super.render(); // draw object as a sprite

        this.localAngle =
            Math.atan2(
                mousePos.x - this.pos.x,
                mousePos.y - this.pos.y
            ) - 90 * PI / 180;
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
            24 + this.sprite_index, vec2(16, 16),
            this.localAngle
        );


        bullet.velocity = vec2().setAngle(bullet.angle + .5 * PI).normalize().divide(vec2(3, 3));
        bullet.damping = 1;

        return bullet;
    }
}