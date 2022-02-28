let listenerMap = new Map();

export class EventMessage {
    public cMsg: any;
    constructor(...args: any[]) {
        this.cMsg = Array.prototype.slice.call(args); //copy. arguments不能直接用.slice()
    }
}

class TempPack {
    public mHandler: any;
    public mAdd: any;
    constructor(handler, add) {
        this.mHandler = handler;
        this.mAdd = add;
    }
}

class HandlerPack {
    public handlerList: Array<any> = new Array();
    public handling: boolean = false;
    public tempList: Array<any> = new Array();

    constructor() {
        this.handlerList = [];
        this.handling = false;
        this.tempList = [];

        this.Add = this.Add.bind(this);
        this.Remove = this.Remove.bind(this);
        this.Deal_With_Temp = this.Deal_With_Temp.bind(this);
    }

    Add(handler) {
        if (!this.handling)
            this.handlerList.push(handler);
        else
            this.tempList.push(new TempPack(handler, true));
    }

    Remove(handler) {
        if (!this.handling) {
            let index = this.handlerList.indexOf(handler);
            if (index !== -1)
                this.handlerList.splice(index, 1);
        }
        else
            this.tempList.push(new TempPack(handler, false));
    }

    Deal_With_Temp() {
        for (let i = 0, l = this.tempList.length; i < l; i++) {
            if (this.tempList[i].mAdd)
                this.handlerList.push(this.tempList[i].mHandler);
            else {
                let index = this.handlerList.indexOf(this.tempList[i].mHandler);
                if (index !== -1)
                    this.handlerList.splice(index, 1);
            }
        }
        this.tempList.length = 0;
    }
}

export class EventManager {
    static AddListener(id, handler) {
        if (!listenerMap.has(id)) {
            let hp = new HandlerPack();
            listenerMap.set(id, hp);
        }

        listenerMap.get(id).Add(handler);
    }

    static RemoveListener(id, handler) {
        if (listenerMap.has(id)) {
            let hp = listenerMap.get(id);
            hp.Remove(handler);

            if (hp.handlerList.length <= 0)
                listenerMap.delete(id);
        }
    }

    static RemoveAllListener() {
        listenerMap.clear();
    }

    static SendMessage(id: string, em: any = null, onlyOne = false) {
        try {
            if (listenerMap.has(id)) {
                let hp = listenerMap.get(id);
                hp.handling = true;

                let handlerList = hp.handlerList;
                if (onlyOne && handlerList.length > 1)
                    console.error('ERROR. More than 1 listener when onlyOne = true.');

                for (let i = 0, l = handlerList.length; i < l; i++) {
                    handlerList[i].call(null, em);
                }

                hp.handling = false;
                hp.Deal_With_Temp();
            }
        }
        catch (e) {
            if (listenerMap.has(id)) {
                let hp = listenerMap.get(id);
                hp.handling = false;
            }

            console.error(e);
        }
    }

    static GetListenerAmt() {
        let res = 0;
        for (let value of listenerMap.values())
            res += value.handlerList.length;

        return res;
    }
}