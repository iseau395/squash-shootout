/// <reference path="../index.d.ts"/>
import { Gun } from "./Weapon";
import { player, enemy_bullets } from "..";

export class Enemy extends EngineObject {
    private weapon = new Gun();

    private animation_frame = 0;
    private sprite_frame = 0;

    constructor(pos: Vector2, sprite: number)
    {
        super(pos, vec2(1, 1), 16 + 8*sprite, vec2(16, 16));

        this.addChild(
            this.weapon,
            vec2(.6, .2),
            0
        );
        // your object init code here
    }

    is_too_close = false;
    too_close_to = vec2();
    isTooClose(too_close: boolean, pos: Vector2) {
        this.is_too_close = too_close;
        this.too_close_to = pos;
    }

    readonly last_targets: Vector2[] = [vec2(0, 0), vec2(0, 0), vec2(0, 0), vec2(0, 0), vec2(0, 0)]
    shoot_counter = 0;
    update()
    {
        super.update(); // update object physics and position

        const last_target = this.last_targets[0];

        this.last_targets[0] = this.last_targets[1];
        this.last_targets[1] = this.last_targets[2];
        this.last_targets[2] = this.last_targets[3];
        this.last_targets[3] = this.last_targets[4];
        this.last_targets[4] = last_target.lerp(player.pos, .09);

        this.weapon.setTarget(last_target);

        if (this.shoot_counter > 0)
            this.shoot_counter++;

        if (this.shoot_counter >= this.weapon.shoot_cooldown)
            this.shoot_counter = 0;
        
        if (this.shoot_counter == 0 && this.pos.distance(player.pos) < 5) {
            enemy_bullets.push(this.weapon.shoot());

            this.shoot_counter++;
        }
        
        console.log(this.is_too_close);

        if (this.is_too_close) {
            if (this.pos.x == this.too_close_to.x && this.pos.y == this.too_close_to.y)
                this.velocity = randVector(1);
            else
                this.velocity = this.pos.subtract(this.too_close_to).normalize().divide(vec2(50, 50));
        }
        else if (this.pos.distance(player.pos) > 2) {
            this.velocity = this.pos.subtract(player.pos).normalize().divide(vec2(-30, -30));
        }
        else {
            this.velocity = vec2(0, 0);
        }

        this.velocity = 
            vec2(
                (this.pos.x < tileCollisionSize.x - 1.5 && this.pos.x > 1.5 ? this.velocity.x : Math.abs(this.velocity.x) * -Math.sign(this.pos.x - tileCollisionSize.x/2)),
                (this.pos.y < tileCollisionSize.y - 1.5 && this.pos.y > 1.5 ? this.velocity.y : Math.abs(this.velocity.y) * -Math.sign(this.pos.y - tileCollisionSize.y/2))
            );
    }

    render()
    {
        super.render(); // draw object as a sprite
        
        // if (this.animation_frame % 25 == 0) {
        //     this.sprite_frame++;

        //     if (this.sprite_frame > 2)
        //         this.sprite_frame = 0;
        // }

        // this.animation_frame++;

        this.tileIndex = 16 + this.sprite_frame;
    }
}