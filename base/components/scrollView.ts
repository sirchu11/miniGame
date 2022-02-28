import { Container, Graphics, MaskData, Rectangle, MASK_TYPES, InteractionEvent, IPointData, Point } from 'pixi.js';
import Method from '../tool/method';
import TimeManager from '../tool/timeManager';
import gsap from 'gsap';

export enum SCROLL_DIRECTION {
    HORIZONTAL = 0,
    VERTICAL,
    BOTH
}

export default class ScrollView extends Container {
    private scrollMask: MaskData;
    private contentContainer: Container;
    private viewWidth: number;
    private viewHeight: number;
    private containerWidth: number;
    private containerHeight: number
    private scrolling: boolean = false;
    // 是否開啟回彈
    private bounceable: boolean = true;
    // 是否開啟慣性滑動
    private isInertia: boolean = true;
    // 可滑動超出比例
    private containerExceedRatio: number = 0.25;
    // 回彈秒數
    private bounceBackDuration: number = 0.5;
    // 開始滑動的閥值
    private scrollThreshold: number = 15;
    // 滑動靈敏度
    private scrollSensitivity: number = 1;
    private inertiaSensitivity: number = 1;
    private inertiaInitSpeedMax: number = 10000;
    private inertiaAcceleration: number = 5000;
    private scrollDirection: SCROLL_DIRECTION;
    private scrollAnimation: any;
    private scrollPosition: IPointData | null;
    private beginContainerPosition: IPointData | null;
    private touchMovedPoses: Array<IPointData>;
    private touchMovedTimeStamps: Array<number>;
    private outsideBorderMonitor = null;
    private borderMonitorTimer: number = 0;

    constructor(viewWidth: number, viewHeight: number, contentContainer: Container, containerWidth: number, containerHeight: number, direction: SCROLL_DIRECTION) {
        super();

        this.viewWidth = viewWidth;
        this.viewHeight = viewHeight;
        this.containerWidth = containerWidth;
        this.containerHeight = containerHeight;
        this.scrollDirection = direction;

        this.monitorOutsideBorder = this.monitorOutsideBorder.bind(this);

        this.initMask();
        this.contentContainer = contentContainer;
        this.contentContainer.position.set(0, 0);
        this.addChild(this.contentContainer);
        this.registerPointerEventHandler();
    }

    private initMask() {
        let rect = new Graphics();
        rect.beginFill(0x000000, 0);
        rect.drawRect(0, 0, this.viewWidth, this.viewHeight);
        rect.endFill();
        this.addChild(rect);

        this.scrollMask = new MaskData(rect);
        this.scrollMask.type = MASK_TYPES.SCISSOR;
        this.scrollMask.autoDetect = false;
        this.mask = this.scrollMask
        this.hitArea = new Rectangle(0, 0, this.viewWidth, this.viewHeight);
    }

    private registerPointerEventHandler() {
        this.setTouchEnabled(true);
        this.on('pointerdown', (e) => { this.onScrollStart(e); });
        this.on('pointermove', (e) => { this.onScrollMove(e); });
        this.on('pointerup', (e) => { this.onScrollEnd(e); });
        this.on('pointerupoutside', (e) => { this.onScrollEnd(e); });
    }

    public set Inertia(enable: boolean) {
        this.isInertia = enable;
    }

    public get Inertia(): boolean {
        return this.isInertia;
    }

    public set Bounceable(enable: boolean) {
        this.bounceable = enable;
    }

    public get Bounceable(): boolean {
        return this.bounceable;
    }

    public set ContainerExceedRatio(exceedRatio: number) {
        this.containerExceedRatio = exceedRatio;
    }

    public get ContainerExceedRatio(): number {
        return this.containerExceedRatio;
    }

    public set BounceBackDuration(bounceBackDuration: number) {
        this.bounceBackDuration = bounceBackDuration;
    }

    public get BounceBackDuration(): number {
        return this.bounceBackDuration;
    }

