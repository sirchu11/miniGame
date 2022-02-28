# 小遊戲大廳
[大廳進遊戲流程](#大廳進遊戲流程)
<br>
[大廳預註冊元件](#大廳預註冊元件)
<br>
[專案使用套件](#專案使用套件)
<br>
[TSLint&CodingStyle](#TSLint&CodingStyle)
<br>
[小遊戲共用元件]

## 大廳進遊戲流程
由[**GameManager**]控管進入遊戲流程， isTestGame若設定為true則預設編譯執行後直接對接games/TG底下的資源

## 大廳預註冊元件
[**GlobalListener**]目前只有註冊頁面可見度設定，預設統一處理音效開關的事件，若有其他需求可透過呼叫`registerVisibleEvent`來註冊遊戲客製化事件
<br>

[**ResLoader**]為大廳及遊戲資源的管理器，負責加載大廳及遊戲資源，並分別存放於`LobbyLoader`及`GameLoader`中。
<br>
若遊戲有獲取GameLoader資源的需求可直接呼叫`ResLoader.getInstance().getGameResources()`

## 專案開發使用套件
| Packages | Feature | Doc |
|-------------------------|-------------------------------|-------------------------------|
| [gsap](https://github.com/greensock/GSAP) | 動畫套件 | [文件](https://greensock.com/docs/) |
| [Pixi.js](https://github.com/pixijs/pixijs) | 繪圖引擎 | [文件](https://pixijs.download/dev/docs/index.html) |
| [Howler](https://github.com/goldfire/howler.js) | 音效播放套件 | [文件](https://github.com/goldfire/howler.js) |

## TSLint&CodingStyle
編譯時會自動執行 yarn lint
```sh
檢查小遊戲大廳用
$ "lint": "tslint -c tslint.json 'src/**/*.ts'"
檢查小遊戲用
$ "gamelint": "tslint -c tslint.json games/**/*.ts"
```

### 規則
| 名稱 | 規則詳述 | 參考連結
| ------ | ------ | ------ |
| no-empty-interface | 不允許存在空的interface | https://palantir.github.io/tslint/rules/no-empty-interface/ |
| no-for-in | 不允許for i in j的用法 | https://palantir.github.io/tslint/rules/no-for-in/ |
| no-var-requires | 使用import替代require | https://palantir.github.io/tslint/rules/no-var-requires/ |
| function-constructor | 不允許使用內建函數 | https://palantir.github.io/tslint/rules/function-constructor/ |
| no-duplicate-super | 不允許重複呼叫super | https://palantir.github.io/tslint/rules/no-duplicate-super/ |
| no-duplicate-switch-case | 不允許重複的case在switch中 | https://palantir.github.io/tslint/rules/no-duplicate-switch-case/ |
| no-var-keyword | 不允許使用var, 以let & const為主 | https://palantir.github.io/tslint/rules/no-var-keyword/ |
| no-empty | 不允許空function & catch | https://palantir.github.io/tslint/rules/no-empty/ |
| no-invalid-this | 不允許在class外層呼叫this | https://palantir.github.io/tslint/rules/no-invalid-this/ |
| no-misused-new | new只能用來建構class | https://palantir.github.io/tslint/rules/no-misused-new/ |
| indent | 強制使用四個空格做縮排 | https://palantir.github.io/tslint/rules/indent/ |
| no-consecutive-blank-lines | 不允許連續多行空白 | https://palantir.github.io/tslint/rules/no-consecutive-blank-lines/ |
| no-trailing-whitespace | 不允許行尾空白 | https://palantir.github.io/tslint/rules/no-trailing-whitespace/ |
| variable-name | - 不允許使用typescript原生變數名稱<br>- 變數要是小駝峰式命名 ex: `let testVariable = 0;`<br>- const常數要是大寫搭配底線 ex: `const TEST_CONST = 0;` <br>或大駝峰式命名 `const TestConst = 0;` | https://palantir.github.io/tslint/rules/variable-name/ |
| class-name | class名稱必須要是大駝峰式命名 | https://palantir.github.io/tslint/rules/class-name/ |
| quotemark | 強制使用單引號 字串中需要另一種引號則可使用雙引號 | https://palantir.github.io/tslint/rules/quotemark/ |
| semicolon | 行尾必須要有分號 | https://palantir.github.io/tslint/rules/semicolon/ |
| only-arrow-functions | 強制使用arrow-function | https://palantir.github.io/tslint/rules/only-arrow-functions/ |
| triple-equals | 強制使用===取代== | https://palantir.github.io/tslint/rules/triple-equals/ |