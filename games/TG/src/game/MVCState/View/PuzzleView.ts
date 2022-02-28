import { Container, Sprite, Texture, IPointData, Text, AnimatedSprite, ISize } from 'pixi.js';
import { ImageKey, GameEvent, SoundKey } from '../../../constants';
import { LevelData, Road } from '../Model/GameData'
import { GameState } from '../Controller/StartGameController';
import Format from 'string-format';
import ScreenManager from '@base/tool/screenManager';
import ColliderManager from '@base/collider/colliderManager';
import RectangleCollider2D from '@base/collider/rectangleCollider2d';
import Collider2dBase from '@base/collider/collider2dBase';
import { EventManager, EventMessage } from '@base/tool/eventManager';
import PlayerPrefs from '@base/tool/playerPrefs';
import Audio from '@base/tool/audio';
import gsap from 'gsap';

export enum ZIndex
{
    Normal = 1,
    Touch = 2,
    Click = 3,
    Flag = 4,
    Talk = 5,
    Bird = 6,
    Text = 7
}

const animationSpeed = 0.1;
const completeRoad = "完成道路!";
const clearGame = "通關遊戲!";

export default class PuzzleView {
    public get Container(): Container { return this.container; }
    public get Width(): number { return this.container.width; }
    public get Height(): number { return this.container.height; }
    public get X(): number { return this.container.x; }
    public set X(value: number) { this.container.x = value; }
    public get Y(): number { return this.container.y; }
    public set Y(value: number) { this.container.y = value; }

    private container: Container = new Container();
    private emptySpriteArr: Array<Array<Sprite>> = new Array(5).fill(null).map(() => new Array(6).fill(null));
    private puzzleSpriteArr: Array<Array<Sprite>> = new Array(5).fill(null).map(() => new Array(6).fill(null));
    private puzzleCenterPosArr: Array<Array<IPointData>> = new Array(5).fill(null).map(() => new Array(6).fill(null));
    private touchSpritePosArray: Array<any> = new Array();
    private colliderSpritePosArray: Array<any> = new Array();
    private data: LevelData;
    private finishText: Text;
    private flag: Sprite;
    private talkContainer: Container;
    private bird: AnimatedSprite;
    private finalStageCallBack: Function;

    public init() {
        this.setupEmptyPuzzle();
        this.setupPuzzle();
        this.setupFlag();
        this.setupTalk();
        this.setupFinishText();
        this.setActive(false);
        this.container.sortChildren();
    }

    public resetView() {
        this.setActive(false);
        this.finishText.visible = false;
    }

    public start(data: LevelData) {
        this.setActive(true);
        this.setData(data);
        this.container.alpha = 1;
        let loop = 3;
        let startX = 0, startY = 0;
        let rowLenght = 6;
        let colLenght = 5;
        let offset = 1;
        while(loop --) {
            let row = startX, col = startY;
            for(; col < startY + rowLenght - offset; col++) {
                let sprite = this.puzzleSpriteArr[row][col];
                let levelSprite = this.getData().state[row][col];
                let movementProhibitionRoad = this.getData().movementProhibitionRoad;
                if(movementProhibitionRoad.indexOf(levelSprite) !== -1) {
                    sprite.interactive = false;
                }else {
                    sprite.interactive = true;
                }
                sprite.texture = Texture.from(Format(ImageKey.tile, levelSprite));
                sprite.visible = true;
            }

            for(; row < startX + colLenght - offset; row++) {
                let sprite = this.puzzleSpriteArr[row][col];
                let levelSprite = this.getData().state[row][col];
                let movementProhibitionRoad = this.getData().movementProhibitionRoad;
                if(movementProhibitionRoad.indexOf(levelSprite) !== -1) {
                    sprite.interactive = false;
                }else {
                    sprite.interactive = true;
                }
                sprite.texture = Texture.from(Format(ImageKey.tile, levelSprite));
                sprite.visible = true;
            }

            for(; col > startX; col--) {
                let sprite = this.puzzleSpriteArr[row][col];
                let levelSprite = this.getData().state[row][col];
                let movementProhibitionRoad = this.getData().movementProhibitionRoad;
                if(movementProhibitionRoad.indexOf(levelSprite) !== -1) {
                    sprite.interactive = false;
                }else {
                    sprite.interactive = true;
                }
                sprite.texture = Texture.from(Format(ImageKey.tile, levelSprite));
                sprite.visible = true;
            }

            for(; row > startY; row--) {
                let sprite = this.puzzleSpriteArr[row][col];
                let levelSprite = this.getData().state[row][col];
                let movementProhibitionRoad = this.getData().movementProhibitionRoad;
                if(movementProhibitionRoad.indexOf(levelSprite) !== -1) {
                    sprite.interactive = false;
                }else {
                    sprite.interactive = true;
                }
                sprite.texture = Texture.from(Format(ImageKey.tile, levelSprite));
                sprite.visible = true;
            }
            startX++;
            startY++;
            offset += 2;
        }
        this.initFlag();
        this.initBird();
        this.initTalk();
    }

