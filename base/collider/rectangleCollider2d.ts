
import Vector2 from '../tool/vector2';
import Collider2DBase, { ColliderDataType } from './collider2dBase';

/** 此為靜態矩形(不旋轉)用來優化判斷碰撞類型，要偵測會旋轉的矩形碰撞請使用RotateRectangleCollider2D */
export default class RectangleCollider2D extends Collider2DBase {
    /**
     * @param group 同group不檢測碰撞
     * @param width 寬
     * @param height 高
     * @param tag 自定義標籤，可用來區別物件種類或處理自訂事件
     */
    constructor(group: string, width: number, height: number, tag = '') {
        super(group);
        this.beginFill(0xFF0000);
        //如果在drawRect設定繪製初始座標，旋轉角度時位置會跑掉
        this.drawRect(0, 0, width, height);
        this.endFill();
        this.pivot.set(width / 2, height / 2);
        this.Tag = tag;
        // 記錄旋轉前各頂點座標
        this.oriVertexs =
            [
                new Vector2(-width / 2, height / 2),
                new Vector2(-width / 2, -height / 2),
                new Vector2(width / 2, -height / 2),
                new Vector2(width / 2, height / 2)
            ];
    }

    public get Type(): ColliderDataType { return ColliderDataType.Rectangle; }
}