
import Vector2 from '../tool/vector2';

/** 碰撞判斷工具 */
export default class DetectionTool {
    /**
    * 檢查點與點
    * @param pointA 點的座標
    * @param pointB 點的座標
    */
    public static CheckPointPoint(pointA: Vector2, pointB: Vector2): boolean {
        return ((pointA.X === pointB.X) && (pointA.Y === pointB.Y));
    }

    /**
    * 檢查點與圓
    * @param point 點的座標
    * @param circlePoint 圓心的座標
    * @param radius 圓的半徑
    */
    public static CheckPointCircle(point: Vector2, circlePoint: Vector2, radius: number): boolean {
        return (Vector2.Distance(point, circlePoint) <= radius);
    }

    /**
    * 檢查點與矩形
    * @param point 點的座標
    * @param rectanglePoint 矩形的頂點座標
    * @param width  矩形的寬
    * @param height 矩形的高
    */
    public static CheckPointRectangle(point: Vector2, rectanglePoint: Vector2, width: number, height: number): boolean {
        return (point.X >= rectanglePoint.X && point.X <= rectanglePoint.X + width && point.Y >= rectanglePoint.Y && point.Y <= rectanglePoint.Y + height);
    }

    /**
    * 檢查點與三角形
    * @param point 檢查座標點
    * @param trianglePoint1 三角形頂點1
    * @param trianglePoint2 三角形頂點2
    * @param trianglePoint3 三角形頂點3
    * @param buffer 允許誤差值
    */
    public static CheckPointTriangle(point: Vector2, trianglePoint1: Vector2, trianglePoint2: Vector2, trianglePoint3: Vector2, buffer: number = 0.1): boolean {
        let areaOrig = Math.abs((trianglePoint2.X - trianglePoint1.X) * (trianglePoint3.Y - trianglePoint1.Y) - (trianglePoint3.X - trianglePoint1.X) * (trianglePoint2.Y - trianglePoint1.Y));
        let area1 = Math.abs((trianglePoint1.X - point.X) * (trianglePoint2.Y - point.Y) - (trianglePoint2.X - point.X) * (trianglePoint1.Y - point.Y));
        let area2 = Math.abs((trianglePoint2.X - point.X) * (trianglePoint3.Y - point.Y) - (trianglePoint3.X - point.X) * (trianglePoint2.Y - point.Y));
        let area3 = Math.abs((trianglePoint3.X - point.X) * (trianglePoint1.Y - point.Y) - (trianglePoint1.X - point.X) * (trianglePoint3.Y - point.Y));
        let areaTotal = area1 + area2 + area3;
        return (areaTotal >= areaOrig - buffer && areaTotal <= areaOrig + buffer);
    }

    /**
     * 檢查點與多邊形
     * @param point 檢查座標點
     * @param points 多邊形頂點
     */
    public static CheckPointPolygon(point: Vector2, points: Vector2[]): boolean {
        let collision = false;
        for (let index = 0, max = points.length; index < max; index++) {
            let currentPoint = points[index];
            let next = (index === max - 1) ? 0 : index + 1;
            let nextPoint = points[next];
            let judgeX = point.X < (nextPoint.X - currentPoint.X) * (point.Y - currentPoint.Y) / (nextPoint.Y - currentPoint.Y) + currentPoint.X;
            let judgeY = (currentPoint.Y >= point.Y && nextPoint.Y < point.Y) || (currentPoint.Y < point.Y && nextPoint.Y >= point.Y);
            if (judgeX && judgeY) {
                collision = !collision;
            }
        }
        return collision;
    }

    /**
    * 檢查線與圓形
    * @param circlePointA 圓心座標
    * @param radiusA 圓的半徑
    * @param circlePointB 圓心座標
    * @param radiusB 圓的半徑
    */
    public static CheckLineCircle(p1: Vector2, p2: Vector2, circlePoint: Vector2, radius: number): boolean {
        let isInside1 = this.CheckPointCircle(p1, circlePoint, radius);
        let isInside2 = this.CheckPointCircle(p2, circlePoint, radius);
        if (isInside1 || isInside2) { return true; };

        let pointVectorX = p2.X - p2.X;
        let pointVectorY = p2.Y - p2.Y;
        let t = (pointVectorX * (circlePoint.X - p1.X) + pointVectorY * (circlePoint.Y - p1.Y)) / (pointVectorX * pointVectorX + pointVectorY * pointVectorY);
        let closestX = p1.X + t * pointVectorX;
        let closestY = p1.Y + t * pointVectorY;

        let isOnSegment = this.CheckLinePoint(p1, p2, circlePoint);
        if (!isOnSegment) { return false; };

        let distX = closestX - circlePoint.X;
        let distY = closestY - circlePoint.Y;
        let distance = Math.sqrt((distX * distX) + (distY * distY));

        return (distance <= radius);
    }

