const ImageRes = {
    lobby_bg: require('../../res/i/lobby_bg.png'),
    lwhsg_logo: require('../../res/i/lwhsg_logo.png'),
    kxhd_logo: require('../../res/i/kxhd_logo.png'),
};

export const ImageKey = {
    lobby_bg: 'lobby_bg',
    lwhsg_logo: 'lwhsg_logo',
    kxhd_logo: 'kxhd_logo',
};

const SoundRes = [
    //soundRes
    { n: 'lobby_bgm', f: require('../../res/a/lobby_bgm.mp3') },
    { n: 'button_click', f: require('../../res/a/button_click.mp3') }
];

export const SoundKey = {
    // soundkey
    lobby_bgm: 'lobby_bgm',
    button_click: 'button_click'
};

export const Assets = {
    main: ImageRes,
    audio: SoundRes
};