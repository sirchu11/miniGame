import Collider2DBase from './collider2dBase';

export default interface ICollider {
    /** 在引擎更新後觸發，開始碰撞的物體 */
    CollisionStart(colliderSender: Collider2DBase, colliderHandler: Collider2DBase): void

    /** 在引擎更新後觸發，持續發生碰撞的物體 */
    CollisionActive(colliderSender: Collider2DBase, colliderHandler: Collider2DBase): void

    /** 在引擎更新後觸發，離開碰撞的物體 */
    CollisionEnd(colliderSender: Collider2DBase, colliderHandler: Collider2DBase): void
}