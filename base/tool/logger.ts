import Method from './method';

export enum LogType {
    Client = 0,
    Server = 1
}

export default class Logger {
    private static clientSymbol = '【Client】';
    private static serverSymbol = '【Server】';
    private static clientActive = false;
    private static serverActive = false;
    private static timeStampActive = false;

    /**
     * 過濾不啟用類型的訊息
     * @param clientActive LogType為 LogType.Client的訊息是否啟用
     * @param serverActive LogType為 LogType.Server的訊息是否啟用
     * @param timeStampActive 是否在訊息前加上時間戳
     */
    public static SetActive(clientActive: boolean, serverActive: boolean, timeStampActive: boolean = true) {
        this.clientActive = clientActive;
        this.serverActive = serverActive;
        this.timeStampActive = timeStampActive;
    }

    public static IsActive(type: LogType): boolean {
        switch (type) {
            case LogType.Client:
                return this.clientActive;
            case LogType.Server:
                return this.serverActive;
        }
    }

    public static Log(type: LogType, ...logValues: any): void {
        if (!this.IsActive(type)) return;
        console.log(this.BuildInfo(type, logValues));
    }

    public static LogWarning(type: LogType, ...logValues: any): void {
        if (!this.IsActive(type)) return;
        console.warn(this.BuildInfo(type, logValues));
    }

    public static LogError(type: LogType, ...logValues: any): void {
        if (!this.IsActive(type)) return;
        console.error(this.BuildInfo(type, logValues));
    }

    public static LogAlert(type: LogType, ...logValues: any): void {
        if (!this.IsActive(type)) return;
        alert(this.BuildInfo(type, logValues));
    }

    public static LogWithFlag(type: LogType, ...logValues: any): void {
        if (!this.IsActive(type)) return;
        console.log(this.GetLogSymbol(type) + '--------------- ' + this.GetLogString(logValues) + ' ---------------');
    }

    public static LogWarningWithFlag(type: LogType, ...logValues: any): void {
        if (!this.IsActive(type)) return;
        console.warn(this.GetLogSymbol(type) + '--------------- ' + this.GetLogString(logValues) + ' ---------------');
    }

    public static LogErrorWithFlag(type: LogType, ...logValues: any): void {
        if (!this.IsActive(type)) return;
        console.error(this.GetLogSymbol(type) + '--------------- ' + this.GetLogString(logValues) + ' ---------------');
    }

    /** 清空訊息 */
    public static ClearLog(): void {
        console.clear();
    }

    private static BuildInfo(type: LogType, logValues: any): string {
        let timeStamp = (this.timeStampActive) ? Method.GetDateByFormat() : '';
        return timeStamp + this.GetLogSymbol(type) + this.GetLogString(logValues);
    }

    private static GetLogSymbol(type: LogType): string {
        switch (type) {
            case LogType.Client:
                return this.clientSymbol;
            case LogType.Server:
                return this.serverSymbol;
        }
    }

    private static GetLogString(logValues: any): string {
        if (logValues) {
            if (logValues.length > 0) {
                return (logValues.length == 1) ? logValues[0] : this.GetLogValueFormat(logValues);
            }
        }
        return '';
    }

    private static GetLogValueFormat(logValues: any): string {
        let logString = '';
        let valueCount = logValues.length;
        if (valueCount % 2 !== 0) valueCount++;	//不是成對就讓它成對

        for (let i = 0; i < valueCount; i++) {
            if (i % 2 == 0) {
                logString += '[' + (Method.IsNullOrUndefined(logValues[i]) ? 'NULL_KEY' : logValues[i]) + ' = ';
            }
            else {
                logString += (Method.IsNullOrUndefined(logValues[i]) ? 'NULL_VALUE' : logValues[i]) + ']';
            }
        }
        return logString;
    }
}