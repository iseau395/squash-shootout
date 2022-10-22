import { Enemy } from "./classes/Enemy";
import { Player } from "./classes/Player";

// popup errors if there are any (help diagnose issues on mobile devices)
onerror = (...parameters)=> alert(parameters);

export let player: Player;
export const enemy_bullets: EngineObject[] = [];

const enemies: Enemy[] = [];

///////////////////////////////////////////////////////////////////////////////
function gameInit()
{
    // create tile collision and visible tile layer
    initTileCollision(vec2(48, 24));
    const tileLayer = new TileLayer(vec2(), tileCollisionSize);

    // get level data from the tiles image
    mainContext.drawImage(tileImage, 0, 0);
    // setTileCollisionData(pos, 1);

    const mirror = randInt(2);
    for(let x = 0; x < tileCollisionSize.x; x++) {
        for(let y = 0; y < tileCollisionSize.y; y++) {
            const data = new TileLayerData(Math.max(randInt(30) - 26, 0), 0, Boolean(mirror));
            tileLayer.setData(vec2(x, y), data);
        }
    }
    tileLayer.redraw();

    // move camera to center of collision
    cameraPos = tileCollisionSize.scale(.5);
    cameraScale = 32;

    const store = new EngineObject(vec2(tileCollisionSize.x / 2, tileCollisionSize.y / 2 + 2), vec2(2, 2), 3, vec2(32, 32));
    store.setCollision(false, true, false);

    // for (let i = 0; i < 30; i++) {
    //     enemies.push(new Enemy(vec2(tileCollisionSize.x / 2 + randInt(0, 30) - 15, tileCollisionSize.y / 2 + randInt(0, 30) - 15), 0));
    // }
    for (let i = 0; i < 50; i++) {
        enemies.push(new Enemy(vec2(tileCollisionSize.x * rand(0, 1), tileCollisionSize.y * rand(0, 1)), 0));
    }

    player = new Player(vec2(tileCollisionSize.x / 2, tileCollisionSize.y / 2));

}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate()
{
    enemy_bullets.forEach((b, i) => {
        if (time - b.spawnTime > .5 && !b.destroyed) {
            b.destroy();
            enemy_bullets.splice(i, 1);
            return;
        }

        if (Math.abs(b.pos.x - player.pos.x) < .4 && Math.abs(b.pos.y - player.pos.y) < .4) {
            player.damage(1);
            b.destroy();
            enemy_bullets.splice(i, 1);
            return;
        }
    });

    enemies.forEach((enemy, e_i) => {
        let closest_distance = 1;
        let closest = vec2();

        check: for (const e of enemies) {
            if (e == enemy) continue check;
            if (enemy.pos.distance(e.pos) < closest_distance) {
                closest_distance = enemy.pos.distance(e.pos);
                closest = e.pos;
            }
        }

        if (closest_distance < 1)
            enemy.isTooClose(true, closest);
        else 
            enemy.isTooClose(false, closest);

        player.bullets.forEach((b, i) => {
            if (b.destroyed)
                return;

            if (Math.abs(b.pos.x - enemy.pos.x) < .5 && Math.abs(b.pos.y - enemy.pos.y) < .5) {
                enemy.damage(1);
                b.destroy();
                player.bullets.splice(i, 1);
            }
        });

        if (enemy.destroyed) {
            enemies.splice(e_i, 1);
        }
    });
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost()
{

}

///////////////////////////////////////////////////////////////////////////////
function gameRender()
{
    drawText(`Health: ${player.health}`, vec2(.25, tileCollisionSize.y - .75), 1, new Color(0, 0, 0, 1), 100, new Color(0, 0, 0, 0), "left");
}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost()
{

}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, 'media/tiles.png');