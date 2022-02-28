export default class GlobalGameData {
    private static instance: GlobalGameData;
    
    public static getInstance() {
        if (!this.instance) {
            this.instance = new GlobalGameData();
        }
        return this.instance;
    }
}