    public set ScrollThreshold(scrollThreshold: number) {
        this.scrollThreshold = scrollThreshold;
    }

    public get ScrollThreshold(): number {
        return this.scrollThreshold;
    }

    public set ScrollSensitivity(scrollSensitivity: number) {
        this.scrollSensitivity = scrollSensitivity;
    }

    public get ScrollSensitivity(): number {
        return this.scrollSensitivity;
    }

    public set InertiaSensitivity(inertiaSensitivity: number) {
        this.inertiaSensitivity = inertiaSensitivity;
    }

    public get InertiaSensitivity(): number {
        return this.inertiaSensitivity;
    }

    public set InertiaInitSpeedMax(inertiaInitSpeedMax: number) {
        this.inertiaInitSpeedMax = inertiaInitSpeedMax;
    }

    public get InertiaInitSpeedMax(): number {
        return this.inertiaInitSpeedMax;
    }

    public set InertiaAcceleration(inertiaAcceleration: number) {
        this.inertiaAcceleration = inertiaAcceleration;
    }

    public get InertiaAcceleration(): number {
        return this.inertiaAcceleration;
    }

    public set ViewWidth(viewWidth: number) {
        this.viewWidth = viewWidth;
        this.initMask();
    }

    public get ViewWidth(): number {
        return this.viewWidth;
    }

    public set ViewHeight(viewHeight: number) {
        this.viewHeight = viewHeight;
        this.initMask();
    }

    public get ViewHeight(): number {
        return this.viewHeight;
    }

    public setTouchEnabled(enable: boolean) {
        this.buttonMode = enable;
        this.interactive = enable;
    }

    public onScrollStart(interactionEvent: InteractionEvent) {
        interactionEvent.stopPropagation();

        this.stopScrollAnimation();
        this.scrolling = false;
        this.scrollPosition = interactionEvent.data.getLocalPosition(this.parent);
        this.beginContainerPosition = this.scrollPosition;

        this.touchMovedPoses = [];
        this.touchMovedTimeStamps = [];
        let timeStamp = Date.now();
        let touchPoint = new Point(this.scrollPosition.x, this.scrollPosition.y);
        for (let index = 0; index < 4; index++) {
            this.touchMovedPoses.push(touchPoint);
            this.touchMovedTimeStamps.push(timeStamp);
        }
    }

    public onScrollMove(interactionEvent: InteractionEvent) {
        if (!this.scrollPosition)
            return;

        interactionEvent.stopPropagation();

        let scrollPosition = interactionEvent.data.getLocalPosition(this.parent);
        if (!this.judgeIsMoved(scrollPosition) || this.checkTouchOutRect(scrollPosition))
            return;

        if (this.scrollDirection !== SCROLL_DIRECTION.BOTH) {
            let timeStamp = Date.now();
            for (let index = 0; index < 3; index++) {
                this.touchMovedPoses[index] = this.touchMovedPoses[index + 1];
                this.touchMovedTimeStamps[index] = this.touchMovedTimeStamps[index + 1];
            }
            this.touchMovedPoses[3] = scrollPosition;
            this.touchMovedTimeStamps[3] = timeStamp;
        }
        this.handleContainerScrollMove(scrollPosition);
    }

    public onScrollEnd(interactionEvent: InteractionEvent) {
        if (!this.scrollPosition)
            return;

        let scrollPosition = interactionEvent.data.getLocalPosition(this.parent);
        this.scrollAnimation = this.handleInertiaScroll(scrollPosition);
        this.scrolling = false;
        this.scrollPosition = null;
        this.beginContainerPosition = null;
    }

