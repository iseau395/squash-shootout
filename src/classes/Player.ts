/// <reference path="../index.d.ts"/>
import { Gun } from "./Weapon";

export class Player extends EngineObject {
    private weapon = new Gun();

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
    }
}