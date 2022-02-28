import { Assets } from './constants';
import GameView from './view/gameView';

// 大廳調用入口
export const getGameResources = () => {
    let assets = Assets.main;
    let sounds = Assets.audio;
    let resources = {
        assets: assets,
        sounds: sounds
    };
    return resources;
};

export const createScene = () => {
    return new GameView();
};