import { Container, Sprite, Texture, Text } from 'pixi.js';
import IViewBase from '../../IViewBase';
import { ImageKey, GameEvent, SoundKey } from '../../../constants';
import { SceneState } from '../../GameManger';
import { GameState } from '../Controller/StartGameController';
import TutorialView from '../View/TutorialView';
import ShopView from './shopView';
import PuzzleView from '../View/PuzzleView';
import PopupManager from '../View/PopupManager';
import ScreenManager from '@base/tool/screenManager';
import Button from '@base/components/button';
import Logger, { LogType } from '@base/tool/logger';
import { EventManager, EventMessage } from '@base/tool/eventManager';
import ColliderManager from '@base/collider/colliderManager';
import TimeManager from '@base/tool/timeManager';
import PlayerPrefs from '@base/tool/playerPrefs';
import Audio from '@base/tool/audio';
import gsap from 'gsap';

export enum TransferAniType {
    HomeToGame = 0,
    GameToHome = 1,
    TutorialToHome = 2,
}

export default class MainView extends Container implements IViewBase {
    private bgSprite: Sprite;
    private playBtn: Button;
    private musicBtn: Button;
    private pauseMusicBtn: Button;
    private shopBtn: Button;
    private tutorialBtn: Button;
    private pauseBtn: Button;
    private logo: Sprite;
    private homeObjArr: Array<any> = new Array();
    private startObjArr: Array<any> = new Array();
    private playLogoAni: gsap.core.Animation;
    private transitionImg: Sprite;
    private fadeOutAni: gsap.core.Animation;
    private fadeInAni: gsap.core.Animation;
    private countDownSprite: Sprite;
    private countDownText: Text;
    private puzzleView: PuzzleView;
    private gameStage: Sprite;
    private stageText: Text;
    private stagehis: Sprite;
    private tutorialView: TutorialView;
    private clickMusicBtn: boolean = false;
    private pausePop: PopupManager;
    private overPop: PopupManager;
    private pausePopView: Container;
    private overPopView: Container;
    private levelText: Text;
    private shopView: ShopView;
    private isVisible: boolean;
    private finalPopView: Container;
    private finalPop: PopupManager;

    public Init(...params: any[]): void {
        this.bgSprite = this._creatBgSprite(ImageKey.game_bg_start);
        this.logo = this._creatSprite(ImageKey.logo);
        this.homeObjArr.push(this.logo);
        this.setupPlayBtn();
        this.setupMusicBtn();
        this.setupShopBtn();
        this.setupTutorialBtn();
        this.setupPauseBtn();
        this.setupCountDown();
        this.setupPuzzleView();
        this.setupStagehisText();
        this.setupGameStage();
        this.setupTutorialView();
        this.setupTransitionImg();
        this.setupColliderManager();
        this.setupShopView();
        this.setupPausePop();
        this.setupOverPop();
        this.setupFinalPop();
        this.sortChildren();
    }

    public SetActive(bool: boolean): void {
        Logger.Log(LogType.Client, 'UI可視: ' + bool);
    }

    public Clear(): void {
        Logger.Log(LogType.Client, 'UI清除');
    }

    public handleResize() {
        this.bgSprite.width = ScreenManager.getWidth();
        this.bgSprite.height = ScreenManager.getHeight();
        this.playBtn.position.set(ScreenManager.getWidth() / 2, ScreenManager.getHeight() / 2 * 1.45);
        this.musicBtn.position.set(ScreenManager.getWidth() / 2 * 1.7, ScreenManager.getHeight() / 2 * 0.2);
        this.shopBtn.position.set(ScreenManager.getWidth() / 2 * 0.2, ScreenManager.getHeight() / 2 * 0.2);
        this.tutorialBtn.position.set(ScreenManager.getWidth() / 2 * 1.3, ScreenManager.getHeight() / 2 * 1.5);
        this.logo.position.set(ScreenManager.getWidth() / 2 - this.logo.width / 2, ScreenManager.getHeight() / 2 * 0.15);
        this.pauseBtn.position.set(ScreenManager.getWidth() / 2 * 0.2, ScreenManager.getHeight() / 2 * 0.2);
        this.transitionImg.width = ScreenManager.getWidth();
        this.transitionImg.height = ScreenManager.getHeight();
        this.countDownSprite.position.set(ScreenManager.getWidth() / 2 * 0.1, ScreenManager.getHeight() / 2 * 1.2);
        this.gameStage.position.set(ScreenManager.getWidth() / 2 * 0.1, ScreenManager.getHeight() / 2 * 1.55);
        this.stageText.position.set(ScreenManager.getWidth() / 2 * 0.27, ScreenManager.getHeight() / 2 * 1.68);
        this.tutorialView.handleResize();
        this.pausePopView.position.set(ScreenManager.getWidth() / 2 - this.pausePopView.width / 2, ScreenManager.getHeight() / 2);
        this.stagehis.position.set(ScreenManager.getWidth() / 2 * 0.95 - this.stagehis.width / 2, ScreenManager.getHeight() / 2 + this.stagehis.height / 2);
        this.countDownText.position.set(ScreenManager.getWidth() / 2 * 0.27, ScreenManager.getHeight() / 2 * 1.33);
        this.overPopView.position.set(ScreenManager.getWidth() / 2 - this.overPopView.width / 2, ScreenManager.getHeight() / 2);
        this.levelText.position.set(ScreenManager.getWidth() / 2 * 1.12, ScreenManager.getHeight() / 2 * 1.05);
        this.shopView.Container.position.set(ScreenManager.getWidth() / 2 - this.shopView.Container.width / 2, ScreenManager.getHeight() / 2 - this.shopView.Container.height / 2);
        this.finalPopView.position.set(ScreenManager.getWidth() / 2 - this.finalPopView.width / 2, ScreenManager.getHeight() / 2);
        this.puzzleView.Container.position.set(ScreenManager.getWidth() / 2, ScreenManager.getHeight() / 2);
        this.puzzleView.Container.pivot.set(this.puzzleView.Container.width / 2, this.puzzleView.Container.height / 2);
        this.pausePop.handleResize();
        this.overPop.handleResize();
        this.finalPop.handleResize();
    }

