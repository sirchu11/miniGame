import { Sprite, Texture, BLEND_MODES } from 'pixi.js';
import gsap from 'gsap';
import Audio from '../tool/audio';

const HIGH_LIGHT_ALPHA = 100 / 255;

interface IOptions {
    preventQuickClick?: boolean; // 防止连点
    clickIntervel?: number; // 连点间隔
    needAnim?: boolean; // 是否需要點擊特效
    needShine?: boolean; // 是否需要發亮特效
    needSound?: boolean;
}

class Button extends Sprite {
    private canEmit = false;
    private canClick = true;
    private needShine = true;
    private needAnim = true;
    private needSound = true;
    private blendSprite: Sprite;
    private initScale: { x: number, y: number };//按钮按下时的大小
    private recordPos: any;
    public onTap: (event: any) => void = () => { /* dosomething */ };
    public onPointerDown: (event: any) => void = () => { /* dosomething */ };
    public onPointerCancel: (event: any) => void = () => { /* dosomething */ };
    public onPointerMove: (event: any) => void = () => { /* dosomething */ };
    public onPointerOut: (event: any) => void = () => { /* dosomething */ };
    public onPointerUpOutSide: (event: any) => void = () => { /* dosomething */ };

    public constructor(source: Texture | string, options?: IOptions, anchor: { x: number, y: number } = { x: 0.5, y: 0.5 }) {
        super();
        let { preventQuickClick = true, clickIntervel = 300, needAnim = true, needShine = true, needSound = true } = options || {};
        const texture = source instanceof Texture ? source : Texture.from(source);
        this.texture = texture;
        this.anchor.set(anchor.x, anchor.y);
        this.interactive = true;
        this.buttonMode = true;
        this.needShine = needShine;
        this.needSound = needSound;
        this.needAnim = needAnim;
        if (needShine) {
            this.blendSprite = this.createBlendSprite();
        }

        const downEffect = () => {
            this.initScale = { x: this.scale.x, y: this.scale.y };//记录初始大小
            gsap.to(this.scale, 0.1, {
                x: this.initScale.x * 0.9,
                y: this.initScale.y * 0.9,
            });
            if (this.needSound) {
                Audio.playSound('base/res/sound_mp3/click.mp3', false);
            }
        };

        const upEffect = () => {
            if (!this.initScale)
                return;
            gsap.to(this.scale, 0.1, {
                x: this.initScale.x,
                y: this.initScale.y,
            });
        };

        this.on('pointerdown', (event) => {
            if (preventQuickClick) {
                if (!this.canClick)
                    return;
                this.canClick = false;
            }

            this.canEmit = true;
            this.recordPos = this.getGlobalPosition();
            if (this.needAnim) {
                downEffect();
            }
            if (this.needShine) {
                this.blendSprite.visible = true;
            }
            this.onPointerDown(event);
            // 防止连续点击
            if (preventQuickClick) {
                setTimeout(() => {
                    this.canClick = true;
                }, clickIntervel);
            }
        });

        this.on('pointerup', (event: any) => {
            if (!this.canEmit)
                return;
            this.canEmit = false;
            if (this.needAnim) {
                upEffect();
            }
            if (this.needShine) {
                this.blendSprite.visible = false;
            }
            this.onTap(event);
        });

        this.on('pointercancel', (event: any) => {
            if (!this.canEmit)
                return;
            this.canEmit = false;
            if (this.needAnim) {
                upEffect();
            }
            if (this.needShine) {
                this.blendSprite.visible = false;
            }
            this.onPointerCancel(event);
        });

        this.on('pointermove', (event: any) => {
            if (!this.canEmit)
                return;
            const isContain = this.containsPoint(event.data.global);
            if (isContain) {
                this.onPointerMove(event);
            }
            let currentPos = this.getGlobalPosition();
            let cancelClick = false;
            if (Math.abs(currentPos.x - this.recordPos.x) > 5 || Math.abs(currentPos.y - this.recordPos.y) > 5)
                cancelClick = true;
            if (!isContain || cancelClick) {
                this.canEmit = false;
                if (this.needAnim) {
                    upEffect();
                }
                if (this.needShine) {
                    this.blendSprite.visible = false;
                }
            }
        });

        this.on('pointerout', (event: any) => {
            if (!this.canEmit)
                return;
            this.canEmit = false;
            if (this.needAnim) {
                upEffect();
            }
            if (this.needShine) {
                this.blendSprite.visible = false;
            }
            this.onPointerOut(event);
        });

        this.on('pointerupoutside', (event: any) => {
            if (!this.canEmit)
                return;
            let currentPos = this.getGlobalPosition();
            if (Math.abs(currentPos.x - this.recordPos.x) <= 3 && Math.abs(currentPos.y - this.recordPos.y) <= 3) {
                this.emit('pointerup');
                return;
            }
            this.canEmit = false;
            if (this.needAnim) {
                upEffect();
            }
            if (this.needShine) {
                this.blendSprite.visible = false;
            }
            this.onPointerUpOutSide(event);
        });
    }

    private createBlendSprite(): Sprite {
        let sprite = new Sprite();
        sprite.anchor.set(0.5);
        sprite.visible = false;
        sprite.texture = this.texture;
        sprite.alpha = HIGH_LIGHT_ALPHA;
        sprite.blendMode = BLEND_MODES.ADD;
        this.addChild(sprite);
        return sprite;
    }

    public changeSprite(source: Texture | string) {
        let texture = source instanceof Texture ? source : Texture.from(source);
        this.texture = texture;
        if (this.blendSprite) {
            this.blendSprite.texture = this.texture;
        }
    }

    public changeSetting(options: IOptions) {
        let { needAnim = true, needSound = true, needShine = true } = options;
        this.needAnim = needAnim;
        this.needShine = needShine;
        this.needSound = needSound;
    }

    public setButtonEnabled(enabled: boolean) {
        this.buttonMode = enabled;
        this.interactive = enabled;
    }

    public changeBlendSpriteAlpha(alpha: number) {
        this.blendSprite.alpha = alpha;
    }

    public setBlendAnchor(x: number, y: number) {
        if (this.blendSprite) {
            this.blendSprite.anchor.set(x, y);
        }
    }

    public destroy() {
        gsap.killTweensOf(this);
        gsap.killTweensOf(this.position);
        super.destroy({ children: true });
    }
}

export default Button;
