import { Graphics, Container } from 'pixi.js';
import ScreenManager from '@base/tool/screenManager';
import gsap from 'gsap';

const SWALLOW_LAYER_ZORDER = 15;

export default class PopupManager{
    private parent: Container;
    private popupNode: Container;
    private swallowLayer: any;

    constructor(parent: Container, popupNode: Container){
        this.parent = parent;
        this.popupNode = popupNode;
        this.swallowLayer = null;
        this.popupNode.visible = false;
    };

    public handleResize() {
        if(this.swallowLayer) {
            this.swallowLayer.width = ScreenManager.getWidth();
            this.swallowLayer.height = ScreenManager.getHeight();
        }
        this.popupNode.position.y = ScreenManager.getHeight() / 2 - this.popupNode.height / 2;
    }

    public showPopupEffect(){
        this.popupNode.visible = true;
        let swallowLayer = this.swallowLayer || this._getSwallowLayer();
        this.swallowLayer = swallowLayer;
        gsap.to(swallowLayer, {alpha: 0.5, duration: 0.5, ease: "none"})
        gsap.fromTo(this.popupNode.position, { y: ScreenManager.getHeight() },
        {y: ScreenManager.getHeight() / 2 - this.popupNode.height / 2, duration: 1, ease: "none", onComplete: () => {
            gsap.killTweensOf(swallowLayer);
            gsap.killTweensOf(this.popupNode.position);
        }})
    };

    public showCloseEffect(){
        let swallowLayer = this.swallowLayer || this._getSwallowLayer();
        this.swallowLayer = swallowLayer;
        let timeLine = gsap.timeline();
        timeLine.add(() => {
            if (!this.swallowLayer)
                return;
            this.swallowLayer.destroy(true);
            this.swallowLayer = null;
            this.popupNode.visible = false;
        });
    };

    private _getSwallowLayer(){
        let swallowLayer = new Graphics();
        swallowLayer.beginFill(0x000000);
        swallowLayer.drawRect(0, 0, ScreenManager.getWidth(), ScreenManager.getHeight());
        swallowLayer.endFill();
        swallowLayer.interactive = true;
        swallowLayer.alpha = 0;
        this.parent.addChildAt(swallowLayer, SWALLOW_LAYER_ZORDER);
        return swallowLayer;
    };
};
