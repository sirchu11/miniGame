import Audio from '@base/tool/audio';

class GlobalListener {
    public customVisibleEvent: Function | null;

    constructor() {
        this.onVisibilityChange = this.onVisibilityChange.bind(this);
    }

    public initListener() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.onVisibilityChange(true);
            }
            else {
                this.onVisibilityChange(false);
            }
        });
    }

    public onVisibilityChange(isVisible: boolean) {
        if (isVisible) {
            Audio.setEnabled(true);
        } else {
            Audio.setEnabled(false);
            Audio.stopMusic();
            Audio.stopAllSounds();
        }
        if (this.customVisibleEvent) {
            this.customVisibleEvent(isVisible);
        }
    }

    public registerVisibleEvent(visibleEvent: Function) {
        this.customVisibleEvent = visibleEvent;
    }

    public clearCustomEvent() {
        this.customVisibleEvent = null;
    }
}

const globalListener = new GlobalListener();
export default globalListener;