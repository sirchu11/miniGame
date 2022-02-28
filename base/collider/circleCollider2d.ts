import Collider2DBase, { ColliderDataType } from './collider2dBase'
import Vector2 from '../tool/vector2';
import { Point } from 'pixi.js';

/** 圓的碰撞 */
export default class CircleColloder2D extends Collider2DBase {
    /** 
     * @param group 同group不檢測碰撞
     * @param radius 圓的半徑
     * @param tag 自定義標籤，可用來區別物件種類或處理自訂事件
     */
    constructor(group: string, radius: number, tag = '',) {
        super(group);
        this.beginFill(0xFF0000);
        this.drawCircle(radius, radius, radius);
        this.endFill();
        this.pivot.set(radius, radius);
        this.Tag = tag;
        // 使用36個點來代表多邊形
        this.Path(radius, radius, radius, 10).forEach(v => {
            let vec = new Vector2(Math.floor(v.x), Math.floor(v.y));
            this.oriVertexs.push(vec);
        });
    }

    public get Type(): ColliderDataType { return ColliderDataType.Circle; }

    /**
     * 獲取圓的路徑
     * @param x 圓心X坐標
     * @param y 圓心X坐標
     * @param radius 半徑
     * @param density 密度越大路徑越少，密度越小路徑越多
     */
    protected Path(x: number, y: number, radius: number, density: number = 1): Point[] {
        let result = [];
        let count = 360 / density;
        for (let times = 0; times < count; times++) {
            let hudu = (2 * Math.PI / 360) * (360 / count) * times;
            let X = x + Math.sin(hudu) * radius;
            let Y = y - Math.cos(hudu) * radius;
            result.push(new Point(X, Y));
        }
        return result;
    }
}