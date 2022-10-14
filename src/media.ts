
export const images = new Map([
    ["bg_image", new Image(1028, 1028)],
    ["rumpkin", new Image(64, 64)]
]);


images.get("bg_image").src = "media/ground.png";
images.get("rumpkin").src = "media/rumpkin.png";


let loaded_count = 0;

let on_load = () => {};

export function image_load() {
    console.log ("start wait...");
    return new Promise<void>((resolve, reject) => {
        on_load = resolve;
    })
}


function load() {
    loaded_count++;
    console.log(loaded_count, images.size);

    if (loaded_count == images.size) {
        console.log("loaded");
        on_load();
    }
}

images.forEach((image) => image.onload = load);