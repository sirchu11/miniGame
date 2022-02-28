import { Container, Sprite, Texture } from 'pixi.js';
import { Assets, ImageKey, SoundKey } from './common/assets';
import ResLoader from './common/resLoader';
import ScreenManager, { SUBSCRIBE_TYPE } from '@base/tool/screenManager';
import Audio from '@base/tool/audio';
import GameList from './components/gameList';

export default class Lobby extends Container {
    private bg: Sprite;
    private gameList: GameList;
    private centerContainer: Container;
    private otherContainer: Container;

    constructor() {
        super();
        this.handleResize = this.handleResize.bind(this);

        this.loadLobbyResources();
    }

    private loadLobbyResources() {
        ResLoader.getInstance().lobbyResourcesLoad(Assets.main, (e) => {
            //e.progress
        }).then(() => {
            this.createLobby();
            ScreenManager.setSize();
        });

        Audio.loadRes(Assets.audio, (e) => {
            //e.progress
        }, () => {
            // audio load error
        }).then(() => {
            // Audio.playMusic(SoundKey.lobby_bgm);
        });
    }

    private createLobby() {
        this.centerContainer = new Container();
        this.otherContainer = new Container();
        this.bg = new Sprite(Texture.from(ImageKey.lobby_bg));
        this.otherContainer.addChild(this.bg);

        this.gameList = new GameList();
        this.otherContainer.addChild(this.gameList);

        this.addChild(this.otherContainer, this.centerContainer);

        ScreenManager.subscribe(this.handleResize, SUBSCRIBE_TYPE.OTHER);
        this.handleResize();
    }

    public handleResize() {
        if (this.bg) {
            this.bg.width = ScreenManager.getWidth();
            this.bg.height = ScreenManager.getHeight();
        }
        this.centerContainer.children.forEach((c) => {
            if (c !== this.bg) {
                c.position.set(ScreenManager.getWidth() / 2, ScreenManager.getHeight() / 2);
            }
        });

        this.otherContainer.children.forEach((c) => {
            if (c.handleResize) {
                c.handleResize(ScreenManager.getWidth(), ScreenManager.getHeight());
            }
        })
    }

    public destroy() {
        ScreenManager.unSubscribe(this.handleResize, SUBSCRIBE_TYPE.ALL);
        super.destroy({ children: true });
    }
}