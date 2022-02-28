import { Loader, LoaderResource } from 'pixi.js';
const filelist: { [key: string]: string } = {};

const resolveWithHash = (url: string) => {
    const hash = filelist[url];
    if (hash) {
        return url + '?v=' + hash;
    }
    return null;
};

const getParentResource = (resource: LoaderResource, resources: any) => {
    if (resource.name.slice(-6) === '_image') {
        const parentKey = resource.name.slice(0, -6);
        return resources[parentKey];
    }
    return null;
};

export const loaderPlugin = {
    pre(this: Loader, resource: LoaderResource, next: () => void) {
        let url = resource.url.split('?')[0];
        const urlWithHash = resolveWithHash(url);
        if (urlWithHash) {
            resource.url = urlWithHash;
        }
        const parentResource = getParentResource(resource, this.resources);
        if (parentResource && parentResource.metadata && parentResource.metadata.jsonImage) {
            resource.url = parentResource.metadata.jsonImage;
        }
        next();
    },
    use(this: Loader, resource: LoaderResource, next: () => void) {
        next();
    }
};