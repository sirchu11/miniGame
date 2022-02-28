
import Collider2DBase, { ColliderDataType } from './collider2dBase'
import Vector2 from '../tool/vector2';
import DetectionTool from './detectionTool'
import ColliderPair from './colliderPair';
import ColliderGroup from './colliderGroup';
import Logger, { LogType } from '../tool/logger';

// 碰撞管理器
export default class ColliderManager {
    private static instance: ColliderManager;
    private rangeVisible = false;
    private active = true;
    private groupMap: Map<string, ColliderGroup> = new Map<string, ColliderGroup>();
    private collisionPair: ColliderPair[] = [];
    private endCollisionPair: ColliderPair[] = [];

    constructor() {
        this.Update = this.Update.bind(this);
    };

    public static get Ins(): ColliderManager {
        if (this.instance == null) {
            this.instance = new ColliderManager();
        }
        return this.instance;
    }

    /** 加入碰撞器監聽 */
    public AddCollider(collider: Collider2DBase) {
        let groupName = collider.Group;
        if (!this.groupMap.has(groupName)) {
            this.groupMap.set(groupName, new ColliderGroup(groupName));
        }
        let group = this.groupMap.get(groupName);
        group?.AddCollider(collider);
        collider.RangeVisible(this.rangeVisible);
        collider.Active = this.active;
    }

    /** 移除碰撞器監聽 */
    public RemoveCollider(collider: Collider2DBase) {
        let groupName = collider.Group;
        if (this.groupMap.has(groupName)) {
            //從群組中移除
            let group = this.groupMap.get(groupName);
            group?.RemoveCollider(collider);
            this.RemoveColliderFromCollisionPair(collider);
            collider.Clear();
        }
        else {
            Logger.Log(LogType.Client, '不在管理列表中', collider.name);
        }
    }

    /** 移除指定碰撞組 */
    public RemoveGroupByGroupName(groupName: string) {
        if (this.groupMap.has(groupName)) {
            let group = this.groupMap.get(groupName);
            group?.ColliderList.forEach((collider) => {
                this.RemoveColliderFromCollisionPair(collider);
            });
            group?.Clear();
        }
        else {
            Logger.Log(LogType.Client, '不存在的移除指定碰撞組', groupName);
        }
    }

    /** 取得指定碰撞組 */
    public GetGroupByGroupName(groupName: string): ColliderGroup | undefined {
        return this.groupMap.get(groupName);
    }

    /** 取得所有與Collider碰撞中的Collider */
    public GetCollidersOfColliderPair(collider: Collider2DBase): Collider2DBase[] {
        let result = [];
        for (let index = 0; index < this.collisionPair.length; index++) {
            let collisionPair = this.collisionPair[index];
            let anotherCollider = collisionPair.GetAnotherCollider(collider);
            if (anotherCollider) {
                result.push(anotherCollider);
            }
        }
        return result;
    }

    /** 控制所有Group的Active */
    public SetActive(bool: boolean) {
        this.groupMap.forEach((group) => {
            group.SetActive(bool);
        });
        this.active = bool;
    }

    /** 啟用顯示碰撞器的碰撞範圍 */
    public SetRangeVisible(bool: boolean) {
        this.rangeVisible = bool;
        this.groupMap.forEach((group) => {
            group.SetRangeVisible(bool);
        });
    }

