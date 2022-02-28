import Logger, { LogType } from '../tool/logger';
import Collider2DBase from './collider2dBase';

/** 檢測碰撞的組 */
export default class ColliderGroup {
    constructor(name: string) {
        this.name = name;
    }

    private colliderList: Collider2DBase[] = [];
    /** 組的碰撞清單 */
    public get ColliderList(): Collider2DBase[] { return this.colliderList; }

    private name: string = '';
    /** 設定組件名 */
    public get Name(): string { return this.name; };

    /** 加入碰撞器 */
    public AddCollider(collider: Collider2DBase) {
        if (!this.colliderList.includes(collider)) {
            this.colliderList.push(collider)
        }
        else {
            Logger.Log(LogType.Client, 'ColliderGroup: ' + this.Name + '中已存在:' + collider.name);
        }
    }

    /** 移除碰撞器 */
    public RemoveCollider(collider: Collider2DBase) {
        let index = this.colliderList.indexOf(collider);
        if (index > -1) {
            this.colliderList.splice(index, 1);
        }
    }

    /** 啟用群組中的碰撞器檢測 */
    public SetActive(bool: boolean) {
        for (let index = 0; index < this.colliderList.length; index++) {
            this.colliderList[index].Active = bool;
        }
    }

    /** 啟用顯示群組中的碰撞器的碰撞範圍 */
    public SetRangeVisible(bool: boolean) {
        for (let index = 0; index < this.colliderList.length; index++) {
            this.colliderList[index].RangeVisible(bool);
        }
    }

    /** 清空群組註冊的碰撞器 */
    public Clear() {
        for (let index = 0; index < this.colliderList.length; index++) {
            this.colliderList[index].Clear();
        }
        this.colliderList = [];
    }
}