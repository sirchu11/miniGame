import { GameEvent, SoundKey } from '../../../constants';
import MVCStateControllerBase from '../../MVCStateControllerBase';
import GameData from '../Model/GameData';
import MainView from '../View/MainView';
import { TransferAniType } from '../View/MainView';
import { EventManager, EventMessage } from '@base/tool/eventManager';
import PlayerPrefs from '@base/tool/playerPrefs';
import Audio from '@base/tool/audio';

export enum GameState {
    Start,
    Next,
    Reset,
    Pause,
    Pass,
    Over,
    Final
}

const totleTime = 25;

export default class StartGameController extends MVCStateControllerBase<GameState, GameData, MainView>
{
    private countdownTimer: NodeJS.Timeout | null;
    private remainTime: number;
    private pauseTime: number;
    private currentLevel: number = 1;
    private nextGame: boolean = false;

    public get GetStateControllerName(): string
    {
        return 'StartGameController';
    }

    public Init(...params: any)
    {
        super.Init(...params);
        this.SetupState(GameState.Start, undefined, () => { this.StartGame(); });
        this.SetupState(GameState.Next, undefined, () => { this.NextGame(); });
        this.SetupState(GameState.Reset, undefined, () => { this.ResetGame(); });
        this.SetupState(GameState.Pass, undefined, () => { this.PassGame(); });
        this.SetupState(GameState.Over, undefined, () => { this.OverGame(); });
        this.SetupState(GameState.Final, undefined, () => { this.FinalGame(); });

        EventManager.AddListener(GameEvent.CONTINUE_GAME, (msg?: EventMessage) => { this.ContinueGame(msg?.cMsg[0]); });
        EventManager.AddListener(GameEvent.PAUSE_GAME, (msg?: EventMessage) => { this.PauseGame(msg?.cMsg[0]); });
        EventManager.AddListener(GameEvent.CHANGE_GAME_STATR, (msg: EventMessage) => { this.ChangeState(msg.cMsg[0]); });
    }


    public StartGame() {
        if(this.currentLevel < this.Model.LevelData.length && this.nextGame) {
            this.currentLevel++;
            let level = PlayerPrefs.Get('Level');
            if(level < this.currentLevel) PlayerPrefs.Set('Level', this.currentLevel);
        }
        this.View.setStageText(this.currentLevel);
        let data = JSON.parse(JSON.stringify(this.Model.LevelData));
        this.View.startActive(true);
        this.View.getPuzzleView().start(data[this.currentLevel - 1]);
        this.showCountdownTime(totleTime);
        this.nextGame = false;
    }

    public NextGame() {
        this.nextGame = true;
        Audio.playSound(SoundKey.game_gameclear2);
        this.ChangeState(GameState.Start);
    }

    public FinalGame() {
        this.currentLevel = 1;
        Audio.playSound(SoundKey.game_gameclear2);
        this.ChangeState(GameState.Start);
    }

    public ResetGame() {
        this.View.getPuzzleView().resetView();
        this.clearTimer();
    }

    public PassGame() {
        this.clearTimer();
    }

    public OverGame() {
        this.View.getPuzzleView().pause();
        this.View.getOverPop().showPopupEffect();
    }

    public ContinueGame(msg: any) {
        this.View.getPuzzleView().continue();
        this.showCountdownTime(this.pauseTime);
    }

    public PauseGame(msg: any) {
        this.View.getPuzzleView().pause();
        this.clearTimer();
    }

    public showCountdownTime(currentTime: number) {
        this.setCountdownTime(currentTime, (time: number) => {
            currentTime = time;
            this.pauseTime = time
            this.View.setCountDownText(currentTime);
            if(time === 0) this.ChangeState(GameState.Over);
        })
    }

    /** 狀態開始 */
    public async StateBegin(...params: any[])
    {
        console.log("StartGameController StateBegin");
        this.currentLevel = 1;
        this.View.setCountDownText(totleTime);
        this.View.getPuzzleView().setupBird();
        this.View.FadeIn(() => this.ChangeState(GameState.Start));
    }

    /** 狀態結束 */
    public async StateEnd(...params: any[])
    {
        console.log("StartGameController StateEnd");
        await this.View.PlayTransferAni(TransferAniType.GameToHome);
    }

    /** 當別的新狀態.StateBegin()的時候，此狀態.StateClose()就會被呼叫 */
    public async StateClose(...params: any[])
    {
        console.log('StateClose');
        this.ChangeState(GameState.Reset);
    }

    public setCountdownTime(countdown: number, callback: any = null) {
        this.clearTimer();

        let stateTimeOut = new Date().getTime() + (countdown + 1) * 1000;
        this.remainTime = -1;
        this.countdownTimer = setInterval(() => {
            let currentTime = new Date().getTime();
            if (currentTime > stateTimeOut) {
                this.clearTimer();
            }
            else {
                let remainTime = Math.floor((stateTimeOut - currentTime) / 1000);
                if (this.remainTime !== remainTime) {
                    this.remainTime = remainTime;
                    if (callback) {
                        callback(this.remainTime);
                    }
                }
            }
        }, 100);
    }

    public clearTimer() {
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }
    }
}