    /** 碰撞檢測 */
    public ColliderDetection(colliderA: Collider2DBase, colliderB: Collider2DBase): boolean {
        if (!colliderA.Active || !colliderB.Active) { return false };

        let isDetection = false;
        if (colliderA.Type == ColliderDataType.Circle && colliderB.Type == ColliderDataType.Rectangle) {
            //1個圓1個矩形的碰撞
            isDetection = this.CircleRectangleDetection(colliderA, colliderB);
        }
        else if (colliderA.Type == ColliderDataType.Circle && colliderB.Type == ColliderDataType.Polygon) {
            //1個圓形與1個多邊形碰撞
            isDetection = this.PolygonCircleDetection(colliderB, colliderA);
        }
        else if (colliderA.Type == ColliderDataType.Rectangle && colliderB.Type == ColliderDataType.Rectangle) {
            //2個矩形狀的碰撞
            isDetection = this.RectangleDetection(colliderA, colliderB);
        }
        else if (colliderA.Type == ColliderDataType.Circle && colliderA.Type == ColliderDataType.Circle) {
            //2個圓的碰撞
            isDetection = this.CircleDetection(colliderA, colliderB);
        }
        else if (colliderA.Type == ColliderDataType.Rectangle && colliderB.Type == ColliderDataType.Circle) {
            //1個矩形1個圓的碰撞
            isDetection = this.CircleRectangleDetection(colliderB, colliderA);
        }
        else if (colliderA.Type == ColliderDataType.Polygon && colliderB.Type == ColliderDataType.Circle) {
            //1個多邊形與1個圓形碰撞
            isDetection = this.PolygonCircleDetection(colliderA, colliderB);
        }
        else if (colliderA.Type == ColliderDataType.Polygon && colliderB.Type == ColliderDataType.Rectangle) {
            //1個多邊形與1個矩形碰撞
            isDetection = this.PolygonRectangleDetection(colliderA, colliderB);
        }
        else if (colliderA.Type == ColliderDataType.Rectangle && colliderB.Type == ColliderDataType.Polygon) {
            //1個矩形與1個多邊形碰撞
            isDetection = this.PolygonRectangleDetection(colliderB, colliderA);
        }
        else if (colliderA.Type == ColliderDataType.Polygon && colliderB.Type == ColliderDataType.Polygon) {
            //多邊形碰撞
            isDetection = this.PolygonDetection(colliderA, colliderB);
        }
        return isDetection;
    }

    public Clear() {
        this.groupMap.forEach((group) => {
            group?.ColliderList.forEach((collider) => {
                this.RemoveColliderFromCollisionPair(collider);
            })
            group?.Clear();
        });
        this.groupMap.clear();
    }

    /** 執行一次碰撞檢測與通知碰撞事件*/
    public Update() {
        this.OnCollisionDetection();
        this.CollisionStart();
        this.CollisionActive();
        this.CollisionEnd();
    }

    /** 矩形中的碰撞檢測 */
    protected RectangleDetection(rectangleA: Collider2DBase, rectangleB: Collider2DBase): boolean {
        //還原成左上為頂點
        let rectanglePointA: Vector2 = new Vector2(rectangleA.GlobalX - rectangleA.pivot.x, rectangleA.GlobalY - rectangleA.pivot.y);
        let rectanglePointB: Vector2 = new Vector2(rectangleB.GlobalX - rectangleB.pivot.x, rectangleB.GlobalY - rectangleB.pivot.y);
        return DetectionTool.CheckRectangleRectangle(rectanglePointA, rectangleA.width, rectangleA.height, rectanglePointB, rectangleB.width, rectangleB.height);
    }

    /** 圓形中的碰撞檢測 */
    protected CircleDetection(circleA: Collider2DBase, circleB: Collider2DBase): boolean {
        let circleAPoint = new Vector2(circleA.GlobalX, circleA.GlobalY);
        let circleBPoint = new Vector2(circleB.GlobalX, circleB.GlobalY);
        return DetectionTool.CheckCircleCircle(circleAPoint, circleA.width / 2, circleBPoint, circleB.width / 2);
    }

    /** 矩形和圓形中的碰撞檢測 */
    protected CircleRectangleDetection(circle: Collider2DBase, rectangle: Collider2DBase): boolean {
        //還原成左上為頂點
        let rectanglePoint: Vector2 = new Vector2(rectangle.GlobalX - rectangle.pivot.x, rectangle.GlobalY - rectangle.pivot.y);
        let circlePoint = new Vector2(circle.GlobalX, circle.GlobalY);
        return DetectionTool.CheckRectangleCircle(circlePoint, circle.width / 2, rectanglePoint, rectangle.width, rectangle.height);
    }

    /** 多邊形中的碰撞檢測 */
    protected PolygonDetection(polygonA: Collider2DBase, polygonB: Collider2DBase): boolean {
        return DetectionTool.SATDetection(polygonA.Vertexs, polygonB.Vertexs);
    }

    /** 多邊形與圓形的碰撞檢測 */
    protected PolygonCircleDetection(polygon: Collider2DBase, circle: Collider2DBase): boolean {
        let circlePoint = new Vector2(circle.GlobalX, circle.GlobalY);
        return DetectionTool.CheckPolygonCircle(polygon.Vertexs, circlePoint, circle.width / 2);
    }

    /** 多邊形與矩形的碰撞檢測 */
    protected PolygonRectangleDetection(polygon: Collider2DBase, rectangle: Collider2DBase): boolean {
        //還原成左上為頂點
        let rectanglePoint: Vector2 = new Vector2(rectangle.GlobalX - rectangle.pivot.x, rectangle.GlobalY - rectangle.pivot.y);
        return DetectionTool.CheckPolygonRectangle(polygon.Vertexs, rectanglePoint, rectangle.width, rectangle.height);
    }

