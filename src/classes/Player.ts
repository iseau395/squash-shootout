/// <reference path="../index.d.ts"/>
import { Entity } from "./Entity";
import { Gun } from "./Weapon";

export class Player extends Entity {
    protected weapon = new Gun();

    private animation_frame = 0;
    private sprite_frame = 0;

    readonly bullets: EngineObject[] = [];

    constructor(pos: Vector2)
    {
        super(pos, 20, vec2(1, 1.5), vec2(32, 48));

        this.addChild(
            this.weapon,
            vec2(1, .5),
            0
        );
    }

    private shoot_counter = 0;
    update()
    {
        super.update(); // update object physics and position

        const moveInput = isUsingGamepad ? gamepadStick(0) : 
            vec2(
                (this.pos.x < tileCollisionSize.x / 2 + 24 - 1 ? Number(keyIsDown(39)) : 0) -
                (this.pos.x > 24 + 1 ? Number(keyIsDown(37)) : 0),
                (this.pos.y < tileCollisionSize.y / 2 + 12 - 1 ? Number(keyIsDown(38)) : 0) -
                (this.pos.y > 12 + 1.75 ? Number(keyIsDown(40)) : 0)
            );

        if (moveInput.distance(vec2(0, 0)) != 0)
            this.velocity = moveInput.normalize().divide(vec2(13, 13));
        else 
            this.velocity = vec2(0, 0);

        this.weapon.setTarget(mousePos);

        if (this.shoot_counter > 0)
            this.shoot_counter++;

        if (this.shoot_counter >= this.weapon.shoot_cooldown)
            this.shoot_counter = 0;

        if (this.shoot_counter == 0 && mouseIsDown(0)) {
            this.bullets.push(this.weapon.shoot());

            this.shoot_counter++;
        }

        this.bullets.forEach(v => {
            if (time - v.spawnTime > .5 && !v.destroyed)
                v.destroy();
        });
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

        this.tileIndex = 32 + this.sprite_frame;
    }
}