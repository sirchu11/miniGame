import BaseHooks from '@jacekpietal/gstats/dist/BaseHooks';
import { Application, GLTexture, Renderer } from 'pixi.js';
import { Panel } from './stats-panel';
import { Stats } from './stats';

export class StatsJSAdapter {
    stats!: Stats;
    hook: any;
    dcPanel!: Panel;
    tcPanel!: Panel;

    constructor(hook: any, stats?: Stats) {
        this.hook = hook;

        if (stats) {
            this.stats = stats;
        } else if ((window as any).Stats) {
            this.stats = new (window as any).Stats();
        }

        if (this.stats) {
            this.dcPanel = this.stats.addPanel(new Panel('DC', '#f60', '#300'));
            this.tcPanel = this.stats.addPanel(new Panel('TC', '#0c6', '#033'));

            this.stats.showPanel(0);
        } else {
            throw new Error("Stats can't found in window, pass instance of Stats.js as second param");
        }
    }

    showPanel(id: number) {
        this.stats.showPanel(id);
    }

    hidePanel(id: number) {
        this.stats.hidePanel(id);
    }

    hideAllPanel() {
        this.stats.hideAllPanel();
    }

    update(): void {
        if (this.stats) {
            if (this.hook) {
                this.dcPanel.update(this.hook.deltaDrawCalls, Math.max(50, this.hook.maxDeltaDrawCalls));
                this.tcPanel.update(this.hook.texturesCount, Math.max(20, this.hook.maxTextureCount));
            }

            this.stats.update();
        }
    }

    reset(): void {
        if (this.hook) this.hook.reset();
    }
}

export class PIXIHooks extends BaseHooks {
    constructor(app: Application) {
        super();

        if (!app) {
            console.error('[PIXI Hooks] missing PIXI.Application');

            return;
        }

        if (app.renderer instanceof Renderer) {
            this.attach(app.renderer.gl);

            const startTextures = app.renderer.texture.managedTextures;

            if (!startTextures || !this.texturehook) {
                console.error('[PIXI Hooks] !startTextures || !this.texturehook');
            } else {
                console.log('[PIXI Hooks] Collect used textures:', startTextures.length);

                for (let i = 0; i < startTextures.length; i++) {
                    const txr = startTextures[i];
                    const gltextures = txr._glTextures;
                    Object.values(gltextures).forEach((glTexture: GLTexture) => {
                        if ((glTexture as any).gl === (app.renderer as Renderer).gl) {
                            this.texturehook!.registerTexture(glTexture.texture);
                        }
                    });
                }
            }
        } else {
            console.error('[PIXI Hook] Canvas renderer is not allowed');
        }
    }
}
