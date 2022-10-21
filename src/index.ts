// // @ts-ignore
// import App from './App.svelte';

// new App({
//     target: document.body
// });


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
    for (let i = 0; i < 30; i++) {
        enemies.push(new Enemy(vec2(tileCollisionSize.x * rand(0, 1), tileCollisionSize.y * rand(0, 1)), 0));
    }

    player = new Player(vec2(tileCollisionSize.x / 2, tileCollisionSize.y / 2));

}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate()
{
    enemy_bullets.forEach((v, i) => {
        if (time - v.spawnTime > .5 && !v.destroyed) {
            v.destroy();
            enemy_bullets.splice(i, 1);
        }
    });

    console.log(enemies.length);

    for (const enemy of enemies) {
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
    };

    enemies.forEach(e => e.update());
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost()
{

}

///////////////////////////////////////////////////////////////////////////////
function gameRender()
{
}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost()
{

}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, 'media/tiles.png');