    private judgeIsMoved(scrollPosition: IPointData): boolean {
        if (this.scrolling === true)
            return true;
        if (!this.scrollPosition)
            return false;

        let dis = 0;
        switch (this.scrollDirection) {
            case SCROLL_DIRECTION.HORIZONTAL:
                dis = Math.abs(scrollPosition.x - this.scrollPosition.x);
                break;
            case SCROLL_DIRECTION.VERTICAL:
                dis = Math.abs(scrollPosition.y - this.scrollPosition.y);
                break;
            case SCROLL_DIRECTION.BOTH:
                dis = Method.CalcTwoPointDistance(scrollPosition.x, scrollPosition.y, this.scrollPosition.x, this.scrollPosition.y);
                break;
        }

        if (dis > this.scrollThreshold) {
            this.scrollPosition = scrollPosition;
            this.scrolling = true;
            return true;
        }
        return false;
    }

    private checkTouchOutRect(scrollPosition: IPointData) {
        return (
            scrollPosition.y < this.position.y ||
            scrollPosition.y > this.position.y + this.viewHeight ||
            scrollPosition.x < this.position.x ||
            scrollPosition.x > this.position.x + this.viewWidth
        );
    }

    private handleContainerScrollMove(scrollPosition: IPointData) {
        if (!this.scrollPosition)
            return;

        let distanceX = (scrollPosition.x - this.scrollPosition.x) * this.scrollSensitivity;
        let distanceY = (scrollPosition.y - this.scrollPosition.y) * this.scrollSensitivity;
        switch (this.scrollDirection) {
            case SCROLL_DIRECTION.HORIZONTAL:
                this.contentContainer.position.x = this.fixExceedLimit(
                    this.contentContainer.position.x + distanceX,
                    this.viewWidth,
                    this.containerWidth
                );
                break;

            case SCROLL_DIRECTION.VERTICAL:
                this.contentContainer.position.y = this.fixExceedLimit(
                    this.contentContainer.position.y + distanceY,
                    this.viewHeight,
                    this.containerHeight
                );
                break;

            case SCROLL_DIRECTION.BOTH:
                this.contentContainer.position.x = this.fixExceedLimit(
                    this.contentContainer.position.x + distanceX,
                    this.viewWidth,
                    this.containerWidth
                );
                this.contentContainer.position.y = this.fixExceedLimit(
                    this.contentContainer.position.y + distanceY,
                    this.viewHeight,
                    this.containerHeight
                );
                break;
        }
        this.scrollPosition = scrollPosition;
    }

    private handleInertiaScroll(scrollPosition: IPointData) {
        let bounceBack = this.handleBounceBack();
        if (bounceBack)
            return bounceBack;

        if (!this.isInertia)
            return;

        let inertiaInitSpeed = this.getInertiaInitSpeed();

        let direction = inertiaInitSpeed >= 0 ? 1 : -1;
        inertiaInitSpeed = this.inertiaSensitivity * Math.abs(inertiaInitSpeed);
        inertiaInitSpeed = inertiaInitSpeed > this.inertiaInitSpeedMax ? this.inertiaInitSpeedMax : inertiaInitSpeed;
        inertiaInitSpeed = this.fixInertiaSpeedByScrollDirection(inertiaInitSpeed, scrollPosition);

        let acceleration = this.inertiaAcceleration >= 0 ? this.inertiaAcceleration : 0;
        let slideDuration = this.getInertiaSlideDuration(inertiaInitSpeed, acceleration);
        let slideDistance = this.getInertiaSlideDistance(inertiaInitSpeed, acceleration);
        let targetPosition = this.getInertiaSlidePosition(slideDistance, direction);
        slideDuration = this.fixedSlideDuration(slideDuration, targetPosition, slideDistance);

        // 播動畫
        this.startMonitorOutsideBorder();
        return this.playInertiaSlideAnimation(slideDuration, targetPosition);
    }

