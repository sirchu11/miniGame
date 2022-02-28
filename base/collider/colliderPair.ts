import Collider2DBase from './collider2dBase';

export default class ColliderPair {
    constructor(colliderA: Collider2DBase, colliderB: Collider2DBase) {
        this.colliderA = colliderA;
        this.colliderB = colliderB;
    }

    private isFirst: boolean = true;
    /** 第一次被配對 */
    public get IsFirst(): boolean { return this.isFirst; }
    public set IsFirst(boolean: boolean) { this.isFirst = boolean; }
    private colliderA: Collider2DBase;
    public get ColliderA(): Collider2DBase { return this.colliderA; }
    private colliderB: Collider2DBase;
    public get ColliderB(): Collider2DBase { return this.colliderB; }

    /** 相同碰撞對 */
    public CheckPair(collider1: Collider2DBase, collider2: Collider2DBase): boolean {
        return (this.ColliderA === collider1 || this.ColliderA === collider2) && (this.ColliderB === collider1 || this.ColliderB === collider2);
    }

    /** 碰撞對包含此碰撞物 */
    public HasCollider(collider: Collider2DBase): boolean {
        return (this.ColliderA === collider || this.ColliderB === collider);
    }

    /** 取得碰撞對的另一個 */
    public GetAnotherCollider(collider: Collider2DBase): Collider2DBase | undefined {
        if (this.HasCollider(collider)) {
            return (this.ColliderA === collider) ? this.ColliderA : this.ColliderB;
        }
        return undefined;
    }
}