    public pause() {
        this.bird.stop();
    }

    public continue() {
        this.bird.play();
    }

    public setFinalStageCallBack(finalStageCallBack: any) {
        this.finalStageCallBack = finalStageCallBack;
    }

    public setActive(bool: boolean) {
        this.container.visible = bool;
    }

    private getAnimatedTextures (textureName: string, textureAmountArray: Array<number>) {
        let texture;
        let textures = [];
        for (let i = 0; i < textureAmountArray.length; i++) {
            texture = Texture.from(Format(textureName, textureAmountArray[i]))
            textures.push(texture);
        }
        return textures;
    };

    private _createSpiral(array: Array<Array<Sprite>>, textureName?: string, isVisible?: boolean, isInteractive?: boolean,puzzleCenterPosArr?: Array<Array<IPointData>>) {
        let loop = 3;
        let startX = 0, startY = 0;
        let rowLenght = 6;
        let colLenght = 5;
        let offset = 1;
        while(loop --) {
            let row = startX, col = startY;
            for(; col < startY + rowLenght - offset; col++) {
                this._createEmptyPuzzle(array, row, col, textureName, isVisible, isInteractive, puzzleCenterPosArr);
            }

            for(; row < startX + colLenght - offset; row++) {
                this._createEmptyPuzzle(array, row, col, textureName, isVisible, isInteractive, puzzleCenterPosArr);
            }

            for(; col > startX; col--) {
                this._createEmptyPuzzle(array, row, col, textureName, isVisible, isInteractive, puzzleCenterPosArr);
            }

            for(; row > startY; row--) {
                this._createEmptyPuzzle(array, row, col, textureName, isVisible, isInteractive, puzzleCenterPosArr);
            }
            startX++;
            startY++;
            offset += 2;
        }
    }

    private _createEmptyPuzzle(array: Array<Array<Sprite>>, row: number, col: number, textureName?: string, isVisible: boolean = true, isInteractive: boolean = false, puzzleCenterPosArr?: Array<Array<IPointData>>) {
        array[row][col] = new Sprite();
        let sprite = array[row][col];
        if( textureName ) sprite.texture = Texture.from(textureName);
        sprite.position.y = row * sprite.height * 0.9;
        sprite.position.x = col * sprite.width * 0.9;
        sprite.scale.set(0.9);
        sprite.zIndex = ZIndex.Normal;
        sprite.visible = isVisible;
        sprite.interactive = isInteractive;
        sprite.pivot.set(0.5);
        if(puzzleCenterPosArr) puzzleCenterPosArr[row][col] = { x: sprite.position.x, y: sprite.position.y };
        this.pointerEventHandler(sprite, row, col);
        if( isInteractive ) {
            let collider = new RectangleCollider2D(`${row},${col}`, sprite.width / 2, sprite.height / 2, `${row},${col}`);
            ColliderManager.Ins.AddCollider(collider);
            sprite.addChild(collider);
            collider.position.set(sprite.width / 2, sprite.height / 2);
            ;
            collider.CollisionStart = this.CollisionStart.bind(this);
        }
        this.Container.addChild(sprite);
    }

