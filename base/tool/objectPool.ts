import Method from './method';

export default class ObjectPool<T> {
    /** 活動中的物件清單 */
    public get ActiveList(): T[] { return this.activeList };
    private activeList: T[] = [];
    /** 回收池中的物件清單 */
    public get RecycleList(): T[] { return this.recycleList };
    private recycleList: T[] = [];
    private onGenerate: () => T;
    private onGet: (obj: T) => void;
    private onRecycle: (obj: T) => void;
    private onDestroy: (obj: T) => void;

    /**
     * @param onGenerate 生成時呼叫的方法
     * @param onGet 取得時呼叫的方法
     * @param onRecycle 回收時呼叫的方法
     * @param onDestroy 銷毀時呼叫的方法
     */
    public constructor(onGenerate: () => T, onGet: (obj: T) => void, onRecycle: (obj: T) => void, onDestroy: (obj: T) => void) {
        this.onGenerate = onGenerate;
        this.onGet = onGet;
        this.onRecycle = onRecycle;
        this.onDestroy = onDestroy;
    }

    /** 取得回收列表中的物件數量 */
    public get RecycleObjCount(): number { return this.recycleList.length; }

    /** 取得活動列表中的物件數量 */
    public get ActiveObjCount(): number { return this.activeList.length; }

    /** 取得池中所有物件數量 */
    public get ObjCount(): number { return (this.ActiveObjCount + this.RecycleObjCount); }

    /** 從回收列表中取出物件，如果列表中沒有可用物件，會自動執行註冊的OnGenerate方法來生成物件，在執行註冊的OnGet方法 */
    public GetObj(): T {
        let result = this.recycleList.shift();
        if (!result) {
            console.log('池中物件數量不足，自動生成後取出');
            result = this.onGenerate();
        }
        this.activeList.push(result);
        this.onGet(result);
        return result;
    }

    /** 執行註冊的OnRecycle方法 */
    public RecycleObj(targetObj: T): void {
        if (Method.IsNullOrUndefined(targetObj)) {
            console.warn('回收物件為空物件');
        }
        else {
            let index = this.activeList.indexOf(targetObj);
            if (index >= 0) {
                targetObj = this.activeList.splice(index, 1)[0];
                this.onRecycle(targetObj);
                this.recycleList.push(targetObj);
            }
            else {
                console.warn('obj:' + targetObj + '，不屬於池中物件');
            }
        }
    }

    /** 尋遍所有活動列表中的物件，執行註冊的OnRecycle方法 */
    public RecycleAll(): void {
        for (let index = 0, max = this.activeList.length; index < max; index++) {
            let obj = this.activeList[0];
            this.RecycleObj(obj);
        }
    }

    /** 執行註冊的OnDestroy方法 */
    public DestroyObj(targetObj: T): void {
        if (Method.IsNullOrUndefined(targetObj)) {
            console.warn('銷毀物件為空物件');
        }
        else {
            //先檢查活動中清單
            let index = this.activeList.indexOf(targetObj);
            if (index >= 0) {
                targetObj = this.activeList.splice(index, 1)[0];
                this.onDestroy(targetObj);
            }
            else {
                //不存在則檢查回收清單
                index = this.recycleList.indexOf(targetObj);
                if (index >= 0) {
                    targetObj = this.recycleList.splice(index, 1)[0];
                    this.onDestroy(targetObj);
                }
                else {
                    console.warn('obj:' + targetObj + '，不屬於池中物件');
                }
            }
        }
    }

    /** 所有活動清單中的物件執行註冊的OnDestroy方法並清空列表 */
    public DestroyAllObjFromActiveList(): void {
        for (let index = 0; index < this.activeList.length; index++) {
            let obj = this.activeList[index];
            this.onDestroy(obj);
        }
        this.activeList = [];
    }

    /** 所有回收清單中的物件執行註冊的OnDestroy方法並清空列表 */
    public DestroyAllObjFromRecycleList(): void {
        for (let index = 0; index < this.recycleList.length; index++) {
            let obj = this.recycleList[index];
            this.onDestroy(obj);
        }
        this.recycleList = [];
    }

    /** 
     * 所有池中物件執行註冊的OnRecycle方法並清空列表
     * @param recycle 銷毀前執行是否先執行回收
     */
    public Clear(recycle: boolean = false): void {
        if (recycle) {
            this.RecycleAll();
            this.DestroyAllObjFromRecycleList();
        }
        else {
            this.DestroyAllObjFromRecycleList();
            this.DestroyAllObjFromActiveList();
        }
    }
}