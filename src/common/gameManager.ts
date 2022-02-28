import { GameItem, GAME_LIST, TEST_GAME } from '../constants';
import { resolveGame } from './gameContext';
import { Application, Container } from 'pixi.js';
import ResLoader from './resLoader';
import ScreenManager from '@base/tool/screenManager';
import Audio from '@base/tool/audio';
import globalListener from './globalListener';

interface GameResources {
    assets: Array<any>;
    sounds: Array<any>;
}

interface IGames {
    getGameResources: () => GameResources;
    createScene: () => Container;
}

class GameManager {
    private gameList: Array<GameItem> = [];
    private currentScene: Container;
    private lobbyScene: Container;
    private app: Application;
    // 測試遊戲將boolean值設成true並將res, src資料夾放進games/TG底下
    private isTestGame: boolean = false;
    private isInGame: boolean = false;

    public initGameManager(app: Application, lobby: Container) {
        this.app = app;
        this.gameList = GAME_LIST;
        this.lobbyScene = lobby;
        this.currentScene = lobby;
        this.isInGame = false;
        if (this.isTestGame) {
            this.enterGame();
        }
    }

    public enterGame(gameType?: number) {
        if (this.isInGame) {
            return;
        }

        let game: GameItem;
        if (this.isTestGame) {
            game = TEST_GAME;
        }
        else {
            game = this.gameList.find((g) => {
                return g.gameType === gameType;
            });
        }

        if (!game) {
            console.error('no game found');
            return;
        }

        resolveGame(game.name).then((gameInfo) => {
            let gameResources = gameInfo.getGameResources();
            let gameAudio = gameResources.sounds;

            let audioLoadComplete = false;
            let resourceLoadComplete = false;
            if (gameAudio.length === 0) {
                console.warn('no audio');
                audioLoadComplete = true;
                this.checkLoadComplete(audioLoadComplete, resourceLoadComplete, gameInfo, game);
            }
            else {
                Audio.loadRes(gameAudio, (e) => {
                    // e.progress
                }, () => {
                    console.error('loadError');
                }).then(() => {
                    audioLoadComplete = true;
                    this.checkLoadComplete(audioLoadComplete, resourceLoadComplete, gameInfo, game);
                });
            }

            ResLoader.getInstance().gameResourcesLoad(gameResources.assets, (e) => {
                // e.progress
            }).then(() => {
                resourceLoadComplete = true;
                this.checkLoadComplete(audioLoadComplete, resourceLoadComplete, gameInfo, game);
            }).catch((e) => {
                console.error('load resources failed:', e);
            });
        }).catch((e) => {
            console.error(e);
            return;
        });
    }

    public checkLoadComplete(audioReady: boolean, resourceReady: boolean, gameInfo: IGames, game: GameItem) {
        if (audioReady && resourceReady) {
            this.closeLobbyScene();

            document.title = game.title;
            let gameScene = gameInfo.createScene();
            this.app.stage.addChild(gameScene);
            this.isInGame = true;
            this.currentScene = gameScene;
            ScreenManager.setSize();
            if (this.currentScene.setGlobalListener) {
                this.currentScene.setGlobalListener(globalListener);
            }
        }
    }

    public closeLobbyScene() {
        this.lobbyScene.visible = false;
        Audio.stopMusic();
    }
}

const gameManager = new GameManager();
export default gameManager;