    private pointerEventHandler(sprite: Sprite, row: number, col: number,) {
        let ispointerdown = false;
        sprite.on("pointerdown", (e) => {
            let globalPos = e.data.global;
            this.movePuzzle(globalPos, sprite);
            ispointerdown = true;
            sprite.zIndex = ZIndex.Click;
            let pos = {
                row: row,
                col: col
            }
            this.touchSpritePosArray.push(pos);
            this.showTalkContainer(false);
        });
        sprite.on('pointermove',(e) => {
            let pos = e.data.global;
            if(ispointerdown) {
                this.movePuzzle(pos, sprite);
                sprite.zIndex = ZIndex.Click;
            }
            this.Container.sortChildren();
        });
        sprite.on('pointerup',(e) => {
            Audio.playSound(SoundKey.sound_tap_tile);
            sprite.zIndex = ZIndex.Normal;
            ispointerdown = false;
            let touchRow = this.touchSpritePosArray[0].row;
            let touchCol = this.touchSpritePosArray[0].col;
            let colliderRow = this.colliderSpritePosArray[0]?.row ? this.colliderSpritePosArray[0]?.row : this.touchSpritePosArray[0].row;
            let colliderCol = this.colliderSpritePosArray[0]?.col ? this.colliderSpritePosArray[0]?.col : this.touchSpritePosArray[0].col;
            let touchPos = this.puzzleCenterPosArr[touchRow][touchCol];
            let currentTexture = this.getTextureName(touchRow, touchCol);
            if(!this.puzzleSpriteArr[colliderRow][colliderCol].interactive) {
                sprite.position.set(touchPos.x, touchPos.y);
                this.touchSpritePosArray = [];
                this.colliderSpritePosArray = [];
                return;
            }
            sprite.texture = this.getTextureName(colliderRow, colliderCol);
            this.puzzleSpriteArr[colliderRow][colliderCol].texture = currentTexture;
            this.puzzleSpriteArr[colliderRow][colliderCol].zIndex = ZIndex.Click;
            gsap.to(sprite, {
                duration: 0.2,
                x: touchPos.x,
                y: touchPos.y,
                onComplete:() =>{
                    this.showTalkContainer(true);
                    this.puzzleSpriteArr[colliderRow][colliderCol].zIndex= ZIndex.Normal;
                    this.touchSpritePosArray = [];
                    this.changeObject({row: touchRow, col: touchCol}, {row: colliderRow, col: colliderCol}, this.getData().state);
                    this.checkAnswer();
                    gsap.killTweensOf(sprite);
                }
            })
        });
    }

    private getTextureName(row: number, col: number) {
        let levelSprite = this.getData().state[row][col];
        let format = Format(ImageKey.tile, levelSprite);
        return Texture.from(format);
    }

    private changeObject(touchPos: {row: number, col: number}, colliderPos: {row: number, col: number}, Arr: Array<any>) {
        let current = Arr[touchPos.row][touchPos.col]
        Arr[touchPos.row][touchPos.col] = Arr[colliderPos.row][colliderPos.col];
        Arr[colliderPos.row][colliderPos.col] = current;
    }

    private initFlag() {
        let row = this.getData().flag.row;
        let col = this.getData().flag.col;
        let sprite = this.puzzleSpriteArr[row][col];
        this.flag.position.set(sprite.x + sprite.width / 2, sprite.y + sprite.height / 2.5);
    }

    private initBird() {
        let row = this.getData().bird.row;
        let col = this.getData().bird.col;
        let sprite = this.puzzleSpriteArr[row][col];
        this.bird.position.set(sprite.x, sprite.y);
        this.bird.visible = true;
        this.bird.play();
    }

    private initTalk () {
        this.showTalkContainer(false);
        this.talkContainer.position.set(this.bird.position.x - 110, this.bird.position.y * 0.88);
        this.showTalkContainer(true);
    }

    public setupBird() {
        let birdSkin = PlayerPrefs.Get('BirdSkin');
        if(this.bird) {
            this.bird.textures = this.getAnimatedTextures(ImageKey.img_mainrole_idle, birdSkin.skin);
            return;
        }
        this.bird = new AnimatedSprite(this.getAnimatedTextures(ImageKey.img_mainrole_idle, birdSkin.skin));
        this.bird.animationSpeed = animationSpeed;
        this.bird.loop = true;
        this.bird.zIndex = ZIndex.Bird;
        this.container.addChild(this.bird);
    }

    private showTalkContainer(bool: boolean) {
        let alpha = bool? 1 : 0;
        
        if(!bool) {
            this.talkContainer.alpha = alpha;
            return;
        }

        let delayedCall = gsap.delayedCall(2, ()=>{
            gsap.killTweensOf(this.talkContainer);
            if(this.finishText.visible) {
                gsap.killTweensOf(delayedCall);
                return;
            }
            gsap.to(this.talkContainer, {
                alpha: 1,
                duration: 1,
                onComplete: () => {
                    gsap.killTweensOf(this.talkContainer);
                }
            })
        });
    }

