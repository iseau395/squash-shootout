import { Enemy } from "./classes/Enemy";
import { Player } from "./classes/Player";

// popup errors if there are any (help diagnose issues on mobile devices)
onerror = (...parameters)=> alert(parameters);

export let player: Player;
export const enemy_bullets: EngineObject[] = [];

const enemies: Enemy[] = [];

///////////////////////////////////////////////////////////////////////////////
function setTile(tileLayer: TileLayer, pos: Vector2, tileIndex: number) {
    const position = pos.multiply(vec2(2, 2));

    tileLayer.setData(position.add(vec2(0, 0)), new TileLayerData(tileIndex * 2 + 32, 0));
    tileLayer.setData(position.add(vec2(1, 0)), new TileLayerData(tileIndex * 2 + 33, 0));
    tileLayer.setData(position.add(vec2(0, 1)), new TileLayerData(tileIndex * 2 + 0, 0));
    tileLayer.setData(position.add(vec2(1, 1)), new TileLayerData(tileIndex * 2 + 1, 0));
}

function gameInit()
{
    // create tile collision and visible tile layer
    initTileCollision(vec2(48 * 2, 24 * 2));
    const tileLayer = new TileLayer(vec2(), tileCollisionSize);

    // get level data from the tiles image
    mainContext.drawImage(tileImage, 0, 0);

    for(let x = 0; x < tileCollisionSize.x / 2 - 2; x++) {
        setTile(tileLayer, vec2(1 + x, 0), 38);
        setTile(tileLayer, vec2(1 + x, tileCollisionSize.y / 2 - 1), 38);

        for(let y = 0; y < tileCollisionSize.y / 2 - 2; y++) {
            const tile = randInt(6);

            setTile(tileLayer, vec2(1 + x, 1 + y), 64 + tile);
        }
    }
    
    for(let y = 0; y < tileCollisionSize.y / 2 - 2; y++) {
        setTile(tileLayer, vec2(0, 1 + y), 36);
        setTile(tileLayer, vec2(tileCollisionSize.y - 1, 1 + y), 37);
    }

    setTile(tileLayer, vec2(0, 0), 32);
    setTile(tileLayer, vec2(0, tileCollisionSize.y / 2 - 1), 33);
    setTile(tileLayer, vec2(tileCollisionSize.x / 2 - 1, 0), 34);
    setTile(tileLayer, vec2(tileCollisionSize.x / 2 - 1, tileCollisionSize.y / 2 - 1), 35);

    tileLayer.scale = vec2(.5, .5);
    tileLayer.redraw();
    tileLayer.pos = vec2(48 / 2, 24 / 2);

    // move camera to center of collision
    cameraScale = 64;

    for (let i = 0; i < 30; i++) {
        enemies.push(new Enemy(vec2(tileCollisionSize.x / 2 + randInt(0, 30) - 15, tileCollisionSize.y / 2 + randInt(0, 30) - 15), 0));
    }
    // for (let i = 0; i < 50; i++) {
    //     enemies.push(new Enemy(vec2(tileCollisionSize.x * rand(0, 1), tileCollisionSize.y * rand(0, 1)), 0));
    // }
    

    player = new Player(vec2(tileCollisionSize.x / 2, tileCollisionSize.y / 2));
}

///////////////////////////////////////////////////////////////////////////////
let tick = 0;
let kills = 0;

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

    if (player.destroyed)
        paused = 1;

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
            kills++;
            enemies.splice(e_i, 1);
        }
    });

    if (tick % 20 == 0 && enemies.length < 50)
        enemies.push(new Enemy(vec2(tileCollisionSize.x / 2 + randInt(0, 30) - 15, tileCollisionSize.y / 2 + randInt(0, 30) - 15), 0));

    tick++;
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost()
{

}

///////////////////////////////////////////////////////////////////////////////
let last_camera = vec2(NaN, NaN);
function gameRender()
{
    if (isNaN(last_camera.x) && isNaN(last_camera.y))
        last_camera = player.pos;

    last_camera = last_camera.lerp(player.pos.subtract(player.velocity.multiply(vec2(5, 5))), .04);
    cameraPos = last_camera;

    drawTextScreen(
        `Time: ${Math.floor((time / 60) % 60)}:${Math.floor(time % 60).toString().padStart(2, "0")}\nHealth: ${player.health}\nKills: ${kills}`,
        vec2(15, 30), 30, new Color, 100, new Color(0, 0, 0, 0), "left"
    );

    if (paused)
        drawTextScreen("You Died!\nReload to try again", vec2(window.innerWidth / 2, window.innerHeight / 2 - 50), 100, new Color(1, 0, 0, 1));
}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost()
{

}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, 'media/tiles.png');