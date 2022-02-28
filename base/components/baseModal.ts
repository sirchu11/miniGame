import { Container, Graphics } from 'pixi.js';
import ScreenManager, { SUBSCRIBE_TYPE } from '../tool/screenManager';
import gsap from 'gsap';

const MAX_SIZE = {
    width: 1493,
    height: 640
}
/**
 * 彈窗基礎元件, 預設生成mask & contentContainer。
 * 可客製open, close, initContent, reset方法
 */
export default abstract class BaseModal extends Container {
    public bgMask: Graphics;
    public contentContainer: Container;

    private isOpen: boolean = false;
    private anim: any;

    constructor() {
        super();
        this.handleResize = this.handleResize.bind(this);

        this.initMask();
        this.contentContainer = new Container();
        this.addChild(this.contentContainer);
        this.visible = false;
        ScreenManager.subscribe(this.handleResize, SUBSCRIBE_TYPE.GAME);
        this.handleResize();
    }

    /**
     * 生成背景Mask
     */
    private initMask() {
        this.bgMask = new Graphics();
        this.bgMask.beginFill(0x000000);
        this.bgMask.drawRect(0, 0, MAX_SIZE.width * 2, MAX_SIZE.height * 2);
        this.bgMask.endFill();
        this.bgMask.interactive = true;
        this.bgMask.alpha = 0.6;
        this.bgMask.position.set(-MAX_SIZE.width / 2, -MAX_SIZE.height / 2);
        this.addChild(this.bgMask);
    }

    /**
     * 將內容生成放入contentContainer中
     */
    public abstract initContent(): void;

    /**
     * 打開事件
     */
    public open() {
        if (this.isOpen)
            return;

        this.clearAnim();

        this.isOpen = true;
        this.reset();
        this.visible = true;
    }

    public openWithAnim() {
        if (this.isOpen)
            return;

        this.clearAnim();

        this.isOpen = true;
        this.reset();
        this.visible = true;

        let ANIMATION_DELAY = 0.02;     // 延遲 1~2 幀再播動畫, 避免同時建立畫面, 建立動畫導致掉幀
        this.bgMask.scale.set(2);
        gsap.to(this.bgMask, 0.5, {
            alpha: 0.6,
            delay: ANIMATION_DELAY,
            ease: 'none'
        });

        this.contentContainer.scale.set(0.5);
        let startScale = 1.09;
        let finalScale = 1;

        this.anim = gsap.timeline()
            .to(this.contentContainer.scale, 0.1, {
                x: startScale,
                y: startScale,
                delay: ANIMATION_DELAY,
                ease: 'none'
            })
            .to(this.contentContainer.scale, 0.1, {
                x: finalScale,
                y: finalScale,
                ease: 'none'
            });
    }

    /**
     * 關閉事件
     */
    public close() {
        if (!this.isOpen)
            return;

        this.clearAnim();

        this.isOpen = false;
        this.reset();
        this.visible = false;
    }

    public closeWithAnim() {
        if (!this.isOpen)
            return;

        this.clearAnim();
        this.isOpen = false;

        gsap.to(this.bgMask, 0.2, {
            alpha: 0,
            ease: 'none'
        });

        this.anim = gsap.timeline()
            .to(this.contentContainer.scale, 0.1, {
                x: 1.05,
                y: 1.05,
                ease: 'none'
            })
            .to(this.contentContainer.scale, 0.1, {
                x: 0,
                y: 0,
                ease: "power2.in",
                onComplete: () => {
                    this.reset();
                    this.visible = false;
                }
            });
    }

    public handleResize() {
        if (this.contentContainer) {
            this.contentContainer.position.set(MAX_SIZE.width / 2, MAX_SIZE.height / 2);
        }
    }

    /**
     * 開啟或關閉時會重置UI
     */
    public abstract reset(): void;

    public clearAnim() {
        if (this.anim) {
            this.anim.kill();
            this.anim = null;
        }
        gsap.killTweensOf(this.bgMask);
    }

    public destroy() {
        this.reset();
        this.clearAnim();
        super.destroy({ children: true });
        Object.keys(this).forEach(key => this[key] = null);
        ScreenManager.unSubscribe(this.handleResize, SUBSCRIBE_TYPE.GAME);
    }
}