    public onVisibilityChanged(isVisible: boolean) {
        this.isVisible = isVisible;
        if (this.isVisible && !this.clickMusicBtn) {
            Audio.playMusic(SoundKey.sound_maintheme, true);
            return;
        }
        Audio.stopMusic();
        Audio.stopAllSounds();
    }

    public playLogoMove() {
        this.playLogoAni = gsap.fromTo(this.logo, { y: ScreenManager.getHeight() / 2 * 0.15 }, { y: ScreenManager.getHeight() / 2 * 0.25, duration: 1, yoyo: true, repeat: -1, ease: "none" });
    }

    public async PlayTransferAni(type: TransferAniType) {
        switch (type) {
            case TransferAniType.HomeToGame:
                let homeToGameCallBack = () => {
                    this.homeActive(false);
                    this.changeBG(Texture.from(ImageKey.bg_game));
                }
                this.FadeOut(homeToGameCallBack);
                this.playLogoAni.kill();
                break;
            case TransferAniType.GameToHome:
                let gameToHomeCallBack = () => {
                    this.startActive(false);
                    this.changeBG(Texture.from(ImageKey.game_bg_start));
                }
                this.FadeOut(gameToHomeCallBack);
                break;
            case TransferAniType.TutorialToHome:
                this.changeBG(Texture.from(ImageKey.game_bg_start));
                break;
            default:
                break;
        }
    }

    public setCountDownText(text: number) {
        this.countDownText.text = text.toString();
    }

    public setLevelText(text: number) {
        this.levelText.text = text.toString();
    }

    public setStageText(text: number) {
        this.stageText.text = text.toString();
    }

    public homeActive(bool: boolean) {
        this.homeObjArr.forEach((item) => {
            item.visible = bool;
        });
    }

    public startActive(bool: boolean) {
        this.startObjArr.forEach((item) => {
            item.visible = bool;
        });
    }

    public setTransitionImgActive(bool: boolean) {
        this.transitionImg.visible = bool;
    }

    public FadeOut(callBack: any) {
        this.transitionImg.visible = true;
        this.killTweens(this.fadeOutAni);
        this.killTweens(this.transitionImg);
        this.fadeOutAni = gsap.fromTo(this.transitionImg,
            { alpha: 0 },
            {
                alpha: 1, duration: 0.5, onComplete: () => {
                    gsap.to(this.transitionImg, {
                        duration: 0.5, alpha: 0, onComplete: () => {
                            this.killTweens(this.fadeOutAni);
                            this.killTweens(this.transitionImg);
                            this.transitionImg.visible = false;
                        }
                    })
                    if (callBack) {
                        callBack();
                    }
                }
            })
    }

    public FadeIn(callBack: any) {
        this.killTweens(this.fadeInAni);
        this.fadeInAni = gsap.delayedCall(0.5, () => {
            if (callBack) callBack();
        })
    }

    public changeBG(texture: Texture) {
        this.bgSprite.texture = texture;
    }

    public MusicActive() {
        this.clickMusicBtn = !this.clickMusicBtn;
        if (this.clickMusicBtn) {
            this.musicBtn.texture = Texture.from(ImageKey.btn_music_off);
            this.pauseMusicBtn.texture = Texture.from(ImageKey.btn_music_off);
            Audio.stopMusic();
            Audio.stopAllSounds();
            Audio.setVolume(0);
            PlayerPrefs.Set('MusicVolume', 0);
        } else {
            this.musicBtn.texture = Texture.from(ImageKey.btn_music_on);
            this.pauseMusicBtn.texture = Texture.from(ImageKey.btn_music_on);
            Audio.playMusic(SoundKey.sound_maintheme, true);
            Audio.setVolume(1);
            PlayerPrefs.Set('MusicVolume', 1);
        }
    }

