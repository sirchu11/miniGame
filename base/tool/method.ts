export default class Method {
    /** 版本4 - UUID 使用隨機性或偽隨機性生成 */
    public static GetUUID(): string {
        let uuid = () => { return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1); }
        return (uuid() + uuid() + '-' + uuid() + '-' + uuid() + '-' + uuid() + '-' + uuid() + uuid() + uuid());
    }

    /** 阿拉伯數字 轉 中文數字 */
    public static NumberConvertToCNNum(num: number): string {
        let changeNum = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
        let unit = ['', '十', '百', '千', '万'];
        let getWan = (temp: number | string) => {
            let strArr = temp.toString().split('').reverse();
            let newNum = '';
            for (var i = 0; i < strArr.length; i++) {
                newNum = (i === 0 && parseInt(strArr[i]) === 0 ? '' : i > 0 && parseInt(strArr[i]) === 0 && parseInt(strArr[i - 1]) === 0 ? '' : changeNum[parseInt(strArr[i])] + (parseInt(strArr[i]) === 0 ? unit[0] : unit[i])) + newNum;
            }
            return newNum;
        };

        let overWan = Math.floor(num / 10000);
        let noWan = num % 10000;
        let noWanStr = '' + noWan;
        return overWan ? getWan(overWan) + '万' + getWan(noWanStr) : getWan(noWanStr);
    }

    /** 取得網頁URL的QueryString給Key值回傳Value */
    public static GetQueryStringValue(key: string): string {
        let url = location.href;
        if (url.indexOf('?') !== -1) {
            let keys = url.split('?')[1].split('&');
            for (let i = 0; i < keys.length; i++) {
                if (keys[i].split('=')[0] === key) {
                    return keys[i].split('=')[1];
                }
            }
        }
        return '';
    }

    /** 是否為Null或Undefined */
    public static IsNullOrUndefined(obj: any): boolean {
        return (obj === null || obj === undefined);
    }

    /** (例如 min= 1 , max = 2) 當val = 3 >> return: 1 ,當val = 5 >> return: 1 超過最大值會循環到最小值繼續往下 */
    public static LoopRange(val: number, min: number, max: number): number {
        if (isNaN(val)) return NaN;

        var result = val;
        var interval = max - min + 1;

        if (result > max) {
            result = (result - min) % interval + min;
        }
        else if (result < min) {
            var mI = ((min - result) % interval);
            result = (mI == 0) ? min : interval - mI + min;
        }

        return result;
    }

    /** 簡易的隨機機率
     * @param probability 機率值 (填0~100)
     */
    public static GetPassProbability(probability: number): boolean {
        return (this.RandomRange(0, 100.01) <= probability) ? true : false;
    }

    /** 給機率設定，會吐回中了哪個Index
    * @param probability 機率值 Ex：Metod.GetProbabilityIndex(20, 30, 50)，假設中了50%的那一個，會回傳其Index 2
    */
    public static GetProbabilityIndex(probability: number[]): number {
        let sum = 0;
        let max = probability.length;
        for (let i = 0; i < max; i++) {
            sum += probability[i];
        }
        let result = this.RandomRange(0, sum);

        sum = 0;
        for (let j = 0; j < max; j++) {
            sum += probability[j];
            if (sum >= result) return j;
        }
        return max - 1;
    }

    /**
     * 回傳範圍內的隨機整數
     * @param  includeMax 隨機範圍包含最大值
     */
    public static RandomIntRange(min: number, max: number, includeMax: boolean = true): number {
        if (min == max) return min;
        if (min > max) return Math.floor(Math.random() * (min - max + (includeMax ? 1 : 0))) + max;
        return Math.floor(Math.random() * (max - min + (includeMax ? 1 : 0))) + min;
    }

    /**
     * 回傳範圍內隨機不重複N個值
     */
    public static GetRandomUniqueValueInArray(min: number, max: number, count: number): Array<number> {
        let arr = [];
        while (arr.length < count) {
            var r = Math.floor(Math.random() * (min - max + 1)) + max;
            if (arr.indexOf(r) === -1) {
                arr.push(r);
            }
        }
        return arr;
    }

    /** 回傳範圍內的隨機數值（非整數單位) */
    public static RandomRange(min: number, max: number): number {
        if (min == max) return min;
        if (min > max) return Math.random() * (min - max) + max;
        return Math.random() * (max - min) + min;
    }

    /** 取得該Enum的數量*/
    public static GetEnumCount(enumObject: any): number {
        let result = 0;
        let keys = Object.keys(enumObject);
        for (let index = 0; index < keys.length; index++) {
            let key = keys[index];
            if (isNaN(parseInt(key))) {
                continue;
            }
            result++;
        }
        return result;
    }

    /** Int的數字前方補零，讓命名規則統一 (比如說：目前值是7，最大值是105，結果就會補兩個0，變成007) */
    public static GetFixIntNumberWithZeroString(currentIndex: number, maxIndex: number): string {
        if (maxIndex < currentIndex) return currentIndex.toString();
        let fixString = '';
        for (let i = 0, gap = maxIndex.toString().length - currentIndex.toString().length; i < gap; i++) fixString += '0';
        return fixString + currentIndex.toString();
    }

    /**
     * 合併兩陣列回傳新陣列
     * @param  filterSameValue 過濾一樣的值
     */
    public static CombineArray(arrayA: any[], arrayB: any[], filterSameValue = false): any[] {
        let result = [];

        for (let i = 0, max = arrayA.length; i < max; i++) {
            result.push(arrayA[i]);
        }

        if (filterSameValue) {
            for (let i = 0, max = arrayB.length; i < max; i++) {
                if (result.indexOf(arrayB[i]) < 0)
                    result.push(arrayB[i]);
            }
        }
        else {
            for (let i = 0, max = arrayB.length; i < max; i++) {
                result.push(arrayB[i]);
            }
        }
        return result;
    }

    /**
     * 日期格式化 預設 yyyy-MM-dd HH:mm:ss
     * @param format 格式化的字符串
     * y:年,
     * M:月(1-12),
     * d:日(1-31),
     * H:小時(0-23),
     * h:小時(0-11),
     * m:分(0-59),
     * s:秒(0-59),
     * f:豪秒(0-999),
     * q:季(1-4)
     */
    public static GetDateByFormat(format?: string): string {
        let date = new Date();
        if (!format) { format = 'yyyy-MM-dd HH:mm:ss'; }
        let map =
        {
            y: date.getFullYear() + '', //年
            M: date.getMonth() + 1 + '', //月
            d: date.getDate() + '', //日
            H: date.getHours().toString(), //小時 24
            m: date.getMinutes() + '', //分
            s: date.getSeconds() + '', //秒
            q: Math.floor((date.getMonth() + 3) / 3) + '', //季
            f: date.getMilliseconds() + '', //毫秒
        };
        //小時 12
        if (parseInt(map['H']) > 12) {
            map['h'] = parseInt(map['H']) - 12 + '';
        }
        else {
            map['h'] = map['H'] + '';
        }
        map['H'] += '';

        /**
         * 回傳字符串(為n個char組成)
        * @param char 重複的字符
        * @param count 次數
        */
        let CharString = (char: string, count: number) => {
            let str: string = '';
            while (count--) { str += char; }
            return str;
        }

        let reg = 'yMdHhmsqf';
        let all = '', str = '';
        for (let i = 0, n = 0; i < reg.length; i++) {
            n = format.indexOf(reg[i]);

            if (n < 0) { continue; }

            all = '';
            for (; n < format.length; n++) {
                if (format[n] != reg[i]) { break; }
                all += reg[i];
            }
            if (all.length > 0) {
                if (all.length == map[reg[i]].length) {
                    str = map[reg[i]];
                }
                else if (all.length > map[reg[i]].length) {
                    if (reg[i] == 'f') {
                        str = map[reg[i]] + CharString('0', all.length - map[reg[i]].length);
                    }
                    else {
                        str = CharString('0', all.length - map[reg[i]].length) + map[reg[i]];
                    }
                }
                else {
                    switch (reg[i]) {
                        case 'y':
                            str = map[reg[i]].substr(map[reg[i]].length - all.length);
                            break;
                        case 'f':
                            str = map[reg[i]].substr(0, all.length);
                            break;
                        default:
                            str = map[reg[i]];
                            break;
                    }
                }
                format = format.replace(all, str);
            }
        }
        return format;
    }

    /** 
     * 複製陣列
     * @param revertCopy 反向複製
     */
    public static CopyArray(array: any[], revertCopy = false): any[] {
        let result: any[] = JSON.parse(JSON.stringify(array));

        if (revertCopy) {
            result = result.reverse();
        }
        return result;
    }

    /** 計算兩點座標所夾的角度 (from的點通常是固定不動的點) */
    public static CalcTwoPosAngle(fromX: number, fromY: number, toX: number, toY: number, digits: number = 2): number {
        let result = (Math.atan(-(toY - fromY) / (toX - fromX)) / Math.PI) * 180;

        if (toX - fromX < 0)	//2、3象限
            result += 180;

        return this.FixAngle(result, digits);
    }

    /** 用畢氏定理算兩點之間的距離 */
    public static CalcTwoPointDistance(p0x: number, p0y: number, p1x: number = 0, p1y: number = 0): number {
        return Math.sqrt(Math.pow(p0x - p1x, 2) + Math.pow(p0y - p1y, 2));
    }

    /** 修正角度顯示到正數 */
    public static FixAngle(angle: number, digits: number = 2): number {
        while (angle < 0) {
            angle += 360;
        }
        angle %= 360;
        return Number(angle.toFixed(digits));
    }

    /** 限制範圍 */
    public static Clamp(value: number, min: number, max: number): number {
        if (value < min)
            value = min;
        if (value > max)
            value = max;
        return value;
    }

    /**
     * 取得弧度路徑下的座標軸
     * @param x 圓心X座標
     * @param y 圓心Y座標
     * @param radius 半徑
     * @param startAngle 開始角度 0-360
     * @param endRadian 結束角度 0-360
     */
    public static GetCircleRadianPath(x: number, y: number, radius: number, startAngle: number, endAngle: number): { x: number, y: number } {
        let startRadian = Math.PI * 2 * (startAngle / 360);
        let endRadian = Math.PI * 2 * (endAngle / 360);
        let radian = Math.PI - startRadian - endRadian;
        let offsetX = radius * Math.sin(radian);
        let offsetY = radius * Math.cos(radian);
        let resultX = x + offsetX;
        let resultY = y + offsetY;
        return { x: resultX, y: resultY };
    };

    /**
    * 取得圓的路徑  
    * @param x 圓心X座標
    * @param y 圓心Y座標
    * @param radius 半徑
    * @param density 密度(密度越大路徑越少)
    */
    public static GetCirclePath(x: number, y: number, radius: number, density: number = 1): { x: number, y: number }[] {
        let result = [];
        let count = 360 / density;
        for (let times = 0; times < count; times++) {
            let hudu = (2 * Math.PI / 360) * (360 / count) * times;
            let X = x + Math.sin(hudu) * radius;
            let Y = y - Math.cos(hudu) * radius;
            result.push({ x: X, y: Y });
        }
        return result;
    }


    /** 升冪排序數字陣列(小到大) */
    public static SortArrayAsc(array: number[], newArray = false): number[] {
        if (newArray) {
            let result = this.CopyArray(array);

            result = result.sort((a, b) => {
                return a - b;
            });

            return result;
        }
        else {
            array = array.sort((a, b) => {
                return a - b;
            })
            return array;
        }
    }

    /** 降冪排序數字陣列(大到小) */
    public static SortArrayDesc(array: number[], newArray = false): number[] {
        if (newArray) {
            let result = this.CopyArray(array);

            result = result.sort((a, b) => {
                return b - a
            });
            return result;
        }
        else {
            array = array.sort((a, b) => {
                return b - a;
            })
            return array;
        }
    }

    /**
     ** 加法函數，用來得到精確的加法結果
     ** 說明：javascript的加法結果會有誤差，在兩個浮點數相加的時候會比較明顯。這個函數返回較為精確的加法結果。
     ** 調用：MathAdd(arg1,arg2)
     ** 返回值：arg1加上arg2的精確結果
     **/
    public static MathAdd(arg1: number, arg2: number): number {
        if (isNaN(arg1)) arg1 = 0;
        if (isNaN(arg2)) arg2 = 0;

        let r1, r2, m, c;
        try {
            r1 = arg1.toString().split('.')[1].length;
        }
        catch (e) {
            r1 = 0;
        }
        try {
            r2 = arg2.toString().split('.')[1].length;
        }
        catch (e) {
            r2 = 0;
        }
        c = Math.abs(r1 - r2);
        m = Math.pow(10, Math.max(r1, r2));
        if (c > 0) {
            let cm = Math.pow(10, c);
            if (r1 > r2) {
                arg1 = Number(arg1.toString().replace('.', ''));
                arg2 = Number(arg2.toString().replace('.', '')) * cm;
            } else {
                arg1 = Number(arg1.toString().replace('.', '')) * cm;
                arg2 = Number(arg2.toString().replace('.', ''));
            }
        } else {
            arg1 = Number(arg1.toString().replace('.', ''));
            arg2 = Number(arg2.toString().replace('.', ''));
        }
        return (arg1 + arg2) / m;
    }

    /**
     ** 減法函數，用來得到精確的減法結果
     ** 說明：javascript的減法結果會有誤差，在兩個浮點數相減的時候會比較明顯。這個函數返回較為精確的減法結果。
     ** 調用：MathSub(arg1,arg2)
     ** 返回值：arg1加上arg2的精確結果
     **/
    public static MathSub(arg1: number, arg2: number): number {
        if (isNaN(arg1)) arg1 = 0;
        if (isNaN(arg2)) arg2 = 0;
        let r1, r2, m, n;
        try {
            r1 = arg1.toString().split('.')[1].length;
        }
        catch (e) {
            r1 = 0;
        }
        try {
            r2 = arg2.toString().split('.')[1].length;
        }
        catch (e) {
            r2 = 0;
        }
        m = Math.pow(10, Math.max(r1, r2)); //last modify by deeka //动态控制精度长度
        n = (r1 >= r2) ? r1 : r2;
        return Method.MathToFixed(((arg1 * m - arg2 * m) / m), n);
    }

    /**
     ** 乘法函數，用來得到精確的乘法結果
     ** 說明：javascript的乘法結果會有誤差，在兩個浮點數相乘的時候會比較明顯。這個函數返回較為精確的乘法結果。
     ** 調用：MathMul(arg1,arg2)
     ** 返回值：arg1乘以 arg2的精確結果
     **/
    public static MathMul(arg1: number, arg2: number, digits = -1): number {
        if (isNaN(arg1)) arg1 = 0;
        if (isNaN(arg2)) arg2 = 0;
        let m = 0, s1 = arg1.toString(), s2 = arg2.toString();
        try { m += s1.split('.')[1].length; } catch (e) {
            console.error('MathMul');
        }
        try { m += s2.split('.')[1].length; } catch (e) {
            console.error('MathMul');
        }
        let result = Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m);
        if (digits >= 0) {
            let r = Math.pow(10, digits);
            return Number((result * r).toString().split('.')[0]) / r;
        }
        return result;
    }

    /**
     ** 除法函數，用來得到精確的除法結果
     ** 說明：javascript的除法結果會有誤差，在兩個浮點數相除的時候會比較明顯。這個函數返回較為精確的除法結果。
     ** 調用：MathDiv(arg1,arg2)
     ** 返回值：arg1除以arg2的精確結果
     **/
    public static MathDiv(arg1: number, arg2: number, digits = -1): number {
        if (isNaN(arg1)) arg1 = 0;
        if (isNaN(arg2)) arg2 = 0;

        if (arg2 === 0) {
            console.error('除法函數除數不得為0');
            return NaN;
        }
        let t1 = 0, t2 = 0, r1, r2;
        try { t1 = arg1.toString().split('.')[1].length; } catch (e) { console.error('MathDiv'); }
        try { t2 = arg2.toString().split('.')[1].length; } catch (e) { console.error('MathDiv'); }
        r1 = Number(arg1.toString().replace('.', ''));
        r2 = Number(arg2.toString().replace('.', ''));
        let result = (r1 / r2) * Math.pow(10, t2 - t1);
        if (digits >= 0) {
            let r = Math.pow(10, digits);
            return Number((result * r).toString().split('.')[0]) / r;
        }
        return result;
    }

    /** 不要四捨五入的取小數點數字方法 */
    public static MathToFixed(value: number, digits: number): number {
        let m = Math.pow(10, digits);
        return Method.MathDiv(Number(Method.MathMul(value, m).toString().split('.')[0]), m);
    }

    /**
     * Math.sin的角度版
     * @param angle 角度 (0~360)
     */
    public static MathSin(angle: number): number {
        return Math.sin(Math.PI * angle / 180);
    }

    /**
     * Math.cos的角度版
     * @param angle 角度 (0~360)
     */
    public static MathCos(angle: number): number {
        return Math.cos(Math.PI * angle / 180);
    }

    /**
     * Math.tan的角度版
     * @param angle 角度 (0~360)
     * @param valueWhenDivZero 當要除以0的時候，要Return的值
     */
    public static MathTan(angle: number, valueWhenDivZero: number): number {
        let sin = Number(Method.MathSin(angle).toFixed(6));
        let cos = Number(Method.MathCos(angle).toFixed(6));
        return (cos === 0) ? valueWhenDivZero : sin / cos;
    }

    /**
     * Math.cot的角度版
     * @param angle 角度 (0~360)
     * @param valueWhenDivZero 當要除以0的時候，要Return的值
     */
    public static MathCot(angle: number, valueWhenDivZero: number): number {
        let cos = Number(Method.MathCos(angle).toFixed(6));
        let sin = Number(Method.MathSin(angle).toFixed(6));
        return (sin === 0) ? valueWhenDivZero : cos / sin;
    }
    /**
     * Math.sec的角度版
     * @param angle 角度 (0~360)
     * @param valueWhenDivZero 當要除以0的時候，要Return的值
     */
    public static MathSec(angle: number, valueWhenDivZero: number): number {
        let cos = Number(Method.MathCos(angle).toFixed(6));
        return (cos === 0) ? valueWhenDivZero : 1 / cos;
    }
    /**
     * Math.csc的角度版
     * @param angle 角度 (0~360)
     * @param valueWhenDivZero 當要除以0的時候，要Return的值
     */
    public static MathCsc(angle: number, valueWhenDivZero: number): number {
        let sin = Number(Method.MathSin(angle).toFixed(6));
        return (sin === 0) ? valueWhenDivZero : 1 / sin;
    }

    /** 角度轉弧度 */
    public static AngleToRadian(angle: number): number {
        return (Math.PI / 180 * angle);
    }

    /** 弧度轉角度 */
    public static RadianToAngle(radian: number): number {
        return (180 / Math.PI * radian);
    }

    public static isStrEmpty(str: string): boolean {
        return str.trim().length === 0;
    }

    // 隨機生成名字
    public static generateName(originalName?: string): string {
        let nameList = ["abandoned", "able", "absolute", "adorable", "adventurous", "academic", "acceptable", "acclaimed", "accomplished", "accurate", "aching", "acidic", "acrobatic", "active", "actual", "adept", "admirable", "admired", "adolescent", "adorable", "adored", "advanced", "afraid", "affectionate", "aged", "aggravating", "aggressive", "agile", "agitated", "agonizing", "agreeable", "ajar", "alarmed", "alarming", "alert", "alienated", "alive", "all", "altruistic", "amazing", "ambitious", "ample", "amused", "amusing", "anchored", "ancient", "angelic", "angry", "anguished", "animated", "annual", "another", "antique", "anxious", "any", "apprehensive", "appropriate", "apt", "arctic", "arid", "aromatic", "artistic", "ashamed", "assured", "astonishing", "athletic", "attached", "attentive", "attractive", "austere", "authentic", "authorized", "automatic", "avaricious", "average", "aware", "awesome", "awful", "awkward", "babyish", "bad", "back", "baggy", "bare", "barren", "basic", "beautiful", "belated", "beloved", "beneficial", "better", "best", "bewitched", "big", "big-hearted", "biodegradable", "bite-sized", "bitter", "black", "black-and-white", "bland", "blank", "blaring", "bleak", "blind", "blissful", "blond", "blue", "blushing", "bogus", "boiling", "bold", "bony", "boring", "bossy", "both", "bouncy", "bountiful", "bowed", "brave", "breakable", "brief", "bright", "brilliant", "brisk", "broken", "bronze", "brown", "bruised", "bubbly", "bulky", "bumpy", "buoyant", "burdensome", "burly", "bustling", "busy", "buttery", "buzzing", "calculating", "calm", "candid", "canine", "capital", "carefree", "careful", "careless", "caring", "cautious", "cavernous", "celebrated", "charming", "cheap", "cheerful", "cheery", "chief", "chilly", "chubby", "circular", "classic", "clean", "clear", "clear-cut", "clever", "close", "closed", "cloudy", "clueless", "clumsy", "cluttered", "coarse", "cold", "colorful", "colorless", "colossal", "comfortable", "common", "compassionate", "competent", "complete", "complex", "complicated", "composed", "concerned", "concrete", "confused", "conscious", "considerate", "constant", "content", "conventional", "cooked", "cool", "cooperative", "coordinated", "corny", "corrupt", "costly", "courageous", "courteous", "crafty", "crazy", "creamy", "creative", "creepy", "criminal", "crisp", "critical", "crooked", "crowded", "cruel", "crushing", "cuddly", "cultivated", "cultured", "cumbersome", "curly", "curvy", "cute", "cylindrical", "damaged", "damp", "dangerous", "dapper", "daring", "darling", "dark", "dazzling", "dead", "deadly", "deafening", "dear", "dearest", "decent", "decimal", "decisive", "deep", "defenseless", "defensive", "defiant", "deficient", "definite", "definitive", "delayed", "delectable", "delicious", "delightful", "delirious", "demanding", "dense", "dental", "dependable", "dependent", "descriptive", "deserted", "detailed", "determined", "devoted", "different", "difficult", "digital", "diligent", "dim", "dimpled", "dimwitted", "direct", "disastrous", "discrete", "disfigured", "disgusting", "disloyal", "dismal", "distant", "downright", "dreary", "dirty", "disguised", "dishonest", "dismal", "distant", "distinct", "distorted", "dizzy", "dopey", "doting", "double", "downright", "drab", "drafty", "dramatic", "dreary", "droopy", "dry", "dual", "dull", "dutiful", "each", "eager", "earnest", "early", "easy", "easy-going", "ecstatic", "edible", "educated", "elaborate", "elastic", "elated", "elderly", "electric", "elegant", "elementary", "elliptical", "embarrassed", "embellished", "eminent", "emotional", "empty", "enchanted", "enchanting", "energetic", "enlightened", "enormous", "enraged", "entire", "envious", "equal", "equatorial", "essential", "esteemed", "ethical", "euphoric", "even", "evergreen", "everlasting", "every", "evil", "exalted", "excellent", "exemplary", "exhausted", "excitable", "excited", "exciting", "exotic", "expensive", "experienced", "expert", "extraneous", "extroverted", "extra-large", "extra-small", "fabulous", "failing", "faint", "fair", "faithful", "fake", "false", "familiar", "famous", "fancy", "fantastic", "far", "faraway", "far-flung", "far-off", "fast", "fat", "fatal", "fatherly", "favorable", "favorite", "fearful", "fearless", "feisty", "feline", "female", "feminine", "few", "fickle", "filthy", "fine", "finished", "firm", "first", "firsthand", "fitting", "fixed", "flaky", "flamboyant", "flashy", "flat", "flawed", "flawless", "flickering", "flimsy", "flippant", "flowery", "fluffy", "fluid", "flustered", "focused", "fond", "foolhardy", "foolish", "forceful", "forked", "formal", "forsaken", "forthright", "fortunate", "fragrant", "frail", "frank", "frayed", "free", "French", "fresh", "frequent", "friendly", "frightened", "frightening", "frigid", "frilly", "frizzy", "frivolous", "front", "frosty", "frozen", "frugal", "fruitful", "full", "fumbling", "functional", "funny", "fussy", "fuzzy", "gargantuan", "gaseous", "general", "generous", "gentle", "genuine", "giant", "giddy", "gigantic", "gifted", "giving", "glamorous", "glaring", "glass", "gleaming", "gleeful", "glistening", "glittering", "gloomy", "glorious", "glossy", "glum", "golden", "good", "good-natured", "gorgeous", "graceful", "gracious", "grand", "grandiose", "granular", "grateful", "grave", "gray", "great", "greedy", "green", "gregarious", "grim", "grimy", "gripping", "grizzled", "gross", "grotesque", "grouchy", "grounded", "growing", "growling", "grown", "grubby", "gruesome", "grumpy", "guilty", "gullible", "gummy", "hairy", "half", "handmade", "handsome", "handy", "happy", "happy-go-lucky", "hard", "hard-to-find", "harmful", "harmless", "harmonious", "harsh", "hasty", "hateful", "haunting", "healthy", "heartfelt", "hearty", "heavenly", "heavy", "hefty", "helpful", "helpless", "hidden", "hideous", "high", "high-level", "hilarious", "hoarse", "hollow", "homely", "honest", "honorable", "honored", "hopeful", "horrible", "hospitable", "hot", "huge", "humble", "humiliating", "humming", "humongous", "hungry", "hurtful", "husky", "icky", "icy", "ideal", "idealistic", "identical", "idle", "idiotic", "idolized", "ignorant", "ill", "illegal", "ill-fated", "ill-informed", "illiterate", "illustrious", "imaginary", "imaginative", "immaculate", "immaterial", "immediate", "immense", "impassioned", "impeccable", "impartial", "imperfect", "imperturbable", "impish", "impolite", "important", "impossible", "impractical", "impressionable", "impressive", "improbable", "impure", "inborn", "incomparable", "incompatible", "incomplete", "inconsequential", "incredible", "indelible", "inexperienced", "indolent", "infamous", "infantile", "infatuated", "inferior", "infinite", "informal", "innocent", "insecure", "insidious", "insignificant", "insistent", "instructive", "insubstantial", "intelligent", "intent", "intentional", "interesting", "internal", "international", "intrepid", "ironclad", "irresponsible", "irritating", "itchy", "jaded", "jagged", "jam-packed", "jaunty", "jealous", "jittery", "joint", "jolly", "jovial", "joyful", "joyous", "jubilant", "judicious", "juicy", "jumbo", "junior", "jumpy", "juvenile", "kaleidoscopic", "keen", "key", "kind", "kindhearted", "kindly", "klutzy", "knobby", "knotty", "knowledgeable", "knowing", "known", "kooky", "kosher", "lame", "lanky", "large", "last", "lasting", "late", "lavish", "lawful", "lazy", "leading", "lean", "leafy", "left", "legal", "legitimate", "light", "lighthearted", "likable", "likely", "limited", "limp", "limping", "linear", "lined", "liquid", "little", "live", "lively", "livid", "loathsome", "lone", "lonely", "long", "long-term", "loose", "lopsided", "lost", "loud", "lovable", "lovely", "loving", "low", "loyal", "lucky", "lumbering", "luminous", "lumpy", "lustrous", "luxurious", "mad", "made-up", "magnificent", "majestic", "major", "male", "mammoth", "married", "marvelous", "masculine", "massive", "mature", "meager", "mealy", "mean", "measly", "meaty", "medical", "mediocre", "medium", "meek", "mellow", "melodic", "memorable", "menacing", "merry", "messy", "metallic", "mild", "milky", "mindless", "miniature", "minor", "minty", "miserable", "miserly", "misguided", "misty", "mixed", "modern", "modest", "moist", "monstrous", "monthly", "monumental", "moral", "mortified", "motherly", "motionless", "mountainous", "muddy", "muffled", "multicolored", "mundane", "murky", "mushy", "musty", "muted", "mysterious", "naive", "narrow", "nasty", "natural", "naughty", "nautical", "near", "neat", "necessary", "needy", "negative", "neglected", "negligible", "neighboring", "nervous", "new", "next", "nice", "nifty", "nimble", "nippy", "nocturnal", "noisy", "nonstop", "normal", "notable", "noted", "noteworthy", "novel", "noxious", "numb", "nutritious", "nutty", "obedient", "obese", "oblong", "oily", "oblong", "obvious", "occasional", "odd", "oddball", "offbeat", "offensive", "official", "old", "old-fashioned", "only", "open", "optimal", "optimistic", "opulent", "orange", "orderly", "organic", "ornate", "ornery", "ordinary", "original", "other", "our", "outlying", "outgoing", "outlandish", "outrageous", "outstanding", "oval", "overcooked", "overdue", "overjoyed", "overlooked", "palatable", "pale", "paltry", "parallel", "parched", "partial", "passionate", "past", "pastel", "peaceful", "peppery", "perfect", "perfumed", "periodic", "perky", "personal", "pertinent", "pesky", "pessimistic", "petty", "phony", "physical", "piercing", "pink", "pitiful", "plain", "plaintive", "plastic", "playful", "pleasant", "pleased", "pleasing", "plump", "plush", "polished", "polite", "political", "pointed", "pointless", "poised", "poor", "popular", "portly", "posh", "positive", "possible", "potable", "powerful", "powerless", "practical", "precious", "present", "prestigious", "pretty", "precious", "previous", "pricey", "prickly", "primary", "prime", "pristine", "private", "prize", "probable", "productive", "profitable", "profuse", "proper", "proud", "prudent", "punctual", "pungent", "puny", "pure", "purple", "pushy", "putrid", "puzzled", "puzzling", "quaint", "qualified", "quarrelsome", "quarterly", "queasy", "querulous", "questionable", "quick", "quick-witted", "quiet", "quintessential", "quirky", "quixotic", "quizzical", "radiant", "ragged", "rapid", "rare", "rash", "raw", "recent", "reckless", "rectangular", "ready", "real", "realistic", "reasonable", "red", "reflecting", "regal", "regular", "reliable", "relieved", "remarkable", "remorseful", "remote", "repentant", "required", "respectful", "responsible", "repulsive", "revolving", "rewarding", "rich", "rigid", "right", "ringed", "ripe", "roasted", "robust", "rosy", "rotating", "rotten", "rough", "round", "rowdy", "royal", "rubbery", "rundown", "ruddy", "rude", "runny", "rural", "rusty", "sad", "safe", "salty", "same", "sandy", "sane", "sarcastic", "sardonic", "satisfied", "scaly", "scarce", "scared", "scary", "scented", "scholarly", "scientific", "scornful", "scratchy", "scrawny", "second", "secondary", "second-hand", "secret", "self-assured", "self-reliant", "selfish", "sentimental", "separate", "serene", "serious", "serpentine", "several", "severe", "shabby", "shadowy", "shady", "shallow", "shameful", "shameless", "sharp", "shimmering", "shiny", "shocked", "shocking", "shoddy", "short", "short-term", "showy", "shrill", "shy", "sick", "silent", "silky", "silly", "silver", "similar", "simple", "simplistic", "sinful", "single", "sizzling", "skeletal", "skinny", "sleepy", "slight", "slim", "slimy", "slippery", "slow", "slushy", "small", "smart", "smoggy", "smooth", "smug", "snappy", "snarling", "sneaky", "sniveling", "snoopy", "sociable", "soft", "soggy", "solid", "somber", "some", "spherical", "sophisticated", "sore", "sorrowful", "soulful", "soupy", "sour", "Spanish", "sparkling", "sparse", "specific", "spectacular", "speedy", "spicy", "spiffy", "spirited", "spiteful", "splendid", "spotless", "spotted", "spry", "square", "squeaky", "squiggly", "stable", "staid", "stained", "stale", "standard", "starchy", "stark", "starry", "steep", "sticky", "stiff", "stimulating", "stingy", "stormy", "straight", "strange", "steel", "strict", "strident", "striking", "striped", "strong", "studious", "stunning", "stupendous", "stupid", "sturdy", "stylish", "subdued", "submissive", "substantial", "subtle", "suburban", "sudden", "sugary", "sunny", "super", "superb", "superficial", "superior", "supportive", "sure-footed", "surprised", "suspicious", "svelte", "sweaty", "sweet", "sweltering", "swift", "sympathetic", "tall", "talkative", "tame", "tan", "tangible", "tart", "tasty", "tattered", "taut", "tedious", "teeming", "tempting", "tender", "tense", "tepid", "terrible", "terrific", "testy", "thankful", "that", "these", "thick", "thin", "third", "thirsty", "this", "thorough", "thorny", "those", "thoughtful", "threadbare", "thrifty", "thunderous", "tidy", "tight", "timely", "tinted", "tiny", "tired", "torn", "total", "tough", "traumatic", "treasured", "tremendous", "tragic", "trained", "tremendous", "triangular", "tricky", "trifling", "trim", "trivial", "troubled", "true", "trusting", "trustworthy", "trusty", "truthful", "tubby", "turbulent", "twin", "ugly", "ultimate", "unacceptable", "unaware", "uncomfortable", "uncommon", "unconscious", "understated", "unequaled", "uneven", "unfinished", "unfit", "unfolded", "unfortunate", "unhappy", "unhealthy", "uniform", "unimportant", "unique", "united", "unkempt", "unknown", "unlawful", "unlined", "unlucky", "unnatural", "unpleasant", "unrealistic", "unripe", "unruly", "unselfish", "unsightly", "unsteady", "unsung", "untidy", "untimely", "untried", "untrue", "unused", "unusual", "unwelcome", "unwieldy", "unwilling", "unwitting", "unwritten", "upbeat", "upright", "upset", "urban", "usable", "used", "useful", "useless", "utilized", "utter", "vacant", "vague", "vain", "valid", "valuable", "vapid", "variable", "vast", "velvety", "venerated", "vengeful", "verifiable", "vibrant", "vicious", "victorious", "vigilant", "vigorous", "villainous", "violet", "violent", "virtual", "virtuous", "visible", "vital", "vivacious", "vivid", "voluminous", "wan", "warlike", "warm", "warmhearted", "warped", "wary", "wasteful", "watchful", "waterlogged", "watery", "wavy", "wealthy", "weak", "weary", "webbed", "wee", "weekly", "weepy", "weighty", "weird", "welcome", "well-documented", "well-groomed", "well-informed", "well-lit", "well-made", "well-off", "well-to-do", "well-worn", "wet", "which", "whimsical", "whirlwind", "whispered", "white", "whole", "whopping", "wicked", "wide", "wide-eyed", "wiggly", "wild", "willing", "wilted", "winding", "windy", "winged", "wiry", "wise", "witty", "wobbly", "woeful", "wonderful", "wooden", "woozy", "wordy", "worldly", "worn", "worried", "worrisome", "worse", "worst", "worthless", "worthwhile", "worthy", "wrathful", "wretched", "writhing", "wrong", "wry", "yawning", "yearly", "yellow", "yellowish", "young", "youthful", "yummy", "zany", "zealous", "zesty", "zigzag", "rocky"];

        if (originalName) {
            nameList = nameList.filter(v => {
                return v !== originalName.toLowerCase();
            });
        }
        return this.capFirst(nameList[this.RandomIntRange(0, nameList.length, false)]);
    }

    // 第一個字大寫
    private static capFirst(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}