    private checkAnswer() {
        let allEqual = false;

        for(let i = 0; i <  this.getData().answer.length; i ++) {
            for(let j = 0; j < this.getData().answer[i].length; j++) {
                let val = this.getData().answer[i][j];
                if(val !== 0 && val !== this.getData().state[i][j]) {
                    allEqual = false;
                    return;
                }
                allEqual = true;
            }
        }
        let lastData = this.getData().finalStage;

        if(allEqual) {
            this.puzzleSpriteArr.forEach((item) => {
                item.forEach((sprite) => {
                    sprite.interactive = false;
                })
            })
            this.finishText.text = lastData ? clearGame : completeRoad;
            this.finishText.visible = true;
            Audio.playSound(SoundKey.sound_gameclear);
            this.showTalkContainer(false);
            this.playBirdAni(lastData);
            EventManager.SendMessage(GameEvent.CHANGE_GAME_STATR, new EventMessage(GameState.Pass));
        }
    }

    private getSpriteArea(): ISize {
        let sprite = this.puzzleSpriteArr[0][0];
        return {width: sprite.width, height: sprite.height}
    }

    private async playBirdAni(lastData?: boolean) {
        Audio.playSound(SoundKey.sound_bird);
        let birdMoveAni = this.getData().birdMoveAni;
        let birdSkin = PlayerPrefs.Get('BirdSkin');
        this.bird.textures = this.getAnimatedTextures(ImageKey.img_mainrole_move, birdSkin.skin);
        for (let i = 0; i < birdMoveAni.length; i++) {
            await this.getRoadAni(birdMoveAni[i]);
            if(i === birdMoveAni.length - 1){
                if(lastData) {
                    this.enterFinalStage();
                    return;
                }
                this.playNextLevel();
            } 
        }
    }

    private getData(): LevelData {
        return this.data;
    }

    private setData(data: LevelData) {
        this.data = data;
    }

    private async getRoadAni(road: Road) {
        gsap.killTweensOf(this.bird);
        switch (road) {
            case Road.Straight_Road:
                await gsap.fromTo(this.bird, { y: this.bird.position.y },
                { duration: 0.3, y: this.bird.position.y -= this.getSpriteArea().height * 1.2, ease: 'none' });
                break;
            case Road.Cross_Road_left:
                await gsap.fromTo(this.bird, { x: this.bird.position.x },
                { duration: 0.3, x: this.bird.position.x -= this.getSpriteArea().width, ease: 'none' });
                break;
            case Road.Cross_Road_right:
                await gsap.fromTo(this.bird, { x: this.bird.position.x },
                { duration: 0.3, x: this.bird.position.x += this.getSpriteArea().width, ease: 'none' });
                break;
            case Road.Upper_Left_Road:
                await gsap.fromTo(this.bird, { y: this.bird.position.y },
                    { duration: 0.2, y: this.bird.position.y -= this.getSpriteArea().height, ease: 'none', onComplete: () => {
                        gsap.fromTo(this.bird, { x: this.bird.position.x },
                            { duration: 0.2, x: this.bird.position.x += this.getSpriteArea().width, ease: 'none' });
                    } });
                break;
            case Road.Upper_Left_Road_Down:
                await gsap.fromTo(this.bird, { x: this.bird.position.x },
                    { duration: 0.2, x: this.bird.position.x -= this.getSpriteArea().width, ease: 'none', onComplete: () => {
                        gsap.fromTo(this.bird, { y: this.bird.position.y },
                            { duration: 0.2, y: this.bird.position.y += this.getSpriteArea().height, ease: 'none' });
                    } });
                break;
            case Road.Upper_Right_Road:
                await gsap.fromTo(this.bird, { y: this.bird.position.y },
                    { duration: 0.2, y: this.bird.position.y -= this.getSpriteArea().height, ease: 'none', onComplete: () => {
                        gsap.fromTo(this.bird, { x: this.bird.position.x },
                            { duration: 0.2, x: this.bird.position.x -= this.getSpriteArea().width, ease: 'none' });
                    } });
                break;
            case Road.Lower_Left_Road:
                await gsap.fromTo(this.bird, { x: this.bird.position.x },
                    { duration: 0.2, x: this.bird.position.x -= this.getSpriteArea().width, ease: 'none', onComplete: () => {
                        gsap.fromTo(this.bird, { y: this.bird.position.y },
                            { duration: 0.2, y: this.bird.position.y -= this.getSpriteArea().height, ease: 'none' });
                    } });
                break;
            case Road.Lower_right_Road:
                await gsap.fromTo(this.bird, { x: this.bird.position.x },
                    { duration: 0.2, x: this.bird.position.x += this.getSpriteArea().width, ease: 'none', onComplete: () => {
                        gsap.fromTo(this.bird, { y: this.bird.position.y },
                            { duration: 0.2, y: this.bird.position.y -= this.getSpriteArea().height, ease: 'none' });
                    } });
                break;
            case Road.Lower_right_Road_Down:
                await gsap.fromTo(this.bird, { y: this.bird.position.y },
                    { duration: 0.2, y: this.bird.position.y += this.getSpriteArea().height, ease: 'none', onComplete: () => {
                        gsap.fromTo(this.bird, { x: this.bird.position.x },
                            { duration: 0.2, x: this.bird.position.x -= this.getSpriteArea().width, ease: 'none' });
                    } });
                break;
            default:
                break;
        } 
    }

