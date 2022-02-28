
import { GameEvent } from '../../../constants';
import MVCStateControllerBase from '../../MVCStateControllerBase';
import GameData from '../Model/GameData';
import MainView from '../View/MainView';
import { SceneState } from '../../GameManger';
import { TransferAniType } from '../View/MainView';
import PlayerPrefs from '@base/tool/playerPrefs';
import { EventManager, EventMessage } from '@base/tool/eventManager';

export default class HomePageController extends MVCStateControllerBase<SceneState, GameData, MainView>
{
    private isInit: boolean = true;
    public get GetStateControllerName(): string
    {
        return 'HomePageController';
    }

    public Init(...params: any)
    {
        super.Init(...params);
        EventManager.AddListener(GameEvent.CHANGE_BIRD_SKIN, (msg?: EventMessage) => { this.ChangeBirdSkin(msg?.cMsg[0]); });
        let volume = PlayerPrefs.Get('MusicVolume') === 1 && PlayerPrefs.Get('MusicVolume')  ? true : false;
        
        this.View.setClickMusicBtn(volume);
        this.View.MusicActive();
    }

    public ChangeBirdSkin(birdSkin: any) {
        PlayerPrefs.Set('BirdSkin', birdSkin);
    }

    public getLevel(): void {
        let text = PlayerPrefs.Get('Level');
        if(!text) {
            PlayerPrefs.Set('Level', 1);
            text = PlayerPrefs.Get('Level');
        }
        this.View.setLevelText(text);
    }

    public async StateBegin(...params: any[])
    {
        console.log("HomePageController StateBegin");
        this.getLevel();
        if (this.isInit) {
            if(!PlayerPrefs.Get('BirdSkin')) this.ChangeBirdSkin(this.Model.BirdIdleSkin[0]);
            this.View.homeActive(true);
            this.isInit = false;
        } else {
            let callback = () => {
                this.View.homeActive(true);
            } 
            this.View.FadeIn(callback);
        }

        this.View.playLogoMove();
    }

    /** 狀態結束 */
    public async StateEnd(...params: any[])
    {
        console.log("HomePageController StateEnd",this.GetStateControllerName);
        await this.View.PlayTransferAni(TransferAniType.HomeToGame);
    }

    /** 當別的新狀態.StateBegin()的時候，此狀態.StateClose()就會被呼叫 */
    public async StateClose(...params: any[])
    {
    }
}