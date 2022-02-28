import DeviceUtil from '@base/tool/deviceUtil';

export const createDefaultStyle = () => {
    const style = document.createElement('style');
    const isIosChrome = window.navigator.userAgent.indexOf('CriOS') !== -1;
    const isMob = DeviceUtil.isMobile();
    const isLand = DeviceUtil.isLandScape();
    const { outerHeight, outerWidth, innerHeight, innerWidth } = window;
    let styleSheet = `

    * {
        -webkit-user-select: none;
        -moz-user-select: none;
        -webkit-user-select:none;
        -o-user-select:none;
        user-select:none;
    }

    body{
        background-color: #000;
        ${isMob ? 'overflow-x: hidden;' : 'overflow: hidden;'}
    }

    canvas {
        display: block;
        /*針對IOS Chrome在橫屏模式下連結開啟，出現的置右跑版問題*/
        ${isIosChrome ? 'margin: 0;' : 'margin: 0 auto;'}
    }

    .rotate {
        transform: translateX(-50%) rotate(90deg);
        margin-left: 50%;
    }

    canvas[orientation="portrait"] {
        transform: translateX(-50%) rotate(90deg);
        /*
            在 IOS Chrome 87版在豎屛模式下，因為inner width錯誤，導致場景位置跑版。
            使用 outer Size 針對橫屛和豎屏手動計算寬度，取得間距
            加入 inner Size 防呆，iOS Chrome 80 取 outer Size 都是 0，会造成跑版
        */
        margin-left: ${isIosChrome ? ((isLand ? (outerHeight || innerHeight) : (outerWidth || innerWidth)) / 2 + 'px;') : '50%;'};
    }
    `;
    const smallScreen = `
        @media screen and (max-aspect-ratio: 1135/640) {
        canvas {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            margin: auto;
        }
      }
    `;
    styleSheet = styleSheet + smallScreen;

    style.innerHTML = styleSheet;
    document.querySelector('HEAD')?.appendChild(style);
};