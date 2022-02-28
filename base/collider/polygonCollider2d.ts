import { Point } from 'pixi.js';
import Vector2 from '../tool/vector2';
import Collider2DBase, { ColliderDataType } from './collider2dBase';

export default class PolygonCollider2D extends Collider2DBase {
    /**
    * @param group 同group不檢測碰撞
    * @param points 各頂點
    * @param tag 自定義標籤，可用來區別物件種類或處理自訂事件
    */
    constructor(group: string, points: Point[], tag = '') {
        super(group);
        this.beginFill(0xFF0000);
        // 如果在drawRect設定繪製初始座標, 旋轉角度時位置會跑掉
        this.drawPolygon(points);
        this.endFill();
        this.pivot.set(this.width / 2, this.height / 2);
        this.Tag = tag;
        //記錄旋轉前各頂點座標
        for (let i = 0; i < points.length; i++) {
            let corner = new Vector2(points[i].x - this.width / 2, points[i].y - this.height / 2);
            this.oriVertexs.push(corner);
        }
    }

    public get Type(): ColliderDataType { return ColliderDataType.Polygon; }
}