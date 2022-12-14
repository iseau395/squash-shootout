/// <reference path="../index.d.ts"/>

import { Weapon } from "./Weapon";

export class Entity extends EngineObject {
    protected weapon;

    health: number

    constructor(pos: Vector2,  health: number, size: Vector2, tileSize: Vector2)
    {
        super(pos, size, 0, tileSize);
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