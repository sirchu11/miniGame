export default class DeviceUtil {
    static IS_NOTCH(): boolean {
        let screenHeight = Math.min(window.innerHeight, window.innerWidth);
        let screenWidth = Math.max(window.innerHeight, window.innerWidth);
        return screenWidth / screenHeight > 2;
    }

    static isIOS() {
        return /iPhone|iPod/i.test(navigator.userAgent) || DeviceUtil.isIPAD();
    }

    static isIPAD() {
        // 新增 iPad pro 判断 (iPad pro 机型在 safari 判断结果和 macbook 一样)
        return /iPad/i.test(navigator.userAgent) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform));
    }

    static isAndroid() {
        return /Android/i.test(navigator.userAgent);
    }

    static isIOSChrome = window.navigator.userAgent.indexOf('CriOS') !== -1;

    static isMobile() {
        const { width, height } = window.screen;
        const screenWidth = Math.min(width, height);
        if (DeviceUtil.isIPAD())
            return true; // ipad不判断最小宽度
        return (screenWidth <= 600 && (/Android|webOS|BlackBerry/i.test(navigator.userAgent) || DeviceUtil.isIOS()));
    }

    static isWebView(): boolean {
        let useragent = navigator.userAgent;
        let rules = ['WebView', '(iPhone|iPod|iPad)(?!.*Safari\/)', 'Android.*(wv|\.0\.0\.0)'];
        let regex = new RegExp(`(${rules.join('|')})`, 'ig');
        return Boolean(useragent.match(regex));
    }

    static isLandScape(): boolean {
        if (!this.isMobile())
            return true;

        if (window.orientation === undefined)
            return true;
        const orientation = (+window.orientation / 90) % 2;
        return orientation === 1 || orientation === -1;
    }
}