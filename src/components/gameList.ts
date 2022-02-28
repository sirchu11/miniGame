import { Container, Texture } from 'pixi.js';
import Button from '@base/components/button';
import ScrollView, { SCROLL_DIRECTION } from '@base/components/scrollView';
import { GAME_LIST, MAX_SIZE } from '../constants';
import GameManager from '../common/gameManager';

const BUTTON_SIZE = {
    width: 300,
    height: 120
};

export default class GameList extends Container {
    private gameListScrollView: ScrollView;
    private gameListElementContainer: Container;
    private gameButtonArray: Array<Button> = new Array();

    constructor() {
        super();

        this.init();
    }

    private init() {
        this.gameListElementContainer = new Container();
        this.gameButtonArray = [];
        for (let i = 0; i < GAME_LIST.length; i++) {
            let gameButton = new Button(Texture.from(GAME_LIST[i].logo));
            gameButton.width = BUTTON_SIZE.width;
            gameButton.height = BUTTON_SIZE.height;
            gameButton.position.set(i * BUTTON_SIZE.width + BUTTON_SIZE.width / 2,  BUTTON_SIZE.height + BUTTON_SIZE.height / 2);
            gameButton.onTap = () => {
                GameManager.enterGame(GAME_LIST[i].gameType);
            };
            this.gameButtonArray.push(gameButton);
            this.gameListElementContainer.addChild(gameButton);
        }

        this.gameListScrollView = new ScrollView(MAX_SIZE.width, 240, this.gameListElementContainer, this.gameListElementContainer.width, 240, SCROLL_DIRECTION.HORIZONTAL);
        this.gameListScrollView.position.set(0, 0);
        this.addChild(this.gameListScrollView);
    }

    public handleResize(width: number, height: number) {
        this.gameListScrollView.ViewWidth = width;
        if (this.gameListElementContainer.width <= width) {
            this.gameListScrollView.setTouchEnabled(false);
        }
        else {
            this.gameListScrollView.setTouchEnabled(true);
        }
        this.gameListScrollView.position.set(0, height / 2 - BUTTON_SIZE.height);
        this.gameListElementContainer.position.set(0, 0);
    }

    public destroy() {
        super.destroy({ children: true });
        Object.keys(this).forEach((key) => { this[key] = null });
    }
}