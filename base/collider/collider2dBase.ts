import { Graphics, Container, IPointData } from 'pixi.js';
import ICollider from './ICollider';
import Vector2 from '../tool/vector2';
import Logger, { LogType } from '../tool/logger';
import ScreenManager from '../tool/screenManager';

export enum ColliderDataType {
  /** 空數據 */ None = 0,
  /** 矩形 */ Rectangle = 1,
  /** 圓形 */ Circle = 2,
  /** 多邊形 */ Polygon = 3
}

export default abstract class Collider2DBase extends Graphics {
    /**
    * @param group 同group不檢測碰撞
    */
    constructor(group: string) {
        super();
        this.group = group;
    }
    public get GlobalX(): number { return this.getResizeGlobalPos().x; }
    public get GlobalY(): number { return this.getResizeGlobalPos().y; }
    public get GlobalAngle(): number { return this.GetParentAngle(this); }

    public getResizeGlobalPos(): IPointData {
        let x = (this.getGlobalPosition().x - ScreenManager.getWidth()) / ScreenManager.gameRatio;
        let y = (this.getGlobalPosition().y - ScreenManager.getHeight()) / ScreenManager.gameRatio;
        return { x, y };
    }

    private tag: string = '';
    /** 設置標籤, 可用來區別物件種類及針對各種類做對應事件處理 */
    public get Tag(): string { return this.tag }
    public set Tag(name: string) { this.tag = name; }

    private group: string = '';
    /** 相同Group不檢測碰撞 */
    public get Group(): string { return this.group; }

    private customData: any;
    /** 自定義資料 */
    public get CustomData(): any { return this.customData; }
    public set CustomData(data: any) { this.customData = data; }

    private active: boolean = true;
    /** 啟用檢測碰撞 */
    public get Active(): boolean { return this.active; }
    public set Active(bool: boolean) { this.active = bool; }

    private masterHandler: ICollider;
    /** 紀錄原始的頂點 */
    protected oriVertexs: Vector2[] = [];

    public abstract get Type(): ColliderDataType;

    /** 各頂點座標 */
    public get Vertexs(): Vector2[] {
        let vertexs = [];
        for (let i = 0; i < this.oriVertexs.length; i++) {
            let vec = new Vector2(this.GlobalX + this.oriVertexs[i].X, this.GlobalY + this.oriVertexs[i].Y);
            vec.RotateRefPoint(this.GlobalAngle, this.getGlobalPosition());
            vertexs.push(vec);
        }
        return vertexs;
    }

    /** 
     * 碰撞器通常掛載在遊戲組件上，監聽碰撞事件發生時傳給遊戲組件（代理模式的概念）
     * @param master 處理碰撞事件的主物件
     */
    public Init(master: ICollider) {
        this.masterHandler = master;
    }

    /** 開始碰撞的物體 */
    public CollisionStart(collider: Collider2DBase): void {
        if (this.masterHandler && this.masterHandler.CollisionStart) {
            this.masterHandler.CollisionStart(collider, this);
        }
    }

    /** 持續發生碰撞的物體 */
    public CollisionActive(collider: Collider2DBase): void {
        if (this.masterHandler && this.masterHandler.CollisionActive) {
            this.masterHandler.CollisionActive(collider, this);
        }
    }

    /** 離開碰撞的物體 */
    public CollisionEnd(collider: Collider2DBase): void {
        if (this.masterHandler && this.masterHandler.CollisionEnd) {
            this.masterHandler.CollisionEnd(collider, this);
        }
    }

    /** 顯示碰撞範圍 */
    public RangeVisible(bool: boolean) {
        this.alpha = (bool) ? 0.5 : 0;
    }

    /** 從ColliderManager監聽中移除會被呼叫 */
    public Clear() {
        Logger.Log(LogType.Client, '碰撞器:' + this.name + ',從ColliderManager中移除碰撞監聽');
        this.destroy();
    }

    protected GetParentAngle(parnet: Container): number {
        let result = parnet.angle;
        //有父物件
        if (parnet.parent) {
            result += this.GetParentAngle(parnet.parent);
        }
        return result;
    }

    public destroy() {
        super.destroy({ children: true });
        Object.keys(this).forEach(key => this[key] = null);
    }
}
