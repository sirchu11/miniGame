interface GameItem {
    gameType: number;
    name: string;
    logo: string;
    title: string;
}

const GAME_LIST: Array<GameItem> = [
    {
        title: '老王好食鍋',
        name: 'LWHSG',
        logo: 'lwhsg_logo',
        gameType: 1
    },
    {
        title: '開心環島',
        name: 'KXHD',
        logo: 'kxhd_logo',
        gameType: 7
    },
];

const TEST_GAME: GameItem =
{
    title: '測試遊戲',
    logo: 'TG',
    name: 'TG',
    gameType: 99
};

const MAX_SIZE = {
    width: 1493,
    height: 640
};

export { GAME_LIST, GameItem, TEST_GAME, MAX_SIZE };