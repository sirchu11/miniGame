import { Application } from 'pixi.js';
import { PIXIHooks, StatsJSAdapter } from './stats-gl';
import { Panel } from './stats-panel';

export class Stats {
    static Panel = Panel;

    beginTime: number;
    prevTime: number;
    frames: number;
    domElement: HTMLDivElement;
    fpsPanel: Panel;
    msPanel: Panel;
    memPanel?: Panel;

    setMode = this.showPanel;

    constructor() {
        this.domElement = document.createElement('div');
        this.domElement.id = 'stats';

        this.beginTime = (performance || Date).now();
        this.prevTime = this.beginTime;
        this.frames = 0;

        this.fpsPanel = this.addPanel(new Stats.Panel('FPS', '#3ff', '#002'));
        this.msPanel = this.addPanel(new Stats.Panel('MS', '#0f0', '#020'));

        if (performance && (performance as any).memory) {
            this.memPanel = this.addPanel(new Stats.Panel('MB', '#f08', '#200'));
        }
    }

    addPanel(panel: Panel): Panel {
        this.domElement.appendChild(panel.dom);

        return panel;
    }

    showPanel(id: number) {
        const element: HTMLElement = this.domElement.children[id] as HTMLElement;
        element.style.display = 'block';
    }

    hidePanel(id: number) {
        const element: HTMLElement = this.domElement.children[id] as HTMLElement;
        element.style.display = 'none';
    }

    hideAllPanel() {
        for (let i = 0; i < this.domElement.children.length; i++) {
            const element: HTMLElement = this.domElement.children[i] as HTMLElement;
            element.style.display = 'none';
        }
    }

    begin(): void {
        this.beginTime = (performance || Date).now();
    }

    end(): number {
        this.frames++;

        const time: number = (performance || Date).now();

        this.msPanel.update(time - this.beginTime, 200);

        if (time > this.prevTime + 1000) {
            this.fpsPanel.update((this.frames * 1000) / (time - this.prevTime), 100);

            this.prevTime = time;
            this.frames = 0;

            if (this.memPanel) {
                const memory: any = (performance as any).memory;
                this.memPanel.update(memory.usedJSHeapSize / 1048576, memory.jsHeapSizeLimit / 1048576);
            }
        }

        return time;
    }

    update(): void {
        this.beginTime = this.end();
    }
}

export function addStats(document: Document, app: Application): StatsJSAdapter {
    const stats: Stats = new Stats();
    const pixiHooks: PIXIHooks = new PIXIHooks(app);
    const adapter: StatsJSAdapter = new StatsJSAdapter(pixiHooks, stats);

    document.body.appendChild(adapter.stats!.domElement);

    return adapter;
}
