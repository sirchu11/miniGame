import StateMachineFramework from './StateMachine/StateMachineFramework';
import IState from './StateMachine/IState';
import IViewBase from './IViewBase';
import Logger, { LogType } from '@base/tool/logger';

/** MVC狀態控制器框架；主要定義Model & View，自己本身也是一個狀態執行用StateBase, 'SE'為狀態的enum */
export default abstract class MVCStateControllerBase<SE, M, V extends IViewBase> extends StateMachineFramework<SE> implements IState
{
    public get Model(): M { return this.model; }
    public get View(): V { return this.view; }
    public get Callback(): Function { return this.callback; }

    private model: M;
    private view: V;
    private callback: Function;
    private isActive: boolean = false;

    //log名稱使用
    public abstract get GetStateControllerName(): string;

    //狀態機

    /** 狀態機是否為啟動狀態 */
    public get IsActive(): boolean { return this.isActive; }

    /** @override */
    public StateReadyToBegin(): void
    {
        Logger.Log(LogType.Client, this.GetStateControllerName + ': StateReadyToBegin');
    }

    /** @override */
    public StateBegin(...params: any): void
    {
        Logger.Log(LogType.Client, this.GetStateControllerName + ': StateBegin');
        this.SetActive(true);
    }

    /** @override */
    public StateEnd(): void
    {
        Logger.Log(LogType.Client, this.GetStateControllerName + ': StateEnd');
    }

    /** @override */
    public StateClose(): void
    {
        Logger.Log(LogType.Client, this.GetStateControllerName + ': StateClose');
        this.SetActive(false);
    }

    //狀態機

    /** 
     * @paramc [0]: Model
     * @paramc [1]: View
     * @paramc [2]: CallBack
     */
    public Init(...params: any): void
    {
        this.model = params[0];
        this.view = params[1];
        this.callback = params[2];

        this.SetActive(false);
    }

    public SetActive(active: boolean): void
    {
        this.isActive = active;
        this.view.SetActive(active);
    }

    public Clear(): void
    {
        this.view.Clear();
    }
}