    private handleBounceBack() {
        let onComplete = () => {
            this.stopScrollAnimation();
        };

        if (!this.bounceable) {
            onComplete();
            return;
        }


        let originX = this.contentContainer.position.x;
        let originY = this.contentContainer.position.y;
        let minOffset = this.getMinContainerOffset();
        let maxOffset = this.getMaxContainerOffset();

        if (!minOffset || !maxOffset) return undefined;

        let targetX = originX;
        let targetY = originY;
        switch (this.scrollDirection) {
            case SCROLL_DIRECTION.HORIZONTAL:
                if (originX >= minOffset.x && originX <= maxOffset.x) {
                    return undefined;
                }

                if (originX < minOffset.x)
                    targetX = minOffset.x;
                else if (originX > maxOffset.x)
                    targetX = maxOffset.x;
                break;

            case SCROLL_DIRECTION.VERTICAL:
                if (originY >= minOffset.y && originY <= maxOffset.y) {
                    return undefined;
                }

                if (originY < minOffset.y)
                    targetY = minOffset.y;
                else if (originY > maxOffset.y)
                    targetY = maxOffset.y;
                break;

            case SCROLL_DIRECTION.BOTH:
                if (originX >= minOffset.x && originX <= maxOffset.x && originY >= minOffset.y && originY <= maxOffset.y) {
                    return undefined;
                }

                if (originX < minOffset.x)
                    targetX = minOffset.x;
                else if (originX > maxOffset.x)
                    targetX = maxOffset.x;

                if (originY < minOffset.y)
                    targetY = minOffset.y;
                else if (originY > maxOffset.y)
                    targetY = maxOffset.y;
                break;
        }
        return gsap.to(this.contentContainer, this.bounceBackDuration, { x: targetX, y: targetY, ease: 'expo.out', onComplete: onComplete });
    }

    private fixExceedLimit(value: number, scrollViewLength: number, containerLength: number) {
        let lowerLimit = scrollViewLength * this.containerExceedRatio;
        let upperLimit = scrollViewLength - containerLength - lowerLimit;
        if (value > lowerLimit)
            return lowerLimit;
        else if (value < upperLimit)
            return upperLimit;
        else
            return value;
    }

    private getMinContainerOffset() {
        let posX = this.viewWidth - this.containerWidth * this.contentContainer.scale.x;
        let posY = this.viewHeight - this.containerHeight * this.contentContainer.scale.y;
        return {
            x: posX > 0 ? 0 : posX,
            y: posY > 0 ? 0 : posY
        }
    }

    private getMaxContainerOffset() {
        return {
            x: 0,
            y: 0
        };
    }

    private getInertiaInitSpeed(): number {
        let recordFirst = 0;
        let recordLast = 3;
        let recordUnit = 1000;
        let deltaTime = 0;                              // sec
        let deltaDistance = 0                           // px
        let speed = 0;

        deltaTime = (this.touchMovedTimeStamps[recordLast] - this.touchMovedTimeStamps[recordFirst]) / recordUnit;
        if (deltaTime <= 0)
            return 0;
        switch (this.scrollDirection) {
            case SCROLL_DIRECTION.HORIZONTAL:
                deltaDistance = this.touchMovedPoses[recordLast].x - this.touchMovedPoses[recordFirst].x;
                break;

            case SCROLL_DIRECTION.VERTICAL:
                deltaDistance = this.touchMovedPoses[recordLast].y - this.touchMovedPoses[recordFirst].y;
                break;
        }
        speed = deltaDistance / deltaTime;

        return speed;
    }

    private fixInertiaSpeedByScrollDirection(inertiaInitSpeed: number, scrollPosition: IPointData) {
        if (!this.beginContainerPosition) return inertiaInitSpeed;

        let deltaX = scrollPosition.x - this.beginContainerPosition.x;
        let deltaY = scrollPosition.y - this.beginContainerPosition.y;
        let deltaDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        let fixedSpeed = 0;
        if (deltaDistance == 0)
            return inertiaInitSpeed;

        switch (this.scrollDirection) {
            case SCROLL_DIRECTION.HORIZONTAL:
                fixedSpeed = inertiaInitSpeed * (deltaX / deltaDistance);
                break;

            case SCROLL_DIRECTION.VERTICAL:
                fixedSpeed = inertiaInitSpeed * (deltaY / deltaDistance);
                break;

            default:
                fixedSpeed = inertiaInitSpeed;
                break;
        }

        return Math.abs(fixedSpeed);
    }

