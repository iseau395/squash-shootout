/// <reference path="../index.d.ts"/>
import { Gun } from "./Weapon";
import { player, enemy_bullets } from "..";
import { Entity } from "./Entity";

export class Enemy extends Entity {
    protected weapon = new Gun();

    private animation_frame = 0;
    private sprite_frame = 0;
    private sprite;

    constructor(pos: Vector2, sprite: number)
    {
        super(pos, 2, vec2(1, 1.5), vec2(32, 48));
        this.sprite = sprite;
        this.tileIndex = 0;

        this.addChild(
            this.weapon,
            vec2(.6, .2),
            0
        );
    }

    is_too_close = false;
    too_close_to = vec2();
    isTooClose(too_close: boolean, pos: Vector2) {
        this.is_too_close = too_close;
        this.too_close_to = pos;
    }

    readonly last_targets: Vector2[] = [vec2(0, 0), vec2(0, 0), vec2(0, 0), vec2(0, 0), vec2(0, 0)];
    readonly last_move: Vector2[] = [vec2(0, 0), vec2(0, 0), vec2(0, 0), vec2(0, 0), vec2(0, 0)];
    shoot_counter = 0;
    update()
    {
        super.update(); // update object physics and position

        if (this.destroyed)
            return;

        this.last_targets[4] = this.last_targets.shift().lerp(player.pos.add(randVector(.5)), .09);

        this.weapon.setTarget(this.last_targets[4]);

        if (this.shoot_counter > 0)
            this.shoot_counter++;

        if (this.shoot_counter >= this.weapon.shoot_cooldown * 2)
            this.shoot_counter = 0;
        
        if (this.shoot_counter == 0 && this.pos.distance(player.pos) < 8 && enemy_bullets.length < 400) {
            enemy_bullets.push(this.weapon.shoot());

            this.shoot_counter++;
        }

        if (this.is_too_close) {
            if (this.pos.x == this.too_close_to.x && this.pos.y == this.too_close_to.y)
                this.velocity = randVector(1);
            else
                this.velocity = this.pos.subtract(this.too_close_to).normalize().divide(vec2(50, 50));
        }
        else if (this.pos.distance(player.pos) > 5) {
            this.velocity = this.pos.subtract(player.pos.add(randVector(2))).normalize().divide(vec2(-30, -30));
        }
        else {
            this.velocity = vec2(0, 0);
        }

        this.last_move[4] = this.last_move.shift().lerp(this.velocity, .2);

        this.velocity = 
            vec2(
                (this.pos.x < tileCollisionSize.x / 2 + 24 - 1 && this.pos.x > 24 + 1 ? this.last_move[4].x : Math.abs(this.last_move[4].x) * -Math.sign(this.pos.x - tileCollisionSize.x/2)),
                (this.pos.y < tileCollisionSize.y / 2 + 12 - 1 && this.pos.y > 12 + 1.75 ? this.last_move[4].y : Math.abs(this.last_move[4].y) * -Math.sign(this.pos.y - tileCollisionSize.y/2))
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

        this.tileIndex = 80  + this.sprite_frame + 16 * this.sprite;
    }
}