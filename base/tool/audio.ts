import { Howl } from 'howler';
import _ from 'lodash';
import PlayerPrefs from './playerPrefs';

const AUDIO_VOLUME_KEY = 'MINI_GAME_AUDIO_VOLUME_KEY'; // 儲存音效的key
const INIT_VOLUME = 1;                          // 初始音量
const EMPTY_FUNC = () => undefined;                    // 空函式

interface AudioResource {
    n: string;
    f: string;
}

/**
 * @class
 * 說明：
 * 1. 音效工具
 */
class Audio {
    private volume: number;
    private musicData: { sound?: any, handle?: object };
    private soundDatas: Map<object, { sound?: any, handle?: object }>;
    private soundCaches: Map<any, any>;
    private isEnabled: boolean;
    private static instance: Audio;
    static get instanceGetter() {
        return this.instance || new Audio();
    }

    constructor() {
        this.volume = INIT_VOLUME;

        this.musicData = {};                    //播放中的BGM
        this.soundDatas = new Map();            //播放中的音效
        this.soundCaches = new Map();           //loading時載入的音效catches
        this.isEnabled = true;                  //音效開關
        // this.initVolumes();
    }

    /**
     *   @description 加載音效資源
     *   @param  {Array}     res         音效資源清單[{n:'音效索引', f:'檔案位置', s:'合併音效工具生成的audioData.js => getAudioData()'}, ... ]
     *   @param  {Function} progress    加載進度回呼(0 ~ 100)
     *   @param  {Function} loadErrorCb 下載失敗時的回調函示
    */
    loadRes(res: Array<AudioResource>, progress: (parm: number) => void, loadErrorCb: (arg0: any) => void) {
        const PROGRESS_NUM_MAX = 100; // 固定完成是100%
        const ERROR_RETRY_TIMES = 3; // 錯誤重試的次數
        let resLoaded = 0; // 計算完成次數

        const soundCaches = this.soundCaches;
        return new Promise(async (resolve, reject) => {
            // 單個音檔讀取完成func
            const loadFinishFunc = (name?: string, howl?: any) => {
                if (name) soundCaches.set(name, howl);
                ++resLoaded;
                if (progress)
                    progress((resLoaded / res.length) * PROGRESS_NUM_MAX);
                if (resLoaded === res.length)
                    resolve();
            };

            // 錯誤判斷Func
            const loadErrorFunc = (audioRes: { n: string, f: string, s?: any, retryTimes?: number }, errorMsg: string) => {
                audioRes.retryTimes = audioRes.retryTimes || 0;
                ++audioRes.retryTimes;
                // 超過重試次數就不管了
                if (audioRes.retryTimes > ERROR_RETRY_TIMES) {
                    if (loadErrorCb) loadErrorCb(audioRes);
                    loadFinishFunc();
                    return;
                }
                console.error(
                    'Howler LoadError!!!',
                    audioRes.f || audioRes.s,
                    errorMsg,
                    'Retry: ',
                    audioRes.retryTimes
                );
                loadHowler(audioRes);
            };

            // 讀取單個howler音檔
            const loadHowler = (audioRes: { n: string, f: string, s?: any }) => {
                if (soundCaches.has(audioRes.n)) {
                    loadFinishFunc();
                    return;
                }
                let howl = new Howl({
                    src: [audioRes.f],
                    sprite: audioRes.s,
                    preload: true,
                    onloaderror: (_, errorMsg) => {
                        loadErrorFunc(audioRes, errorMsg);
                    },
                    onload: () => {
                        loadFinishFunc(audioRes.n, howl);
                    },
                });
            };

            // 同時讀取所有音檔
            for (let i = 0; i < res.length; i++) loadHowler(res[i]);
        });
    }

    /**
    *    @description 卸載音效資源
    *    @param  {Array}     res         音效資源清單[{n:'音效索引', f:'檔案位置'}, ... ]
    */
    unloadRes(res: { r: any, n: any }[]) {
        _.each(res, (r) => {
            if (this.soundCaches.has(r.n)) {
                let howlInstance = this.soundCaches.get(r.n);
                howlInstance.unload();
                this.soundCaches.delete(r.n);
            }
        });
    }

    /**
     * @description 设定 Audio 开关，关闭时不播放音乐音效
     * @param {boolean} isEnabled true/false
     */
    setEnabled(isEnabled: boolean) {
        this.isEnabled = isEnabled;
    }

    /**
     * @returns {number} this.musicVolume 現在音樂音量大小
     */
    getVolume() {
        return this.volume;
    }

    /**
     * 设定音量 数值为 0 - 1
     * @param {number} volume 数值为 0 - 1
     */
    setVolume(volume: number) {
        this.volume = volume;
        this.storageData();

        let handle = this.musicData.handle;
        let sound = this.musicData.sound;
        if (!handle || !sound)
            return;

        sound.volume(volume, handle);
        this.soundDatas.forEach((soundData) => {
            soundData.sound.volume(volume, soundData.handle);
        });
    }

