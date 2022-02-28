export default interface IState
{
    /** 當別的舊狀態.StateEnd()結束，此狀態.StateReadyToBegin()就會被呼叫 */
    StateReadyToBegin(): void;

    /** 狀態開始 */
    StateBegin(...params: any): void;

    /** 狀態結束 */
    StateEnd(): void;

    /** 當新狀態.StateBegin()的完成後，此狀態.StateClose()就會被呼叫 */
    StateClose(): void;

    /** 狀態機清除 */
    Clear(): void;
}