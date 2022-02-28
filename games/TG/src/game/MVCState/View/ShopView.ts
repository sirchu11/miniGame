import { Container, Sprite, Texture } from 'pixi.js';
import { ImageKey, GameEvent, SoundKey } from '../../../constants';
import Format from 'string-format';
import ScreenManager from '@base/tool/screenManager';
import Button from '@base/components/button';
import { EventManager, EventMessage } from '@base/tool/eventManager';
import PlayerPrefs from '@base/tool/playerPrefs';
import Audio from '@base/tool/audio';
import gsap from 'gsap';

const mainroleIdle = [11, 21, 31, 41, 51, 61];
const mainroleIdle_2 = [12, 22, 32, 42, 52, 62];

export default class shopView {
    public get Container(): Container { return this.container; }

    private container: Container = new Container();
    private unuseBtnAni: gsap.core.Timeline;
    private currentUnuseBtn: Button;
    private unuseBtnArr: Array<Button> = [];

    public Init() {
        let shopBg = this._creatSprite(ImageKey.board_shop);
        let cancelBtn = new Button(ImageKey.btn_cancel);
        cancelBtn.onTap = () => {
            Audio.playSound(SoundKey.sound_cancel);
            this.close();
        }
        cancelBtn.position.set(shopBg.width, shopBg.height / 2 * 0.2);
        this.container.addChild(cancelBtn);

        for(let i = 0; i < 6; i++) {
            let unuseBtn = new Button(ImageKey.btn_unuse);
            this.unuseBtnArr.push(unuseBtn);
            let bird = this._creatSprite(Format(ImageKey.img_mainrole_idle, mainroleIdle[i]));
            unuseBtn.onTap = () => {
                Audio.playSound(SoundKey.sound_tap_tile);
                if(this.unuseBtnAni) this.unuseBtnAni.kill();
                EventManager.SendMessage(GameEvent.CHANGE_BIRD_SKIN, new EventMessage({
                    skin: [mainroleIdle[i], mainroleIdle_2[i]],
                    id: i
                }));
                if(this.currentUnuseBtn && this.currentUnuseBtn !== unuseBtn) {
                    unuseBtn.changeSprite(ImageKey.btn_onuse);
                    this.currentUnuseBtn.changeSprite(ImageKey.btn_unuse);
                }
                this.currentUnuseBtn = unuseBtn;
            }
            unuseBtn.onPointerDown = () => {
                if(this.unuseBtnAni) this.unuseBtnAni.kill();
                this.unuseBtnAni = gsap.timeline();
                this.unuseBtnAni.add(() => {
                    gsap.fromTo(unuseBtn, {y: "+=10"}, {y: "-=10", duration: 0.01, clear: "y", repeat: 20});
                    gsap.fromTo(unuseBtn, {x: "+=10"}, {x: "-=10", duration: 0.01, clear: "x", repeat: 20});
                })
            }
            if( i > 2) {
                unuseBtn.position.set(shopBg.width * ((i - 3) * 0.28 + 0.22) , shopBg.height / 2 * 1.5);
                bird.position.set(shopBg.width * ((i - 3) * 0.28 + 0.1) , shopBg.height / 2 * 1.35);
            } else {
                unuseBtn.position.set(shopBg.width * (i * 0.28 + 0.22) , shopBg.height / 2 * 0.8);
                bird.position.set(shopBg.width * (i * 0.28 + 0.1) , shopBg.height / 2 * 0.65);
            }
            this.container.addChild(unuseBtn);
            this.container.addChild(bird);
        }

        this.resetView();
    }

    public start() {
        this.container.visible = true;
        let startAni = gsap.fromTo(this.container, {y: - ScreenManager.getHeight() }, {y: ScreenManager.getHeight() / 2  - this.Container.height / 2, duration: 0.5, onComplete: () => {
            this.killTweens(startAni);
        }});
        let birdSkin = PlayerPrefs.Get('BirdSkin');
        this.unuseBtnArr[birdSkin.id].changeSprite(ImageKey.btn_onuse);
        this.currentUnuseBtn = this.unuseBtnArr[birdSkin.id];
    }

    public close() {
        let closeAni = gsap.to(this.container, {y: - ScreenManager.getHeight(), duration: 0.5, onComplete: () => {
            this.killTweens(closeAni);
            this.container.visible = false;
        } });
    }

    public resetView() {
        this.container.visible = false;
    }

    private _creatSprite(textureName: string) {
        let sprite = new Sprite(Texture.from(textureName));
        this.container.addChild(sprite);
        return sprite;
    }

    private killTweens(target: any) {
        if (!target) return;
        gsap.killTweensOf(target);
    }
}