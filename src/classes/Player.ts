/// <reference path="../index.d.ts"/>
import type { Child } from "../util";
import { Weapon } from "./Weapon";

export class Player extends EngineObject {
    private weapon_id = 0;
    // private readonly weapon = new EngineObject(vec2(0, 0), vec2(1, 1), 17 + this.weapon_id, vec2(16, 16), 90) as Child;
    private readonly weapon = new Weapon(this.weapon_id, 8) as Weapon & Child;

    private animation_frame = 0;
    private sprite_frame = 0;

    constructor(pos: Vector2)
    {
        super(pos, vec2(1, 1), 8, vec2(16, 16));

        this.addChild(
            this.weapon,
            vec2(.6, .2),
            0
        );
        // your object init code here
    }

    update()
    {
        super.update(); // update object physics and position
        
        const moveInput = isUsingGamepad ? gamepadStick(0) : 
            vec2(Number(keyIsDown(39)) - Number(keyIsDown(37)), Number(keyIsDown(38)) - Number(keyIsDown(40)));

        this.velocity = moveInput.divide(vec2(20, 20));
    }

    render()
    {
        super.render(); // draw object as a sprite
        
        if (this.animation_frame % 25 == 0) {
            this.sprite_frame++;

            if (this.sprite_frame > 2)
                this.sprite_frame = 0;
        }

        this.animation_frame++;

        this.tileIndex = 8 + this.sprite_frame;

        this.weapon.localAngle =
            Math.atan2(
                mousePos.x - this.weapon.pos.x,
                mousePos.y - this.weapon.pos.y
            ) - 90 * PI / 180;
    }
}