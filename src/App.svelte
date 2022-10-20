<script lang="ts">
    import { Player } from "./classes/Player";

    // popup errors if there are any (help diagnose issues on mobile devices)
    onerror = (...parameters)=> alert(parameters);

    let player: Player;

    ///////////////////////////////////////////////////////////////////////////////
    function gameInit()
    {
        // create tile collision and visible tile layer
        initTileCollision(vec2(48, 24));
        const tileLayer = new TileLayer(vec2(), tileCollisionSize);

        // get level data from the tiles image
        const imageLevelDataRow = 1;
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

        // player = new EngineObject(vec2(tileCollisionSize.x / 2, tileCollisionSize.y / 2), vec2(1, 1), 8, vec2(16, 16));
        // player.setCollision(true, false, true);
        // weapon = new EngineObject(vec2(0, 0), vec2(1, 1), 11, vec2(16, 16), 90);

        // player.addChild(
        //     weapon,
        //     vec2(.6, .2),
        //     0
        // );

        player = new Player(vec2(tileCollisionSize.x / 2, tileCollisionSize.y / 2));

    }

    ///////////////////////////////////////////////////////////////////////////////
    function gameUpdate()
    {

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
</script>

<style>

</style>