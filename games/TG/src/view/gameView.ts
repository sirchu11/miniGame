import { Container } from 'pixi.js';
import GameManger from '../game/GameManger';
import GameData from '../game/MVCState/Model/GameData';
import MainView from '../game/MVCState/View/MainView';
import ScreenManager from '@base/tool/screenManager';
import Audio from '@base/tool/audio';
import { SoundKey } from '../constants';

export default class GameView extends Container
{
    private gameManger: GameManger;
    private gameData: GameData;
    private mainView: MainView;

    constructor() {
        super();
        this.handleResize = this.handleResize.bind(this);
        this.Init();
    }

    public Init() {
        this.gameManger = new GameManger();
        this.gameData = new GameData();
        this.mainView = new MainView();
        this.mainView.Init();
        this.addChild(this.mainView);
        this.gameManger.Init(this.gameData, this.mainView);
        this.gameManger.Start();
        ScreenManager.subscribe(this.handleResize);
        Audio.playMusic(SoundKey.sound_maintheme, true);
        this.handleResize();
     }

    public handleResize() {
        this.mainView.handleResize();
    }

    public setGlobalListener(globalListener: any) {
        globalListener.registerVisibleEvent(this.onVisibilityChanged.bind(this));
    }

    public onVisibilityChanged(isVisible: boolean) {
        this.mainView.onVisibilityChanged(isVisible);
    }

     // 銷毀
    public destroy() {
        ScreenManager.unSubscribe(this.handleResize);
        super.destroy({ children: true });
    }
}