    private CollisionStart(otherCollider: Collider2dBase, selfCollider: Collider2dBase) {
        let split = otherCollider.Tag.split(',');
        let row = Number(split[0]) ;
        let col = Number(split[1]);
        let pos = {
            row: row,
            col: col
        }
        if(this.touchSpritePosArray[0] && this.touchSpritePosArray[0].row !== row || this.touchSpritePosArray[0] && this.touchSpritePosArray[0].col !== col) {
            if(this.colliderSpritePosArray.length > 0) {
                this.colliderSpritePosArray.shift();
            }
            this.colliderSpritePosArray.push(pos);
        }
    }

    private playNextLevel() {
        this.finishText.visible = false;
        gsap.to(this.container, {
            duration: 1,
            alpha: 0,
            ease: "none",
            onComplete: () => {
                let birdSkin = PlayerPrefs.Get('BirdSkin');
                this.bird.textures = this.getAnimatedTextures(ImageKey.img_mainrole_idle, birdSkin.skin);
                EventManager.SendMessage(GameEvent.CHANGE_GAME_STATR, new EventMessage(GameState.Next));
                gsap.killTweensOf(this.container);
            }
        })
    }

    private enterFinalStage() {
        this.finalStageCallBack();
        this.finishText.visible = false;
        let birdSkin = PlayerPrefs.Get('BirdSkin');
        this.bird.textures = this.getAnimatedTextures(ImageKey.img_mainrole_idle, birdSkin.skin);
    }

    protected setupPuzzle() {
        this._createSpiral(this.puzzleSpriteArr, ImageKey.img_lightwhite, false, true);
    }

    protected setupFinishText() {
        let style = {
            fontSize: 80,
            fill: '#F0F8FF',
            letterSpacing: 30
        }
        this.finishText = new Text(completeRoad, style);
        this.finishText.position.set(this.container.width / 2 - this.finishText.width / 2, this.container.height / 2 - this.finishText.height / 2);
        this.finishText.visible = false;
        this.finishText.zIndex = ZIndex.Text;
        this.container.addChild(this.finishText);
    }

    protected setupFlag() {
        this.flag = new Sprite(Texture.from(ImageKey.img_endmark_1));
        this.flag.zIndex = ZIndex.Flag;
        this.container.addChild(this.flag);
    }

    protected setupTalk() {
        this.talkContainer = new Container();
        let talkBg = new Sprite(Texture.from(ImageKey.board_talk));
        this.talkContainer.addChild(talkBg);
        let style = {
            fontSize: 24,
            fill: '#B8860B',
            letterSpacing: 10
        }
        let talkText = new Text("安安, 你好!", style);
        talkText.position.set(talkBg.width * 0.1, talkBg.height / 2 * 0.5);
        this.talkContainer.zIndex = ZIndex.Talk;
        this.talkContainer.addChild(talkText);
        this.container.addChild(this.talkContainer);
    }

    protected setupEmptyPuzzle() {
        this._createSpiral(this.emptySpriteArr, ImageKey.img_lightwhite, true, false, this.puzzleCenterPosArr);
    }

    protected movePuzzle(pos: IPointData, sprite: Sprite) {
        let posX = pos.x / ScreenManager.gameRatio - sprite.width / 2 - ScreenManager.getWidth() / 2 + this.container.pivot.x;
        let posY = pos.y / ScreenManager.gameRatio - sprite.height / 2 - ScreenManager.getHeight() / 2 + this.container.pivot.y;
        sprite.x = posX;
        sprite.y = posY;
    }
}