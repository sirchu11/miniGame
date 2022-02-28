const gameRequire = require.context('../../games', true, /subEntry\.(j|t)s/);

const gameMaps = gameRequire.keys().reduce((pre: any, cur: string) => {
    const gameName = cur.match(/^(\.\/)?(\w+)/)![2];
    pre[gameName] = () => gameRequire(cur);
    return pre;
}, {});

export const resolveGame = (name: string) => {
    const r = gameMaps[name];
    if (r) {
        return Promise.resolve(r());
    } else {
        return Promise.reject(name + '项目源代码不存在');
    }
};