/// <reference path="../index.d.ts"/>

import { Weapon } from "./Weapon";

export class Entity extends EngineObject {
    protected weapon = new Weapon(0, 8);

    health: number

    constructor(pos: Vector2,  health: number)
    {
        super(pos, vec2(1, 1), 0, vec2(16, 16));
        this.health = health;
    }

    private last_damaged: number = 0;
    damage(amount: number) {
        if (this.destroyed)
            return;
        
        this.health -= amount;
        this.color = new Color(1, 0, 0);
        this.last_damaged = time;
    }

    update()
    {
        super.update(); // update object physics and position

        if (this.health <= 0 && !this.destroyed)
            this.destroy();
    }

    render() {
        super.render();

        if (time - this.last_damaged > .05)
            this.color = new Color;
    }
}