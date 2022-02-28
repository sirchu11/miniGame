'use strict'
import * as PIXI from 'pixi.js';
import { Application, Loader } from 'pixi.js';
import Lobby from './lobby';
import ScreenManager from '@base/tool/screenManager';
import gameManager from './common/gameManager';
import { loaderPlugin } from './common/loaderPlugin';
import { createDefaultStyle } from './common/createStyle';
import GlobalListener from './common/globalListener';
import PixiStats from './common/pixi-stats/pixiStats';

// pixi devtool
window.PIXI = PIXI;

Loader.registerPlugin(loaderPlugin);

const app = new Application({
    antialias: false,
    transparent: false,
    backgroundColor: 0x272727
});

document.body.appendChild(app.view);
app.ticker.maxFPS = 60;
ScreenManager.setApp(app);
if (process.env.SETTING !== 'production') {
    PixiStats.setApp(app);
}

const createLobby = () => {
    const lobby = new Lobby();
    app.stage.addChild(lobby);
    gameManager.initGameManager(app, lobby);
};

window.renderer = app.renderer;

createLobby();

createDefaultStyle();
GlobalListener.initListener();