    public setClickMusicBtn(clickMusicBtn: boolean) {
        this.clickMusicBtn = clickMusicBtn;
    }

    public getPuzzleView(): PuzzleView {
        return this.puzzleView;
    }

    public getOverPop(): PopupManager {
        return this.overPop;
    }

    private killTweens(target: any) {
        if (!target) return;
        gsap.killTweensOf(target);
    }

    private _creatBgSprite(textureName: string) {
        let sprite = new Sprite(Texture.from(textureName));
        this.addChild(sprite);
        return sprite;
    }

    private _creatSprite(textureName: string) {
        let sprite = new Sprite(Texture.from(textureName));
        sprite.visible = false;
        this.addChild(sprite);
        return sprite;
    }

    private _creatButton(textureName: string) {
        let button = new Button(textureName);
        button.visible = false;
        this.addChild(button);
        return button;
    }

    protected setupPlayBtn() {
        this.playBtn = this._creatButton(ImageKey.btn_play);
        this.playBtn.onTap = () => {
            Audio.playSound(SoundKey.sound_btn);
            EventManager.SendMessage(GameEvent.CHANGE_VIEW, new EventMessage(SceneState.StartGame));
        }
        this.homeObjArr.push(this.playBtn);
    }

    protected setupMusicBtn() {
        this.musicBtn = this._creatButton(ImageKey.btn_music_on);
        this.musicBtn.onTap = () => {
            this.MusicActive();
            Audio.playSound(SoundKey.sound_btn);
        }
        this.homeObjArr.push(this.musicBtn);
    }

    protected setupShopBtn() {
        this.shopBtn = this._creatButton(ImageKey.btn_shop);
        this.shopBtn.onTap = () => {
            Audio.playSound(SoundKey.sound_btn);
            this.shopView.start();
        }
        this.homeObjArr.push(this.shopBtn);
    }

    protected setupShopView() {
        this.shopView = new ShopView();
        this.shopView.Init();
        this.addChild(this.shopView.Container);
    }

    protected setupTutorialBtn() {
        this.tutorialBtn = this._creatButton(ImageKey.btn_tutorial);
        this.tutorialBtn.onTap = () => {
            Audio.playSound(SoundKey.sound_btn);
            this.tutorialView.start();
        }
        this.homeObjArr.push(this.tutorialBtn);
    }

    protected setupPauseBtn() {
        this.pauseBtn = this._creatButton(ImageKey.btn_pause);
        this.pauseBtn.onTap = () => {
            Audio.playSound(SoundKey.sound_btn);
            this.pausePop.showPopupEffect();
            EventManager.SendMessage(GameEvent.PAUSE_GAME);
        }
        this.startObjArr.push(this.pauseBtn);
    }

    protected setupTransitionImg() {
        this.transitionImg = this._creatSprite(ImageKey.img_transition);
        this.transitionImg.alpha = 0;
    }

    protected setupColliderManager() {
        TimeManager.addGameListener(ColliderManager.Ins.Update);
    }

    protected setupCountDown() {
        this.countDownSprite = this._creatSprite(ImageKey.text_time);

        let style = {
            fontSize: 28,
            fill: '#A52A2A',
            letterSpacing: 1
        }
        this.countDownText = new Text("0", style);
        this.countDownText.visible = false;
        this.addChild(this.countDownText);
        this.startObjArr.push(this.countDownText);
        this.startObjArr.push(this.countDownSprite);
    }

    protected setupPuzzleView() {
        this.puzzleView = new PuzzleView();
        this.puzzleView.init();
        this.addChild(this.puzzleView.Container);
    }

    protected setupStagehisText() {
        this.stagehis = this._creatSprite(ImageKey.text_stagehis);
        let style = {
            fontSize: 32,
            fill: '#A52A2A',
            letterSpacing: 15
        }
        this.levelText = new Text("1", style);
        this.levelText.visible = false;
        this.addChild(this.levelText);
        this.homeObjArr.push(this.levelText);
        this.homeObjArr.push(this.stagehis);
    }

    protected setupGameStage() {
        this.gameStage = this._creatSprite(ImageKey.text_stage);
        let style = {
            fontSize: 28,
            fill: '#A52A2A',
            letterSpacing: 5
        }
        this.stageText = new Text("0", style);
        this.stageText.visible = false;
        this.addChild(this.stageText);
        this.startObjArr.push(this.stageText);
        this.startObjArr.push(this.gameStage);
    }

