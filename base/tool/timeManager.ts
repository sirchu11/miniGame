import { Ticker } from 'pixi.js';

export class TimeManager {
    private otherHandlerList: Array<any> = new Array();
    private gameHandlerList: Array<any> = new Array();
    private timeScale: number = 1;

    constructor() {
        this.otherHandlerList = [];
        this.gameHandlerList = [];
    }

    /**
     * 新增遊戲外Timer事件
     * @param otherTimerEvent 
     */
    public addOtherListener(otherTimerEvent: any) {
        this.otherHandlerList.push(otherTimerEvent);
        Ticker.shared.add(otherTimerEvent);
    }

    /**
     * 新增遊戲Timer事件
     * @param gameTimerEvent 
     */
    public addGameListener(gameTimerEvent: any): Ticker {
        this.gameHandlerList.push(gameTimerEvent);
        return Ticker.shared.add(gameTimerEvent);
    }

    /**
     * 移除所有遊戲外Timer事件
     */
    public removeOtherHandlerList() {
        for (let i = 0; i < this.otherHandlerList.length; i++) {
            Ticker.shared.remove(this.otherHandlerList[i]);
        }
        this.otherHandlerList = [];
    }

    /**
     * 移除單個遊戲外Timer事件
     * @param otherHandler 
     */
    public removeOtherHandler(otherHandler: any) {
        let index = this.otherHandlerList.indexOf(otherHandler);
        if (index > -1) {
            Ticker.shared.remove(otherHandler);
            this.otherHandlerList.splice(index, 1);
        }
    }

    /**
     * 移除所有遊戲Timer事件
     */
    public removeGameHandlerList() {
        for (let i = 0; i < this.gameHandlerList.length; i++) {
            Ticker.shared.remove(this.gameHandlerList[i]);
        }
        this.gameHandlerList = [];
    }

    /**
     * 移除單個遊戲Timer事件
     * @param gameHandler 
     */
    public removeGameHandler(gameHandler: any) {
        let index = this.gameHandlerList.indexOf(gameHandler);
        if (index > -1) {
            Ticker.shared.remove(gameHandler);
            this.gameHandlerList.splice(index, 1);
        }
    }

    /**
     * 調整時間流速
     * @param timeScale
     */
    public setTimeScale(timeScale: number) {
        if (timeScale === this.timeScale)
            return;

        Ticker.shared.speed = timeScale;
        this.timeScale = timeScale;
    }

    /**
     * 等待N秒後執行
     * @param s
     * @returns 
     */
    public waitForSeconds(s: number = 1): Promise<void> {
        return new Promise(r => setTimeout(r, s * 1000));
    }

    public waitAndCallback(s: number = 1, callback: Function): NodeJS.Timeout {
        return setTimeout(() => {
            callback();
        }, s * 1000);
    }

    /**
     * 等待一禎
     * @returns
     */
    public waitForDeltaTime(): Promise<void> {
        return new Promise(r => setTimeout(r, Ticker.shared.deltaTime));
    }
}

const timeManager = new TimeManager();
export default timeManager;