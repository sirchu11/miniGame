import IState from './IState';

export class StateListData
{
    private index: number = 0;
    private stateList: any[] = [];
    private functionList: any[] = [];

    public get IsEmpty(): boolean
    {
        return (this.stateList.length === 0) && (this.functionList.length === 0);
    }

    public AddIndex(): void
    {
        this.index++;
    }

    public ResetIndex(): void
    {
        this.index = 0;
    }

    public SetState(stateBase: IState | undefined, fun: Function | undefined): void
    {
        this.stateList.push(stateBase);
        this.functionList.push(fun);
    }

    public GetNextFunction(): Function | undefined
    {
        return this.GetFunction(this.index + 1);
    }

    public GetFunction(index: number = this.index): Function | undefined
    {
        return this.functionList[index];
    }

    public GetNextState(): IState | undefined
    {
        return this.GetState(this.index + 1);
    }

    public GetState(index: number = this.index): IState | undefined
    {
        return this.stateList[index];
    }
}