    /** 碰撞檢測 */
    public OnCollisionDetection() {
        let groupList: ColliderGroup[] = [];
        this.groupMap.forEach(group => { groupList.push(group); });

        for (let c1 = 0, max = groupList.length; c1 < max; c1++) {
            for (let c2 = c1 + 1; c2 < max; c2++) {
                this.UpdateCollisionDetection(groupList[c1].ColliderList, groupList[c2].ColliderList);
            }
        }
    }

    /** 更新碰撞檢測資料 */
    private UpdateCollisionDetection(CollidersA: Collider2DBase[], CollidersB: Collider2DBase[]) {
        for (let c1 = 0; c1 < CollidersA.length; c1++) {
            let curCollider = CollidersA[c1];
            for (let c2 = 0; c2 < CollidersB.length; c2++) {
                let checkCollider = CollidersB[c2];

                if (this.ColliderDetection(curCollider, checkCollider)) {
                    //不在碰撞對清單中
                    if (!this.HasPair(curCollider, checkCollider)) {
                        this.collisionPair.push(new ColliderPair(curCollider, checkCollider));
                    }
                    else {
                        let index = this.HasPairIndex(curCollider, checkCollider);
                        this.collisionPair[index].IsFirst = false;
                    }
                }
                else {
                    //在碰撞對清單中
                    if (this.HasPair(curCollider, checkCollider)) {
                        let index = this.HasPairIndex(curCollider, checkCollider);
                        let pair = this.RemovePartByIndex(this.collisionPair, index);
                        this.endCollisionPair.push(pair);
                    }
                }
            }
        }
    }

    private RemovePartByIndex(collisionPairList: ColliderPair[], index: number): ColliderPair {
        let result = collisionPairList[index];
        collisionPairList.splice(index, 1);
        return result;
    }

    /** 已經存在的碰撞對 */
    private HasPairIndex(collider1: Collider2DBase, collider2: Collider2DBase): number {
        for (let index = 0; index < this.collisionPair.length; index++) {
            let pair = this.collisionPair[index];
            if (pair.CheckPair(collider1, collider2)) {
                return index;
            }
        }
        return -1;
    }

    /** 在更新開始後觸發，會提供當前幀中所有已開始碰撞的物體對列表(如果有的話)*/
    private CollisionStart() {
        for (let index = 0; index < this.collisionPair.length; index++) {
            let pair = this.collisionPair[index];
            if (pair.IsFirst) {
                pair.ColliderA?.CollisionStart(pair.ColliderB);
                pair.ColliderB?.CollisionStart(pair.ColliderA);
            }
        }
    }

    /** 在更新開始後觸發，會提供當前幀中所有發生碰撞的物體對列表(如果有的話) */
    private CollisionActive() {
        for (let index = 0; index < this.collisionPair.length; index++) {
            let pair = this.collisionPair[index];
            if (!pair.IsFirst) {
                pair.ColliderA?.CollisionActive(pair.ColliderB);
                pair.ColliderB?.CollisionActive(pair.ColliderA);
            }
        }
    }

    /** 在更新開始後觸發，會提供當前幀中所有已經碰撞完的物體對列表(如果有的話) */
    private CollisionEnd() {
        for (let index = 0; index < this.endCollisionPair.length; index++) {
            let pair = this.endCollisionPair[index];
            pair.ColliderA?.CollisionEnd(pair.ColliderB);
            pair.ColliderB?.CollisionEnd(pair.ColliderA);
        }
        this.endCollisionPair = [];
    }

    /** 已經存在的碰撞對 */
    private HasPair(collider1: Collider2DBase, collider2: Collider2DBase): boolean {
        for (let index = 0; index < this.collisionPair.length; index++) {
            let pair = this.collisionPair[index];
            if (pair.CheckPair(collider1, collider2)) {
                return true;
            }
        }
        return false;
    }

    /** 從存在的碰撞對中移除碰撞器 */
    private RemoveColliderFromCollisionPair(collider: Collider2DBase) {
        //從碰撞對中移除
        for (let index = 0; index < this.collisionPair.length; index++) {
            let removeCount = 0;
            let collisionPair = this.collisionPair[index - removeCount];
            if (collisionPair.HasCollider(collider)) {
                this.collisionPair.splice(index - removeCount, 1);
                removeCount++;
            }
        }
    }

}