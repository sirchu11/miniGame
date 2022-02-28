import DeviceUtil from './deviceUtil';
import { Application } from 'pixi.js';

const MIN_SIZE = {
    width: 1136,
    height: 640
};

const MAX_SIZE = {
    width: 1493,
    height: 640
};

enum SizeStatus {
    normal = 'normal', // 在范围内
    outMax = 'outMax', // 超出最大尺寸比例
    outMin = 'outMin', // 小于最小尺寸比例
}

export enum SUBSCRIBE_TYPE {
    GAME = 0,
    OTHER,
    ALL
}

const MIN_RATIOS = MIN_SIZE.width / MIN_SIZE.height;
const MAX_RATIOS = MAX_SIZE.width / MAX_SIZE.height;

const REGISTER_DELAY_TIME = 200 // 注册适配事件延迟时间

class ScreenSize {
    public width: number;
    public height: number;
    public rendererWidth: number;
    public rendererHeight: number;
    public scale: number;
    public designWidth: number;
    public designHeight: number;

    constructor() {
        this.update();
    }

    public update() {
        const { innerWidth, innerHeight, outerWidth } = window;
        const { clientWidth, clientHeight } = document.documentElement;
        const isLand = DeviceUtil.isLandScape();
        const isAndroid = DeviceUtil.isAndroid();

        // 安卓Chrome使用client size取得最終可視大小，避免開關全屏時inner size被長壓屏幕中斷resize事件造成適配錯誤
        // IOS Chrome在豎屛使用outerWidth取代innerWidth，避免在Chrome 87版因innerWidth計算錯誤出現適配錯誤
        const bodyWidth = isAndroid && Math.min(innerWidth, clientWidth) || DeviceUtil.isIOSChrome && !isLand && outerWidth || innerWidth;
        const bodyHeight = isAndroid ? Math.min(innerHeight, clientHeight) : innerHeight;

        const pageScale = isAndroid ? bodyWidth / (outerWidth || bodyWidth) || 1 : 1;

        const realWidth = bodyWidth / pageScale;
        const realHeight = bodyHeight / pageScale;
        let newWidth = realWidth;
        let newHeight = realHeight;

        if (!isLand) {
            const temp = newWidth;
            newWidth = newHeight;
            newHeight = temp;
        }

        if (realWidth / realHeight > MAX_RATIOS) {
            newWidth = realHeight * MAX_RATIOS;
        }

        let status = SizeStatus.normal;
        const aspectRatio = newWidth / newHeight;
        if (aspectRatio > MAX_RATIOS) {
            newWidth = newHeight * MAX_RATIOS;
            status = SizeStatus.outMax;
            this.designHeight = MIN_SIZE.height;
            this.designWidth = this.designHeight * newWidth / newHeight;
        }
        else if (aspectRatio < MIN_RATIOS) {
            status = SizeStatus.outMin;
            this.designWidth = MIN_SIZE.width;
            this.designHeight = this.designWidth * newHeight / newWidth;
        }
        else {
            this.designHeight = MIN_SIZE.height;
            this.designWidth = this.designHeight * newWidth / newHeight;
        }

        if (isLand) {
            this.width = newWidth;
            this.height = newHeight;
        }
        else {
            this.width = newHeight;
            this.height = newWidth;
        }

        // 画布不能高于可视区域物理分辨率，否则会造成性能浪费
        let pixelWidth = this.width * devicePixelRatio;
        let pixelHeight = this.height * devicePixelRatio;

        // 画布大小不能高于设备逻辑分辨率 * 2， 以优化性能
        let maxWidth = Math.min((outerWidth || innerWidth) * 2, pixelWidth);
        let maxHeight = Math.min((outerHeight || innerHeight) * 2, pixelHeight);

        let scale = Math.min(maxWidth / this.width, maxHeight / this.height);
        this.rendererWidth = this.width * scale;
        this.rendererHeight = this.height * scale;

        this.scale = (isLand ? this.rendererWidth : this.rendererHeight) / this.designWidth;
    }
}

const screenSize = new ScreenSize();

class ScreenManager {
    private app: Application;
    private otherHandlers: Map<any, any> = new Map();
    private gameHandlers: Map<any, any> = new Map();
    private width: number;
    private height: number;
    public gameRatio: number;
    private destroyed: boolean = false;
    private registerTimeoutHandler: NodeJS.Timeout | null;

    constructor() {
        this.setSize = this.setSize.bind(this);
        this.handleLoad = this.handleLoad.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleOrientationchange = this.handleOrientationchange.bind(this);
    }

    private listenResize() {
        let lastInnerWidth = innerWidth;
        let lastInnerHeight = innerHeight;
        let lastOuterWidth = outerWidth;
        let lastOuterHeight = outerHeight;

        let onResize = () => {
            if (innerWidth !== lastInnerWidth || innerHeight !== lastInnerHeight || outerWidth !== lastOuterWidth || outerHeight !== lastOuterHeight) {
                this.setSize();
                lastInnerWidth = innerWidth;
                lastInnerHeight = innerHeight;
                lastOuterWidth = outerWidth;
                lastOuterHeight = outerHeight;
            }
        };

        window.addEventListener('load', onResize);
        window.addEventListener('orientationchange', onResize);

        let timerId = setInterval(() => {
            if (this.destroyed) {
                window.removeEventListener('load', onResize);
                window.removeEventListener('orientationchange', onResize);
                clearInterval(timerId);
            }
            else {
                onResize();
            }
        }, 100);
    }

