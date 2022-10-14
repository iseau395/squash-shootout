<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { Player } from "./classes/Player";
    import { images, image_load } from "./media";

    let canvas: HTMLCanvasElement;

    let animation_frame: number;
    let tick_timeout: NodeJS.Timer;

    onMount(async () => {
        await image_load();
        canvas.innerText = "";
        const ctx = canvas.getContext("2d");

        const player = new Player(canvas);

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            render();
        }
        window.addEventListener("resize", resize);
        resize();

        let last_tick = Date.now();
        function tick() {
            const now = Date.now();
            const dT = now - last_tick;

            player.tick(dT);

            last_tick = now;
        }

        function render() {
            const ptrn = ctx.createPattern(images.get("bg_image"), 'repeat');
            ptrn.setTransform({
                e: player.x % 1028,
                f: player.y % 1028
            });
            ctx.fillStyle = ptrn;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.drawImage(images.get("rumpkin"), canvas.width / 2 - 32, canvas.height / 2 - 32)

            animation_frame = requestAnimationFrame(render);
        };

        setInterval(tick, 50);
    });

    onDestroy(() => {
        cancelAnimationFrame(animation_frame);
        clearTimeout(tick_timeout);
    });

</script>

<canvas bind:this={canvas}>
    Loading...
</canvas>

<style>

</style>