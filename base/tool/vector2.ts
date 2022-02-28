import { IPointData } from 'pixi.js';

export default class Vector2 {
    private x: number;
    public get X(): number { return this.x; }
    public set X(value: number) { this.x = value; }

    private y: number;
    public get Y(): number { return this.y; }
    public set Y(value: number) { this.y = value; }

    /** 向量長度 */
    public get Length(): number { return Math.sqrt(Math.pow(this.X, 2) + Math.pow(this.Y, 2)); }

    /** 左法向量 */
    public get NormalL(): Vector2 { return new Vector2(-this.y, this.x); }

    public constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public static get Zero(): Vector2 { return new Vector2(0, 0); }

    /** 內積 */
    public static Dot(vec1: Vector2, vec2: Vector2): number {
        return (vec1.X * vec2.X + vec1.Y * vec2.Y);
    }

    /** 向量相加 */
    public static Add(vec1: Vector2, vec2: Vector2): Vector2 {
        return new Vector2(vec1.X + vec2.X, vec1.Y + vec2.Y);
    }

    /** 向量相減 */
    public static Sub(vec1: Vector2, vec2: Vector2): Vector2 {
        return new Vector2(vec1.X - vec2.X, vec1.Y - vec2.Y);
    }

    /** 兩點距離 */
    public static Distance(vec1: Vector2, vec2: Vector2): number {
        return Math.sqrt(Math.pow(vec1.X - vec2.X, 2) + Math.pow(vec1.Y - vec2.Y, 2));
    }

    public ToString(): string {
        return '(' + this.x + ', ' + this.y + ')';
    }

    /** 向量相減 */
    public Sub(vector2: Vector2): Vector2 {
        return Vector2.Sub(this, vector2);
    }

    /** 向量相加 */
    public Add(vector2: Vector2): Vector2 {
        return Vector2.Add(this, vector2);
    }

    /** 與vector2的距離 */
    public Distance(vector2: Vector2): number {
        return Vector2.Distance(this, vector2);
    }

    /** 與vector2的內積 */
    public Dot(vector2: Vector2): number {
        return Vector2.Dot(this, vector2);
    }

    /** 在vec的正射影長 */
    public ProjectLengthOnto(vector2: Vector2): number {
        return this.Dot(vector2) / vector2.Length;
    }

    /** 得到垂直於邊緣向量的邊緣法向量，即投影軸向量 */
    public Perpendicular(): Vector2 {
        return new Vector2(this.y, -this.x);
    }

    /** 得去某向量的單位向量，即方向相同，長度為1的向量，單位向量主要是用來指示方向的 */
    public Normalize(): Vector2 {
        let v = Vector2.Zero;
        let m = this.Length;
        if (m != 0) { //避免向量為0
            v.x = this.x / m;
            v.y = this.y / m;
        }
        return v;
    }

    /** 得去邊緣法向量的單位向量，即投影軸向量的單位方向，表示投影軸的方向 */
    public PerpendicularNormal(): Vector2 {
        return this.Perpendicular().Normalize();
    }

    /** 以refP為參考點，旋轉angle角後的座標位置 */
    public RotateRefPoint(angle: number, refP: IPointData): void {
        let newX = (this.x - refP.x) * Math.cos(angle * Math.PI / 180) - (this.y - refP.y) * Math.sin(angle * Math.PI / 180) + refP.x;
        let newY = (this.y - refP.y) * Math.cos(angle * Math.PI / 180) + (this.x - refP.x) * Math.sin(angle * Math.PI / 180) + refP.y;
        this.x = newX;
        this.y = newY;
    }
}