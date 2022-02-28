import { Container, Sprite, Texture } from 'pixi.js';
import { ImageKey, SoundKey } from '../../../constants';
import ScreenManager from '@base/tool/screenManager';
import Button from '@base/components/button';
import Audio from '@base/tool/audio';
import gsap from 'gsap';

export default class TutorialView {
    public get Container(): Container { return this.container; }

    private container: Container = new Container();
    private bgSprite: Sprite;
    private colseBtn: Button;
    private rightBtn: Button;
    private leftBtn: Button;
    private containerAni: gsap.core.Animation;
    private pageA: Sprite;
    private pageB: Sprite;

    public Init() {
        this.bgSprite = this._creatBgSprite(ImageKey.bg_tutorial);
        this.colseBtn = new Button(ImageKey.btn_cancel);
        this.colseBtn.onTap = () => {
            Audio.playSound(SoundKey.sound_cancel);
            this.killTweens(this.containerAni);
            this.containerAni = gsap.to(this.container.scale, {
                duration: 1,
                x: -1,
                y: -1,
                onComplete: () => {
                    this.killTweens(this.containerAni);
                    this.resetView();
                }
            })
        };
        this.container.addChild(this.colseBtn);
        this.rightBtn = new Button(ImageKey.btn_right);
        this.rightBtn.onTap = () => {
            Audio.playSound(SoundKey.sound_putit);
            this.rightMoveAni();
        };
        this.container.addChild(this.rightBtn);
        this.leftBtn = new Button(ImageKey.btn_left);
        this.leftBtn.onTap = () => {
            Audio.playSound(SoundKey.sound_putit);
            this.leftMoveAni();
        };
        this.container.addChild(this.leftBtn);
        this.pageA = this._creatBgSprite(ImageKey.img_tutorialA);
        this.pageB = this._creatBgSprite(ImageKey.img_tutorialB);
        this.resetView();
    }

    public start() {
        this.container.visible = true;
        this.container.scale.set(1);
    }

    public handleResize() {
        this.bgSprite.width = ScreenManager.getWidth();
        this.bgSprite.height = ScreenManager.getHeight();
        this.colseBtn.position.set( ScreenManager.getWidth() / 2 * 1.7, ScreenManager.getHeight() / 2 * 0.15 );
        this.rightBtn.position.set( ScreenManager.getWidth() / 2 * 1.8, ScreenManager.getHeight() / 2 );
        this.leftBtn.position.set( ScreenManager.getWidth() / 2 * 0.2, ScreenManager.getHeight() / 2 );
        this.pageA.position.set( ScreenManager.getWidth() / 2 - this.pageA.width / 2, ScreenManager.getHeight() / 2 - this.pageA.height / 2 );
        this.pageB.position.set( ScreenManager.getWidth() / 2  - this.pageB.width / 2, ScreenManager.getHeight() / 2  - this.pageB.height / 2 );
    }

    private resetView() {
        this.container.visible = false;
        this.leftBtn.visible = false;
        this.pageB.visible = false;
        this.rightBtn.visible = true;
        this.pageA.visible = true;
        this.handleResize();
    }

    private rightMoveAni() {
        let moveTimeline = gsap.timeline();
        moveTimeline.add(() => {
            this.pageB.position.x = ScreenManager.getWidth();
            this.pageB.visible = true;
            this.rightBtn.visible = false;
            gsap.to(this.pageA, {
                duration: 0.9,
                x: - ScreenManager.getWidth(),
                ease: "none"
            })
        }).add(() => {
            gsap.to(this.pageB, {
                duration: 0.8,
                x: ScreenManager.getWidth() / 2  - this.pageB.width / 2,
                ease: "none",
                onComplete: () => {
                    this.killTweens(moveTimeline);
                    this.leftBtn.visible = true;
                    this.pageA.visible = false;
                }
            })
        })
    }

    private leftMoveAni() {
        let moveTimeline = gsap.timeline();
        moveTimeline.add(() => {
            this.pageA.visible = true;
            this.leftBtn.visible = false;
            gsap.to(this.pageB, {
                duration: 0.8,
                x: ScreenManager.getWidth(),
                ease: "none"
            })
        }).add(() => {
            gsap.to(this.pageA, {
                duration: 0.9,
                x: ScreenManager.getWidth() / 2  - this.pageA.width / 2,
                ease: "none",
                onComplete: () => {
                    this.killTweens(moveTimeline);
                    this.rightBtn.visible = true;
                }
            })
        })
    }

    private _creatBgSprite(textureName: string) {
        let sprite = new Sprite(Texture.from(textureName));
        this.container.addChild(sprite);
        return sprite;
    }

    private killTweens(target: any) {
        if (!target) return;
        gsap.killTweensOf(target);
    }
}