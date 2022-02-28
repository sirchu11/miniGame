export default interface IViewBase
{
    Init(...params: any[]): void;

    /** 啟用 */
    SetActive(bool: boolean): void;
    
    /** 清除 */
    Clear(): void;
}