    /**
     * 檢查線與點
     * @param pointStart 線的其一座標點
     * @param pointEnd 線的另一座標點
     * @param circlePoint 圓心點
     * @param buffer 允許誤差值
     */
    public static CheckLinePoint(pointStart: Vector2, pointEnd: Vector2, circlePoint: Vector2, buffer: number = 0.1): boolean {
        let d1 = Vector2.Distance(circlePoint, pointStart);
        let d2 = Vector2.Distance(circlePoint, pointEnd);
        let lineLen = Vector2.Distance(pointStart, pointEnd);
        return (d1 + d2 >= lineLen - buffer && d1 + d2 <= lineLen + buffer);
    }

    /**
     * 檢查線與線
     * @param p1Start 線1的其一座標點
     * @param p1End 線1的另一座標點
     * @param p2Start 線2的其一座標點
     * @param p2End 線2的另一座標點
     */
    public static CheckLineLine(p1Start: Vector2, p1End: Vector2, p2Start: Vector2, p2End: Vector2): boolean {
        let t1 = ((p2End.X - p2Start.X) * (p1Start.Y - p2Start.Y) - (p2End.Y - p2Start.Y) * (p1Start.X - p2Start.X)) / ((p2End.Y - p2Start.Y) * (p1End.X - p1Start.X) - (p2End.X - p2Start.X) * (p1End.Y - p1Start.Y));
        let t2 = ((p1End.X - p1Start.X) * (p1Start.Y - p2Start.Y) - (p1End.Y - p1Start.Y) * (p1Start.X - p2Start.X)) / ((p2End.Y - p2Start.Y) * (p1End.X - p1Start.X) - (p2End.X - p2Start.X) * (p1End.Y - p1Start.Y));
        return (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1);
    }

    /**
    * 檢查線與矩形
    * @param pointStart 線的其一座標點
    * @param pointEnd 線的另一座標點
    * @param rectanglePoint 矩形的頂點座標
    * @param width  矩形的寬
    * @param height 矩形的高
    */
    public static CheckLineRectangle(pointStart: Vector2, pointEnd: Vector2, rectanglePoint: Vector2, width: number, height: number): boolean {
        let p1 = Vector2.Zero;
        p1.X = rectanglePoint.X;
        p1.Y = rectanglePoint.Y + height;

        let p2 = Vector2.Zero;
        p2.X = rectanglePoint.X + width;
        p2.Y = rectanglePoint.Y;

        let p3 = Vector2.Zero;
        p3.X = rectanglePoint.X + width;
        p3.Y = rectanglePoint.Y + height;

        let isLeftCollision = this.CheckLineLine(pointStart, pointEnd, rectanglePoint, p1);
        let isRightCollision = this.CheckLineLine(pointStart, pointEnd, p2, p3);
        let isTopCollision = this.CheckLineLine(pointStart, pointEnd, rectanglePoint, p2);
        let isBottomCollision = this.CheckLineLine(pointStart, pointEnd, p1, p3);

        return (isLeftCollision || isRightCollision || isTopCollision || isBottomCollision);
    }

    /**
    * 檢查矩形與矩形
    * @param rectanglePointA 矩形A的頂點座標
    * @param widthA  矩形A的寬
    * @param heightA 矩形A的高
    * @param rectanglePointB 矩形B的頂點座標
    * @param widthB  矩形B的寬
    * @param heightB 矩形B的高
    */
    public static CheckRectangleRectangle(rectanglePointA: Vector2, widthA: number, heightA: number, rectanglePointB: Vector2, widthB: number, heightB: number): boolean {
        return (rectanglePointA.X + widthA >= rectanglePointB.X && rectanglePointA.X <= rectanglePointB.X + widthB && rectanglePointA.Y + heightA >= rectanglePointB.Y && rectanglePointA.Y <= rectanglePointB.Y + heightB);
    }

    /**
    * 檢查矩形與圓形
    * @param circlePoint 圓心的座標
    * @param radius 圓的半徑
    * @param rectanglePoint 矩形的頂點座標
    * @param width  矩形的寬
    * @param height 矩形的高
    */
    public static CheckRectangleCircle(circlePoint: Vector2, radius: number, rectanglePoint: Vector2, width: number, height: number): boolean {
        let nearestX = circlePoint.X;
        let nearestY = circlePoint.Y;
        if (circlePoint.X < rectanglePoint.X) {
            nearestX = rectanglePoint.X;
        }
        else if (circlePoint.X > rectanglePoint.X + width) {
            nearestX = rectanglePoint.X + width;
        }
        if (circlePoint.Y < rectanglePoint.Y) {
            nearestY = rectanglePoint.Y;
        }
        else if (circlePoint.Y > rectanglePoint.Y + height) {
            nearestY = rectanglePoint.Y + height;
        }
        let distX = circlePoint.X - nearestX;
        let distY = circlePoint.Y - nearestY;
        let distance = Math.sqrt((distX * distX) + (distY * distY));

        return (distance <= radius);
    }

    /**
    * 檢查圓形與圓形
    * @param circlePointA 圓心座標
    * @param radiusA 圓的半徑
    * @param circlePointB 圓心座標
    * @param radiusB 圓的半徑
    */
    public static CheckCircleCircle(circlePointA: Vector2, radiusA: number, circlePointB: Vector2, radiusB: number): boolean {
        return (Vector2.Distance(circlePointA, circlePointB) <= (radiusA + radiusB));
    }