    /**
     * @description 播放背景音樂
     * @param {string} path 音樂路徑
     * @param {boolean} isLoop 是否重複播放
     * @param {function} callback 音樂結束時的callback
     */
    playMusic(path: string, isLoop = true, callback = EMPTY_FUNC) {
        if (!this.isEnabled)
            return;

        if (!this.soundCaches.has(path))
            return;

        this.stopMusic();
        let sound = this.soundCaches.get(path);
        let handle = sound.volume(this.volume).loop(isLoop).play();
        if (isLoop)
            sound.on(
                'end',
                () => {
                    callback();
                }
            );
        else
            sound.once(
                'end',
                () => {
                    AudioInstance.musicData = {};
                    callback();
                }
            );

        this.musicData = { sound: sound, handle: handle };
        return handle;
    }

    /**
     * @description 停止背景音樂
     */
    stopMusic() {
        let handle = this.musicData.handle;
        let sound = this.musicData.sound;
        if (!handle || !sound)
            return;

        sound.off('end');
        sound.stop(handle);
        this.musicData = {};
    }

    /**
     * @description 暫停背景音樂
     */
    pauseMusic() {
        let handle = this.musicData.handle;
        let sound = this.musicData.sound;
        if (!handle || !sound)
            return;

        sound.pause(handle);
    }

    /**
     * @description 恢復播放背景音樂
     */
    resumeMusic() {
        let handle = this.musicData.handle;
        let sound = this.musicData.sound;
        if (!handle || !sound)
            return;

        sound.play(handle);
    }

    /**
     * @description 播放音效
     * @param {string} path 音效路徑
     * @param {boolean} isLoop 是否重複播放
     * @param {function} callback 音效結束時的callback
     * @returns {object}
     */
    playSound(path: string, isLoop = false, callback = EMPTY_FUNC) {
        if (!this.isEnabled)
            return;

        if (!this.soundCaches.has(path))
            return;

        let sound = this.soundCaches.get(path);
        let handle = sound.volume(this.volume).loop(isLoop).play();
        sound.on(
            'unlock',
            () => {
                sound.stop();
            }
        );
        if (isLoop)
            sound.on(
                'end',
                () => {
                    callback();
                },
                handle
            );
        else
            sound.once(
                'end',
                () => {
                    AudioInstance.soundDatas.delete(handle);
                    callback();
                }
                , handle
            );
        this.soundDatas.set(handle, { sound: sound, handle: handle });
        return handle;
    }

    /**
     * @description 暫停音效
     * @param {object} handle 要暫停的音效
     */
    pauseSound(handle: object) {
        if (!handle)
            return;

        if (!this.soundDatas.has(handle))
            return;

        let soundData = this.soundDatas.get(handle);
        soundData.sound.pause(soundData.handle);
    }

    /**
     * @description 暫停所有音效
     */
    pauseAllSounds() {
        this.soundDatas.forEach((soundData) => {
            soundData.sound.pause(soundData.handle);
        });
    }

    /**
     * 恢復音效播放
     * @param {object} handle 指定音效
     */
    resumeSound(handle) {
        if (!handle)
            return;

        if (!this.soundDatas.has(handle))
            return;

        let soundData = this.soundDatas.get(handle);
        soundData.sound.play(soundData.handle);
    }

    /**
     * @description 恢復所有音效播放
     */
    resumeAllSounds() {
        this.soundDatas.forEach((soundData) => {
            soundData.sound.play(soundData.handle);
        });
    }

    /**
     * @description 停止播放音效
     * @param handle 指定音效
     */
    stopSound(handle: object) {
        if (!handle)
            return;

        if (!this.soundDatas.has(handle))
            return;

        let soundData = this.soundDatas.get(handle);
        soundData.sound.off('end', null, soundData.handle);
        soundData.sound.stop(soundData.handle);
        this.soundDatas.delete(handle);
    }

    /**
     * @description 停止所有音效播放
     */
    stopAllSounds() {
        let soundDatas = this.soundDatas;
        soundDatas.forEach((soundData) => {
            soundData.sound.off('end', null, soundData.handle);
            soundData.sound.stop(soundData.handle);
        });
        soundDatas.clear();
    }

    private storageData() {
        PlayerPrefs.Set(AUDIO_VOLUME_KEY, this.volume);
    }

    private initVolumes() {
        let volume = PlayerPrefs.Get(AUDIO_VOLUME_KEY);
        if (volume === undefined) {
            PlayerPrefs.Set(AUDIO_VOLUME_KEY, 1);
            volume = 1;
        }

        this.volume = volume;
    }
}

const AudioInstance = Audio.instanceGetter;
export default AudioInstance;