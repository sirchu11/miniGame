
const PREFIX = '$unixie$';

export default class PlayerPrefs {
  public static Set(key: any, value?: any): void {
    if (typeof key === 'string') {
      localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
    }
    else if (typeof key === 'object' && typeof value === 'undefined') {
      for (let k in key) {
        this.Set(k, key[k]);
      }
    }
  }

  public static Get(key: string): any {
    let data = localStorage.getItem(`${PREFIX}${key}`);
    if (!data || data == 'undefined') {
      return;
    }
    return JSON.parse(data);
  }

  public static Remove(key: string): void {
    localStorage.removeItem(`${PREFIX}${key}`);
  }

  public static Clear(): void {
    localStorage.clear();
  }
}