    private getInertiaSlideDuration(inertiaInitSpeed: number, acceleration: number) {
        if (acceleration == 0)
            return 0;
        let fixDegree = 1000;
        let slideDuration = inertiaInitSpeed / acceleration;
        let fixedDuration = Math.floor(fixDegree * slideDuration) / fixDegree;

        return fixedDuration;
    }

    private getInertiaSlideDistance(inertiaInitSpeed: number, acceleration: number) {
        if (acceleration == 0)
            return 0;

        return (inertiaInitSpeed * inertiaInitSpeed) / (2 * acceleration);
    }

    private getInertiaSlidePosition(slideDistance: number, direction: number) {
        let posX = this.contentContainer.position.x;
        let posY = this.contentContainer.position.y;

        switch (this.scrollDirection) {
            case SCROLL_DIRECTION.HORIZONTAL:
                posX = posX + slideDistance * direction;
                posX = this.fixExceedLimit(posX, this.viewWidth, this.containerWidth);
                break;

            case SCROLL_DIRECTION.VERTICAL:
                posY = posY + slideDistance * direction;
                posY = this.fixExceedLimit(posY, this.viewHeight, this.containerHeight);
                break;
        }

        return new Point(posX, posY);
    }

    private fixedSlideDuration(slideDuration: number, targetPosition: IPointData, slideDistance: number) {
        let containerPosition = this.contentContainer.position;
        let realSlideDistance = 0;
        switch (this.scrollDirection) {
            case SCROLL_DIRECTION.HORIZONTAL:
                realSlideDistance = Math.abs(targetPosition.x - containerPosition.x);
                break;

            case SCROLL_DIRECTION.VERTICAL:
                realSlideDistance = Math.abs(targetPosition.y - containerPosition.y);
                break;
        }

        return slideDuration * (realSlideDistance / slideDistance);
    }

    private playInertiaSlideAnimation(slideDuration: number, targetPosition: IPointData) {
        this.stopScrollAnimation();
        return gsap.timeline()
            .to(this.contentContainer, slideDuration, { x: targetPosition.x, y: targetPosition.y, ease: "expo.out" })
            .to(this.contentContainer, 0.2, {
                onComplete: () => {
                    this.stopScrollAnimation();
                    this.stopMonitorOutsideBorder();
                }
            })
    }

    private stopScrollAnimation() {
        if (!this.scrollAnimation)
            return;
        this.scrollAnimation.kill();
        this.scrollAnimation = null;
    }

    private startMonitorOutsideBorder() {
        if (this.outsideBorderMonitor)
            return;

        this.borderMonitorTimer = 0;
        this.outsideBorderMonitor = TimeManager.addGameListener(this.monitorOutsideBorder);
    }

    private stopMonitorOutsideBorder() {
        if (!this.outsideBorderMonitor)
            return;

        TimeManager.removeGameHandler(this.monitorOutsideBorder);
        this.borderMonitorTimer = 0;
        this.outsideBorderMonitor = null;
    }

    public monitorOutsideBorder(time: number) {
        this.borderMonitorTimer += time / 60;
        if (this.borderMonitorTimer < 0.2)
            return;

        this.borderMonitorTimer -= 0.2;
        let animation = this.handleBounceBack();
        if (!animation)
            return;

        this.stopMonitorOutsideBorder();
        this.stopScrollAnimation();
        this.scrollAnimation = animation;
    }

    public reset() {
        this.stopScrollAnimation();
        this.stopMonitorOutsideBorder();
        this.contentContainer.position.set(0, 0);
    }

    public destroy() {
        this.stopScrollAnimation();
        super.destroy({ children: true });
        Object.keys(this).forEach(key => this[key] = null);
    }
}