    /**
     * 檢查多邊形與圓形
     * @param points 多邊形各頂點
     * @param circlePoint 圓心座標
     * @param radius 圓的半徑
     */
    public static CheckPolygonCircle(points: Vector2[], circlePoint: Vector2, radius: number): boolean {
        for (let index = 0, max = points.length; index < max; index++) {
            let currentPoint = points[index];
            let next = (index === max - 1) ? 0 : index + 1;
            let nextPoint = points[next];
            if (this.CheckLineCircle(currentPoint, nextPoint, circlePoint, radius)) { return true; }
        }
        return false;
    }

    /**
    * 檢查多邊形與矩形
    * @param points 多邊形各頂點
    * @param rectanglePoint 矩形的頂點座標
    * @param width  矩形的寬
    * @param height 矩形的高
    */
    public static CheckPolygonRectangle(points: Vector2[], rectanglePoint: Vector2, width: number, height: number): boolean {
        for (let index = 0, max = points.length; index < max; index++) {
            let currentPoint = points[index];
            let next = (index === max - 1) ? 0 : index + 1;
            let nextPoint = points[next];
            let collision = this.CheckLineRectangle(currentPoint, nextPoint, rectanglePoint, width, height);
            if (collision) { return true; }
        }
        return false;
    }

    /**
    * 檢查多邊形與線
    * @param points 多邊形各頂點
    * @param pointStart 線的其一座標點
    * @param pointEnd 線的另一座標點
    */
    public static CheckPolygonLine(points: Vector2[], pointStart: Vector2, pointEnd: Vector2): boolean {
        for (let index = 0, max = points.length; index < max; index++) {
            let currentPoint = points[index];
            let next = (index === max - 1) ? 0 : index + 1;
            let nextPoint = points[next];
            let collision = this.CheckLineLine(pointStart, pointEnd, currentPoint, nextPoint);
            if (collision) { return true; }
        }
        return false;
    }

    /**
     * 檢查多邊形與多邊形
     * @param pointsA 多邊形A各頂點
     * @param pointsB 多邊形B各頂點
     */
    public static CheckPolygonPolygon(pointsA: Vector2[], pointsB: Vector2[]): boolean {
        for (let index = 0, max = pointsA.length; index < max; index++) {
            let currentPoint = pointsA[index];
            let next = (index === max - 1) ? 0 : index + 1;
            let nextPoint = pointsA[next];
            let collision = this.CheckPolygonLine(pointsB, currentPoint, nextPoint);
            if (collision) { return true; }
        }
        return false;
    }

    /**
     * 分離軸檢測
     * @param pointsA 多邊形A各頂點
     * @param pointsB 多邊形B各頂點
     */
    public static SATDetection(pointsA: Vector2[], pointsB: Vector2[]): boolean {
        let isSeparated = false;

        let normal_polygonA = this.getNormalAxes(pointsA);
        let normal_polygonB = this.getNormalAxes(pointsB);

        for (let i = 0; i < normal_polygonA.length; i++) {
            let minMax_A = this.getMinMaxProjection(pointsA, normal_polygonA[i]);
            let minMax_B = this.getMinMaxProjection(pointsB, normal_polygonA[i]);

            isSeparated = (minMax_B.min > minMax_A.max || minMax_A.min > minMax_B.max);

            if (isSeparated) break;
        }

        if (!isSeparated) {
            for (let i = 0; i < normal_polygonB.length; i++) {
                let minMax_A = this.getMinMaxProjection(pointsA, normal_polygonB[i]);
                let minMax_B = this.getMinMaxProjection(pointsB, normal_polygonB[i]);

                isSeparated = (minMax_B.min > minMax_A.max || minMax_A.min > minMax_B.max);

                if (isSeparated) break;
            }
        }
        return !isSeparated;
    }

    /** 取得分離軸 */
    public static getNormalAxes(points: Vector2[]): Vector2[] {
        let axes = [];
        for (let i = 0; i < points.length; i++) {
            let p1 = (i === 0) ? points[points.length - 1] : points[i - 1];
            let p2 = points[i];
            axes.push(Vector2.Sub(p1, p2).NormalL);
        }
        return axes;
    }

    /** 取得分離軸上的投影min,max值 */
    public static getMinMaxProjection(points: Vector2[], axis: Vector2): { min: number, max: number } {
        let minDotProduct = points[0].ProjectLengthOnto(axis);
        let maxDotProduct = points[0].ProjectLengthOnto(axis);

        for (let i = 1; i < points.length; i++) {
            let tmp = points[i].ProjectLengthOnto(axis);
            if (tmp < minDotProduct) {
                minDotProduct = tmp;
            }
            if (tmp > maxDotProduct) {
                maxDotProduct = tmp;
            }
        }

        let result =
        {
            min: minDotProduct,
            max: maxDotProduct
        };

        return result;
    }
}