    protected setupTutorialView() {
        this.tutorialView = new TutorialView();
        this.tutorialView.Init();
        this.addChild(this.tutorialView.Container);
    }

    protected setupPausePop() {
        this.pausePopView = new Container();
        let pauseBg = new Sprite(Texture.from(ImageKey.board_pause));
        this.pausePopView.addChild(pauseBg);
        let homeBtn = new Button(ImageKey.btn_home);
        homeBtn.position.set(pauseBg.width * 0.2, pauseBg.height * 0.7);
        homeBtn.onTap = () => {
            Audio.playSound(SoundKey.sound_btn);
            this.pausePop.showCloseEffect();
            EventManager.SendMessage(GameEvent.CHANGE_VIEW, new EventMessage(SceneState.HomePage));
        }
        this.pausePopView.addChild(homeBtn);
        let continueBtn = new Button(ImageKey.btn_continue);
        continueBtn.position.set(pauseBg.width * 0.5, pauseBg.height * 0.7);
        continueBtn.onTap = () => {
            Audio.playSound(SoundKey.sound_btn);
            this.pausePop.showCloseEffect();
            EventManager.SendMessage(GameEvent.CONTINUE_GAME);
        }
        this.pausePopView.addChild(continueBtn);
        let musicBtn = new Button(ImageKey.btn_music_on);
        musicBtn.position.set(pauseBg.width * 0.8, pauseBg.height * 0.7);
        musicBtn.onTap = () => {
            Audio.playSound(SoundKey.sound_btn);
            this.MusicActive();
        }
        this.pausePopView.addChild(musicBtn);
        this.pauseMusicBtn = musicBtn;
        this.addChild(this.pausePopView);

        this.pausePop = new PopupManager(this, this.pausePopView);
    }

    protected setupOverPop() {
        this.overPopView = new Container();
        let overBg = new Sprite(Texture.from(ImageKey.board_result));
        this.overPopView.addChild(overBg);
        let style = {
            fontSize: 28,
            fill: '#000000',
            letterSpacing: 15
        }
        let text = new Text("時間到了！", style);
        text.position.set(overBg.width * 0.32, overBg.height * 0.52);
        this.overPopView.addChild(text);
        let homeBtn = new Button(ImageKey.btn_home);
        homeBtn.position.set(overBg.width * 0.3, overBg.height * 0.75);
        homeBtn.onTap = () => {
            Audio.playSound(SoundKey.sound_btn);
            this.overPop.showCloseEffect();
            EventManager.SendMessage(GameEvent.CHANGE_VIEW, new EventMessage(SceneState.HomePage));
        }
        this.overPopView.addChild(homeBtn);
        let replayBtn = new Button(ImageKey.btn_replay);
        replayBtn.position.set(overBg.width * 0.7, overBg.height * 0.75);
        replayBtn.onTap = () => {
            Audio.playSound(SoundKey.sound_btn);
            this.overPop.showCloseEffect();
            EventManager.SendMessage(GameEvent.CHANGE_GAME_STATR, new EventMessage(GameState.Start));
        }
        this.overPopView.addChild(replayBtn);
        this.addChild(this.overPopView);
        this.overPop = new PopupManager(this, this.overPopView);
    }

    protected setupFinalPop() {
        this.finalPopView = new Container();
        let finalBg = new Sprite(Texture.from(ImageKey.board_result));
        this.finalPopView.addChild(finalBg);
        let style = {
            fontSize: 28,
            fill: '#000000',
            letterSpacing: 15
        }
        let text = new Text("恭喜破關！", style);
        text.position.set(finalBg.width * 0.32, finalBg.height * 0.52);
        this.finalPopView.addChild(text);
        let homeBtn = new Button(ImageKey.btn_home);
        homeBtn.position.set(finalBg.width * 0.3, finalBg.height * 0.75);
        homeBtn.onTap = () => {
            Audio.playSound(SoundKey.sound_btn);
            this.finalPop.showCloseEffect();
            EventManager.SendMessage(GameEvent.CHANGE_VIEW, new EventMessage(SceneState.HomePage));
        }
        this.finalPopView.addChild(homeBtn);
        let replayBtn = new Button(ImageKey.btn_replay);
        replayBtn.position.set(finalBg.width * 0.7, finalBg.height * 0.75);
        replayBtn.onTap = () => {
            Audio.playSound(SoundKey.sound_btn);
            this.finalPop.showCloseEffect();
            EventManager.SendMessage(GameEvent.CHANGE_GAME_STATR, new EventMessage(GameState.Final));
        }
        this.finalPopView.addChild(replayBtn);
        this.addChild(this.finalPopView);
        this.finalPop = new PopupManager(this, this.finalPopView);
        this.puzzleView.setFinalStageCallBack(() => {
            this.finalPop.showPopupEffect();
        })
    }
}