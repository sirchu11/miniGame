import Vector2 from '../tool/vector2';
import Collider2DBase, { ColliderDataType } from './collider2dBase';

export default class RotateRectangleCollider2D extends Collider2DBase {
    /**
     * @param group 同group不檢測碰撞
     * @param width 寬
     * @param height 高
     * @param angle 旋轉角度
     * @param tag 自定義標籤，可用來區別物件種類或處理自訂事件
     */
    constructor(group: string, width: number, height: number, angle: number = 0, tag = '') {
        super(group);
        this.beginFill(0xFF0000);
        //如果在drawRect設定繪製初始座標，旋轉角度時位置會跑掉
        this.drawRect(0, 0, width, height);
        this.endFill();
        this.pivot.set(width / 2, height / 2);
        this.angle = angle;
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

    //旋轉矩形用多邊形檢測
    public get Type(): ColliderDataType { return ColliderDataType.Polygon; }
}