    public destroy() {
        window.removeEventListener('load', this.handleLoad);
        window.removeEventListener('focus', this.handleFocus);
        window.removeEventListener('blur', this.handleBlur);
        window.removeEventListener('orientationchange', this.handleOrientationchange);
        document.removeEventListener('visibilitychange', this.handleVisibiltyChange);
        this.destroyed = true;
    }

    private handleLoad() {
        window.addEventListener('focus', this.handleFocus);
        window.addEventListener('blur', this.handleBlur);
        window.addEventListener('orientationchange', this.handleOrientationchange);
        document.addEventListener('visibilitychange', this.handleVisibiltyChange);
    }

    private handleFocus() {
        if (DeviceUtil.isIOS())
            return;

        // focus 时执行一次适配，避免 Android 切换网页分页时转屏后切回游戏分页没有进行转屏适配。
        this.handleOrientationchange();
        this.handleVisibleOrientation();
    }

    private handleBlur() {
        if (DeviceUtil.isIOS())
            return;

        window.removeEventListener('orientationchange', this.handleOrientationchange);
    }

    private handleVisibiltyChange() {
        // 依网页可视注册、解注册适配事件
        if (document.visibilityState != 'visible') {
            if (this.registerTimeoutHandler)
                clearTimeout(this.registerTimeoutHandler);
            this.registerTimeoutHandler = null;

            window.removeEventListener('orientationchange', this.handleOrientationchange);
            return;
        }

        if (this.registerTimeoutHandler)
            return;

        // 延迟注册，因特殊操作下 Safari 浏览器会因连续转屏事件造成适配跑版问题
        this.registerTimeoutHandler = setTimeout(this.handleVisibleOrientation, REGISTER_DELAY_TIME);
    }

    private handleVisibleOrientation() {
        this.handleOrientationchange();
        window.addEventListener('orientationchange', this.handleOrientationchange);
    }

    private handleOrientationchange() {
        this.fixIosChromeOrientation();
    }

    // NOTE: 解决 ios chrome 旋转成横屏顶部会有空白区域
    private fixIosChromeOrientation() {
        if (DeviceUtil.isIOSChrome) {
            const originUrl = window.location.pathname + window.location.search;
            history.replaceState('', '', originUrl + new Date().getTime());
            history.replaceState('', '', originUrl);
        }
    }

    public setApp(app: Application) {
        this.app = app;
        this.setSize();
        this.listenResize();
    }

    // 设置舞台大小， 并通知外部组件进行重绘或重定位
    public setSize() {
        screenSize.update();
        const { rendererWidth, rendererHeight, designWidth, designHeight, width, height, scale } = screenSize;
        this.width = designWidth;
        this.height = designHeight;
        this.app.renderer.resize(rendererWidth, rendererHeight);
        this.app.stage.scale.set(scale);
        this.gameRatio = scale;
        this.app.view.style.width = `${width}px`;
        this.app.view.style.height = `${height}px`;
        if (DeviceUtil.isLandScape()) {
            this.app.stage.x = 0;
            this.app.stage.rotation = 0;
        }
        else {
            this.app.stage.x = rendererWidth;
            this.app.stage.rotation = Math.PI / 2;
        }
        this.notification();
    }

    public subscribe(handler: any, type: SUBSCRIBE_TYPE = SUBSCRIBE_TYPE.GAME) {
        switch (type) {
            case SUBSCRIBE_TYPE.GAME:
                if (!this.gameHandlers.get(handler)) {
                    this.gameHandlers.set(handler, handler);
                    handler();
                }
                break;
            case SUBSCRIBE_TYPE.OTHER:
                if (!this.otherHandlers.get(handler)) {
                    this.otherHandlers.set(handler, handler);
                    handler();
                }
                break;
        }
    }

    public unSubscribe(handler: any, type: SUBSCRIBE_TYPE = SUBSCRIBE_TYPE.GAME) {
        switch (type) {
            case SUBSCRIBE_TYPE.GAME:
                if (this.gameHandlers.get(handler)) {
                    this.gameHandlers.delete(handler);
                }
                break;
            case SUBSCRIBE_TYPE.OTHER:
                if (this.otherHandlers.get(handler)) {
                    this.otherHandlers.delete(handler);
                }
                break;
        }
    }

    public unSubscribeAll(type: SUBSCRIBE_TYPE) {
        switch (type) {
            case SUBSCRIBE_TYPE.GAME:
                this.gameHandlers.clear();
                break;
            case SUBSCRIBE_TYPE.OTHER:
                this.otherHandlers.clear();
                break;
            case SUBSCRIBE_TYPE.ALL:
                this.gameHandlers.clear();
                this.otherHandlers.clear();
                break;
        }
    }

    public notification() {
        this.gameHandlers.forEach((handler) => {
            handler();
        });
        this.otherHandlers.forEach((handler) => {
            handler();
        })
    }

    public getWidth() {
        return this.width;
    }

    public getHeight() {
        return this.height;
    }
}

const screenManager = new ScreenManager();
export default screenManager;