export class Player {
    private xv = 0;
    private yv = 0;

    x = 0;
    y = 0;

    private keys = new Map<string, boolean>();

    constructor(canvas: HTMLCanvasElement) {
        canvas.addEventListener("mousemove", ev => this.mousemove(ev));
        canvas.addEventListener("mousedown", ev => this.mousedown(ev));
        canvas.addEventListener("mouseup", ev => this.mouseup(ev));
        canvas.addEventListener("contextmenu", ev => this.contextmenu(ev));
        window.addEventListener("keydown", ev => this.keydown(ev));
        window.addEventListener("keyup", ev => this.keyup(ev));
    }

    tick(dT: number) {
        this.xv += this.keys.get("KeyA") ? 0.05 : 0 * dT;
        this.xv -= this.keys.get("KeyD") ? 0.05 : 0 * dT;
        this.yv += this.keys.get("KeyW") ? 0.05 : 0 * dT;
        this.yv -= this.keys.get("KeyS") ? 0.05 : 0 * dT;

        this.xv = this.xv >= 0 ? Math.min(this.xv, 1) : Math.max(this.xv, -1);
        this.yv = this.yv >= 0 ? Math.min(this.yv, 1) : Math.max(this.yv, -1);

        this.xv /= 1.2;
        this.yv /= 1.2;

        this.x += this.xv * dT;
        this.y += this.yv * dT;
    }
    
    private mousemove(ev: MouseEvent) {
        // if (this._mouseButton == 1 || this._mouseButton == 0 && this._altKey) {
        //     this._dragX += ev.movementX;
        //     this._dragY += ev.movementY;
        // }

        // this._mouseX = ev.x;
        // this._mouseY = ev.y - 50;
    }
    
    private mousedown(ev: MouseEvent) {
        // this._mouseButton = ev.button;
    }
    
    private mouseup(_ev: MouseEvent) {
        // this._mouseButton = -1;
    }

    private contextmenu(ev: MouseEvent) {
        ev.preventDefault();
    }

    private keydown(ev: KeyboardEvent) {
        // this.altKey = ev.altKey;
        // this.ctrlKey = ev.ctrlKey;
        // this.shiftKey = ev.shiftKey;

        this.keys.set(ev.code, true);
    }

    private keyup(ev: KeyboardEvent) {
        // this.altKey = ev.altKey;
        // this.ctrlKey = ev.ctrlKey;
        // this.shiftKey = ev.shiftKey;

        this.keys.delete(ev.code);
    }
}