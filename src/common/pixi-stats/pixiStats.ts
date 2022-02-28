/**
 * how to use:
 * after call setUseStats(true) in game, press f
 *
 * FPS Frames rendered in the last second. The higher the number the better.
 * MS Milliseconds needed to render a frame. The lower the number the better.
 * MB MBytes of allocated memory. (Run Chrome with --enable-precise-memory-info)
 * DC Draw Calls made within one frame.
 * TC Texture Count used within one frame.
 * CUSTOM User-defined panel support.
 */
import { Application, Ticker, UPDATE_PRIORITY } from 'pixi.js';
import { addStats } from './stats';
import { StatsJSAdapter } from './stats-gl';

// 要打開的面板
const StatsSwith = [0, 3];

// 面板對應的index
enum StatsIndex {
    FPS = 0,
    RENDER,
    MEMORY,
    DRAWCALL,
    TEXTURE,
}

class PixiStats {
    private app: Application;
    private element: HTMLElement | null;
    private stats: StatsJSAdapter;
    private statsElements: HTMLElement[] = [];
    private isShow: boolean = false;
    private isUse: boolean = false;

    constructor() {}

    public setApp(app: Application) {
        //@ts-ignore
        window.Stats = this;
        this.app = app;
        this.stats = addStats(document, app);
        this.element = document.getElementById('stats');
        this.stats.hideAllPanel();

        for (let i = 0; i < this.element!.children.length; i++) {
            const element: HTMLElement = this.element!.children[i] as HTMLElement;
            this.statsElements.push(element);
        }
        this.setUseStats(true);
    }

    public setUseStats(isUse: boolean) {
        this.isUse = isUse;
        Ticker.shared.add(this.stats.update, this.stats, UPDATE_PRIORITY.UTILITY);

        // 鍵盤事件
        window.addEventListener('keydown', (event) => {
            if (event.key === 'f') {
                this.isShow ? this.hideAllPanel() : this.showPanel();
            }
        });
    }

    public showPanel(list: number[] = StatsSwith) {
        if (!this.isUse) return;

        this.isShow = true;
        this.stats.hideAllPanel();
        for (let i = 0; i < list.length; i++) {
            this.stats.showPanel(list[i]);
        }
        this.sortPanel();
    }

    public hidePanel() {
        if (!this.isUse) return;

        for (let i = 0; i < StatsSwith.length; i++) {
            this.stats.hidePanel(StatsSwith[i]);
        }
    }

    public hideAllPanel() {
        if (!this.isUse) return;

        this.stats.hideAllPanel();
        this.isShow = false;
    }

    private sortPanel() {
        let diffX: number = 0;
        let width: number = 200; // 面板的寬

        for (let i = 0; i < this.element!.children.length; i++) {
            const element: HTMLElement = this.element!.children[i] as HTMLElement;
            if (element.style.display === 'block') {
                element.style.left = diffX.toString();
                diffX += width;
            }
        }
    }
}

const pixiStats = new PixiStats();
export default pixiStats;
