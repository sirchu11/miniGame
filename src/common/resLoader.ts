import { Loader, BaseTexture, LoaderResource } from 'pixi.js';
import _ from 'lodash';

const LOADER_CONCURRENCY = 20;

export default class ResLoader {
    private static instance: ResLoader;
    private lobbyLoader: Loader;
    private lobbyResources: any = {};
    private gameLoader: Loader;
    private gameResources: any = {};

    public static getInstance() {
        if (!this.instance) {
            this.instance = new ResLoader();
        }
        return this.instance;
    }

    constructor() {
        this.lobbyResources = {};
        this.gameResources = {};
    }

    public lobbyResourcesLoad(assets: any, progress: any) {
        this.lobbyLoader = new Loader('', LOADER_CONCURRENCY);
        return new Promise((resolve, reject) => {
            _.each(assets, (value, key) => {
                if (typeof value === 'string') {
                    this.lobbyLoader.add(key, value);
                }
                else {
                    if (value.atlasImage) {
                        value.metadata.imageLoader = this.createSpineImageLoader(value.atlasImage);
                        this.lobbyLoader.add(value);
                    }
                    else {
                        this.lobbyLoader.add(value);
                    }
                }
            });

            this.lobbyLoader.onProgress.add((progress));
            this.lobbyLoader.onComplete.add((e) => {
                _.each(this.lobbyLoader.resources, (r) => {
                    this.lobbyResources[r.name] = r;
                });
                resolve(e);
            });

            this.lobbyLoader.load(({ resources }) => {
                _.each(resources, (value, key) => {
                    Loader.shared.resources[key] = value;
                    delete resources[key];
                });
            });
        });
    }

    public gameResourcesLoad(assets: any, progress: any) {
        this.clearGameLoader();
        this.gameLoader = new Loader('', LOADER_CONCURRENCY);

        return new Promise((resolve, reject) => {
            _.each(assets, (value, key) => {
                if (typeof value === 'string') {
                    this.gameLoader.add(key, value);
                }
                else {
                    if (value.atlasImage) {
                        value.metadata.imageLoader = this.createSpineImageLoader(value.atlasImage);
                        this.gameLoader.add(value);
                    }
                    else {
                        this.gameLoader.add(value);
                    }
                }
            });

            this.gameLoader.onProgress.add((progress));
            this.gameLoader.onComplete.add((e) => {
                _.each(this.gameLoader.resources, (r) => {
                    this.gameResources[r.name] = r;
                });
                resolve(e);
            });

            this.gameLoader.onError.add((target, event, error) => {
                reject(error);
            }); // called once per errored file

            //start the load
            this.gameLoader.load();
        });
    }

    public getGameLoader(): Loader {
        return this.gameLoader;
    }

    public getGameResources(): {} {
        return this.gameResources;
    }

    public getLobbyLoader(): Loader {
        return this.lobbyLoader;
    }

    public getLobbyResources(): {} {
        return this.lobbyResources;
    }

    public clearGameLoader() {
        if (!this.gameLoader)
            return;

        this.gameLoader.reset();
        this.gameLoader.destroy();

        _.each(this.gameResources, (r, key) => {
            switch (r.extension) {
                case 'jpg':
                case 'png':
                    if (r.texture && r.texture.valid) {
                        r.texture.destroy(true);
                    }

                    break;
                case 'json':
                    if (r.textures) {
                        _.each(r.textures, (t) => {
                            if (t.valid) {
                                t.destroy(true);
                            }
                        });
                    }
                    break;
            }
            delete this.gameResources[key];
        });

        this.gameResources = {};
    }

    private createSpineImageLoader(urls: string | { [name: string]: string }) {
        return (loader: Loader, namePrefix: any, baseUrl: any, imageOptions: any) => {
            return ((line: string, callback: (baseTexture: BaseTexture | null) => any) => {
                const name = namePrefix + line;
                let url;
                if (typeof urls === 'string') {
                    url = urls;
                }
                else {
                    url = urls[line];
                }
                if (!url) {
                    throw `spine 图片加载错误${line}`;
                }
                loader.add(name, url, imageOptions, (resource: LoaderResource) => {
                    if (!resource.error) {
                        callback(resource.texture.baseTexture);
                    } else {
                        callback(null);
                    }
                });
            });
        };
    }
}