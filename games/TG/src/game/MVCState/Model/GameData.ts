export interface LevelData {
    state: Array<Array<number>>;
    answer: Array<Array<number>>;
    flag: {row: number, col: number};
    bird: {row: number, col: number};
    birdMoveAni: Array<number>;
    movementProhibitionRoad: Array<number>;
    finalStage?: boolean;
}

export enum Road {
    Straight_Road = 13 || 19,
    Cross_Road_left = 14 || 20,
    Cross_Road_right = 14.1 || 20.1,
    Upper_Left_Road = 9 || 16,
    Upper_Left_Road_Down = 9.1 || 16.1,
    Upper_Right_Road = 10 || 15,
    Lower_Left_Road = 11 || 17,
    Lower_right_Road = 12 || 18,
    Lower_right_Road_Down = 12.1 || 18.1,
}

export interface BirdIdleSkin {
    id: number;
    skin: Array<number>;
}

export default class GameData
{
    private birdIdleSkin: BirdIdleSkin[] = [
        { id: 0, skin : [11, 12]},
        { id: 1, skin : [21, 22]},
        { id: 2, skin : [31, 32]},
        { id: 3, skin : [41, 42]},
        { id: 4, skin : [51, 52]},
        { id: 5, skin : [61, 62]},
    ]

    private levelData: LevelData[] = [
        {
            // level 1
            state: [
                [5, 5, 19, 5, 5, 5],
                [5, 5, 5, 13, 5, 5],
                [13, 5, 5, 5, 5, 5],
                [5, 5, 5, 5, 13, 5],
                [5, 5, 19, 5, 5, 5],
            ],
            answer: [
                [0, 0, 0, 0, 0, 0],
                [0, 0, 13, 0, 0, 0],
                [0, 0, 13, 0, 0, 0],
                [0, 0, 13, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
            ],
            flag: {row : 0, col: 2 },
            bird: {row : 4, col: 2 },
            birdMoveAni: [13, 13, 13],
            movementProhibitionRoad: [19],
        },
        {
            // level 2
            state: [
                [3, 5, 19, 5, 5, 5],
                [5, 5, 5, 5, 5, 5],
                [13, 5, 5, 6, 5, 11],
                [5, 5, 5, 5, 13, 5],
                [10, 5, 5, 19, 5, 1],
            ],
            answer: [
                [0, 0, 0, 0, 0, 0],
                [0, 0, 13, 0, 0, 0],
                [0, 0, 13, 0, 0, 0],
                [0, 0, 11, 10, 0, 0],
                [0, 0, 0, 0, 0, 0],
            ],
            flag: {row : 0, col: 2 },
            bird: {row : 4, col: 3 },
            birdMoveAni: [10, 11, 13, 13],
            movementProhibitionRoad: [3, 6, 19],
        },
        {
            // level 3
            state: [
                [13, 5, 5, 1, 19, 1],
                [5, 8, 2, 12, 5, 5],
                [1, 3, 5, 6, 5, 13],
                [5, 5, 9, 5, 5, 4],
                [1, 1, 5, 19, 6, 5],
            ],
            answer: [
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 13, 0],
                [0, 0, 0, 0, 13, 0],
                [0, 0, 0, 9, 12, 0],
                [0, 0, 0, 0, 0, 0],
            ],
            flag: {row : 0, col: 4 },
            bird: {row : 4, col: 3 },
            birdMoveAni: [9, 12, 13, 13],
            movementProhibitionRoad: [3, 4, 6, 8, 19]
        },
        {
            // level 4
            state: [
                [4, 19, 5, 4, 2, 5],
                [5, 13, 10, 7, 5, 2],
                [1, 5, 5, 11, 4, 11],
                [5, 14, 4, 10, 5, 2],
                [7, 5, 2, 3, 19, 4],
            ],
            answer: [
                [0, 0, 0, 0, 0, 0],
                [0, 13, 0, 0, 0, 0],
                [0, 11, 14, 10, 0, 0],
                [0, 0, 0, 11, 10, 0],
                [0, 0, 0, 0, 0, 0],
            ],
            flag: {row : 0, col: 1 },
            bird: {row : 4, col: 4 },
            birdMoveAni: [10, 11, 10, 14, 11, 13],
            movementProhibitionRoad: [3, 4, 7, 19]
        },
        {
            // level 5
            state: [
                [8, 19, 2, 5, 6, 5],
                [5, 11, 2, 5, 5, 5],
                [13, 3, 2, 2, 6, 5],
                [4, 14, 3, 5, 10, 5],
                [7, 10, 11, 5, 19, 5],
            ],
            answer: [
                [0, 0, 0, 0, 0, 0],
                [0, 11, 14, 10, 0, 0],
                [0, 0, 0, 13, 0, 0],
                [0, 0, 0, 11, 10, 0],
                [0, 0, 0, 0, 0, 0],
            ],
            flag: {row : 0, col: 1 },
            bird: {row : 4, col: 4 },
            birdMoveAni: [10, 11, 13, 10, 14, 11],
            movementProhibitionRoad: [3, 4, 6, 7, 19]
        },
        {
            // level 6
            state: [
                [8, 4, 12, 5, 19, 5],
                [2, 5, 14, 8, 5, 5],
                [2, 13, 14, 13, 5, 3],
                [2, 2, 3, 9, 5, 3],
                [3, 19, 3, 5, 1, 1],
            ],
            answer: [
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 13, 0],
                [0, 9, 14, 14, 12, 0],
                [0, 13, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
            ],
            flag: {row : 0, col: 4 },
            bird: {row : 4, col: 1 },
            birdMoveAni: [13, 9, 14.1, 14.1, 12, 13],
            movementProhibitionRoad: [3, 4, 8, 19]
        },
        {
            // level 7
            state: [
                [3, 5, 19, 5, 5, 14],
                [5, 5, 2, 2, 2, 5],
                [9, 3, 3, 6, 3, 11],
                [5, 1, 5, 5, 13, 5],
                [10, 19, 5, 1, 12, 5],
            ],
            answer: [
                [0, 0, 0, 0, 0, 0],
                [9, 14, 12, 0, 0, 0],
                [13, 0, 0, 0, 0, 0],
                [11, 10, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
            ],
            flag: {row : 0, col: 2 },
            bird: {row : 4, col: 1 },
            birdMoveAni: [10, 11, 13, 9, 14.1, 12],
            movementProhibitionRoad: [3, 6, 19]
        },
        {
            // level 8
            state: [
                [12, 19, 5, 10, 5, 13],
                [2, 12, 8, 1, 5, 5],
                [2, 14, 5, 1, 3, 11],
                [14, 9, 5, 3, 5, 5],
                [6, 5, 13, 9, 19, 5],
            ],
            answer: [
                [0, 0, 0, 0, 0, 0],
                [0, 13, 0, 9, 14, 10],
                [0, 11, 14, 12, 0, 13],
                [0, 0, 0, 0, 9, 12],
                [0, 0, 0, 0, 0, 0],
            ],
            flag: {row : 0, col: 1 },
            bird: {row : 4, col: 4 },
            birdMoveAni: [9, 12, 13, 10, 14, 9.1, 12.1, 14, 11, 13],
            movementProhibitionRoad: [3, 6, 8, 19],
            finalStage: true
        }
    ]

    public get LevelData(): LevelData[] 
    {
        return this.levelData;
    }

    public get BirdIdleSkin(): BirdIdleSkin[] 
    {
        return this.birdIdleSkin;
    }
}