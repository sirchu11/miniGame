import Logger, { LogType } from '../tool/Logger';
import TimeManager, { TickerMode } from '../tool/TimeManager'

/** 管理遊戲時間與Update相關功能 */
export default class GameTimeManager
{
    private updateKey: string = '';
    private remainTime: number = -1;
    private fakeX = 0;

    public Start()
    {
        TimeManager.Ins.Start(TickerMode.TimeoutLoop);
        /**使用RAF會在頁面不可見時暫停Update(可優化效能、渲染同步)，如果應用場合需要在頁面不可見時持續監聽Update，註冊document.visibilitychange 範例*/
        document.addEventListener('visibilitychange', () =>
        {
            if (document.visibilityState === 'visible')
            {
                TimeManager.Ins.ChangeState(TickerMode.RAF);
            }
            else
            {
                TimeManager.Ins.ChangeState(TickerMode.TimeoutLoop);
            }
        });

        Logger.Log(LogType.Client, TimeManager.GetDateByFormat());
        Logger.Log(LogType.Client, '註冊角色update事件');
        this.updateKey = TimeManager.Ins.AddListener((msDeltaTime: number) => { this.UpdatePos(msDeltaTime); });
        this.Await();
    }

    //使用範例: 非同步等待
    public async Await()
    {
        await TimeManager.WaitForSeconds(1);

        //測試 SkipAwaitSeconds
        this.CountdownTimer(3);

        //使用此方法等待可藉由「SkipAwaitSeconds() 」來跳過
        await TimeManager.Ins.WaitForSkippableSeconds(20);

        let seconds = 2;
        Logger.Log(LogType.Client, '開始計時:' + seconds + '秒後停止角色update');
        TimeManager.Ins.CountTime(2, (time: number) =>
        {
            Logger.Log(LogType.Client, '已過:' + time + '秒');
        }, () =>
        {
            Logger.Log(LogType.Client, '時間到:停止角色update');
            TimeManager.Ins.RemoveListenerByKey(this.updateKey);
        });
    }

    //使用範例: 倒數計時
    public CountdownTimer(countDuration: number)
    {
        this.remainTime = -1;
        TimeManager.Ins.CountReverseTime(countDuration, (remainTime: number) =>
        {
            remainTime = Math.floor(remainTime);
            if (this.remainTime !== remainTime)
            {
                this.remainTime = remainTime;
                Logger.Log(LogType.Client, '剩餘 : ' + (this.remainTime + 1) + ' 秒執行 SkipAwaitSeconds');
            }
        }, () =>
        {
            Logger.Log(LogType.Client, '執行 SkipAwaitSeconds');
            TimeManager.Ins.SkipAwaitSeconds();
        });
    }

    //使用範例: 移動位置
    public UpdatePos(msDeltaTime: number)
    {
        let speed = 2;
        this.fakeX += speed * msDeltaTime;
        Logger.Log(LogType.Client, '角色PosX :' + this.fakeX);
    }
}