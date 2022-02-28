import IState from './IState';
import { StateListData } from './StateListData';
import Logger, { LogType } from '@base/tool/logger';

/** 狀態機流程架構，可以使用IState的狀態機執行精密流程控制；或是使用簡易Function來執行流程控制, 'SE'為狀態的enum */
export default class StateMachineFramework<SE>
{
    private stateMap: Map<SE, StateListData> = new Map<SE, StateListData>();
    private curGameState: SE;
    private curGameStateBase: IState | undefined;

    public get CurGameState(): SE { return this.curGameState; }
    public get CurGameStateBase(): IState | undefined { return this.curGameStateBase; }

    /** 設置狀態機 & 方法（在StateBegin()完成後執行） */
    public SetupState(state: SE, stateBase: IState | undefined, fun?: Function | undefined): void
    {
        this.GetStateListData(state).SetState(stateBase, fun);
    }

    public IsEmpty(state: SE): boolean
    {
        return this.GetStateListData(state).IsEmpty;
    }

    /** 重置所有狀態資料的Index */
    public ResetStateListDataIndex(): void
    {
        this.stateMap.forEach(stateListData =>
        {
            stateListData.ResetIndex();
        });
    }

    /** 由實作面定義指定資料*/
    public ChangeState(toState: SE, ...params: any): void
    {
        let toFunction = this.GetFunctionFromListData(toState);
        let toStateBase = this.GetStateFromListData(toState);

        if (this.CurGameStateBase)
        {
            if (this.CurGameStateBase === toStateBase)
            {
                if (!this.OnSameStateHandle(this.CurGameStateBase)) return;
            }
        }

        //舊狀態結束
        this.CurGameStateBase?.StateEnd();
        //新狀態準備
        toStateBase?.StateReadyToBegin();
        //舊狀態關閉 
        this.CurGameStateBase?.StateClose();

        //更換為新狀態
        this.curGameState = toState;
        this.curGameStateBase = toStateBase;

        //新狀態開始
        this.CurGameStateBase?.StateBegin(params);

        toFunction?.call(this, params);

        if (!this.CurGameStateBase && !toFunction)
        {
            Logger.LogError(LogType.Client, 'CurGameStateBase', undefined, 'toState', toState);
        }
    }

    protected GetStateListData(state: SE): StateListData
    {
        let stateListData = this.stateMap.get(state);
        if (!stateListData)
        {
            stateListData = new StateListData()
            this.stateMap.set(state, stateListData);
        }
        return stateListData;
    }

    protected GetStateFromListData(state: SE): IState | undefined
    {
        return this.GetStateListData(state).GetState();
    }

    protected GetFunctionFromListData(state: SE): Function | undefined
    {
        return this.GetStateListData(state).GetFunction();
    }

    /** 轉換狀態到相同狀態時候的處理，看是否要允許執行 */
    protected OnSameStateHandle(stateBase: IState): boolean
    {
        Logger.Log(LogType.Client,'同狀態轉換:' + stateBase);
        return false;
    }
}