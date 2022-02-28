import MVCStateControllerBase from './MVCStateControllerBase';
import GameData from './MVCState/Model/GameData';
import MainView from './MVCState/View/MainView';
import StartGameController from './MVCState/Controller/StartGameController';
import HomePageController from './MVCState/Controller/HomePageController';
import { EventManager, EventMessage } from '@base/tool/eventManager';
import { GameEvent } from '../constants';
import Logger, { LogType } from '@base/tool/logger';

export enum SceneState
{
    HomePage = 0,
    StartGame = 1
}

//框架使用範例
export default class GameManger extends MVCStateControllerBase<SceneState, GameData, MainView>
{
    private startGameController: StartGameController;
    private homePageController: HomePageController;
    public get GetStateControllerName(): string
    {
        return 'GameManger';
    }

    public Init(...params: any)
    {
        super.Init(...params);

        this.startGameController = new StartGameController();
        this.startGameController.Init(this.Model, this.View);
        this.homePageController = new HomePageController();
        this.homePageController.Init(this.Model, this.View);

        this.SetupState(SceneState.StartGame, this.startGameController, () => { console.log('StartGameController'); });
        this.SetupState(SceneState.HomePage, this.homePageController, () => { console.log('HomePageController'); });

        EventManager.AddListener(GameEvent.CHANGE_VIEW, (msg: EventMessage) => { this.ChangeState(msg.cMsg[0]); });

    }

    public Start()
    {
        this.ChangeState(SceneState.HomePage);
    }

    /** @overrid */
    public ChangeState(toState: SceneState, ...params: any): void
    {
        Logger.Log(LogType.Client,'GameManger => ChangeState  :[' + SceneState[this.CurGameState] + ']' + '  >>>  [' + SceneState[toState] + ']');
        super.ChangeState(toState, ...params);
    }
}