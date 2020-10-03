import utils from "./Utils";
import ListsEditor from "./apps/ListsEditor";
import listDefaults from "./lists/listDefaults";
import settingDefaults from "./lists/settingsDefaults";

class Settings {
    private static _instance: Settings;

    private constructor() {
    }

    public static getInstance(): Settings {
        if (!Settings._instance) Settings._instance = new Settings();
        return Settings._instance;
    }

    private _registerSetting(key: string, data: any): void {
        game.settings.register(utils.moduleName, key, data);
    }

    private _registerMenus(): void {
        // @ts-ignore
        game.settings.registerMenu(utils.moduleName, settingDefaults.SETTING_KEYS.LISTS_EDITOR, {
            name: "Lists editor:",
            label: "Open list editor",
            icon: "fas fa-edit",
            type: ListsEditor,
            restricted: true,
        });
    }

    private _registerLists(): void {
        const defaultList = JSON.stringify({
            'fail': [...listDefaults.DEFAULT_CRIT_FAIL_COMMENTS],
            'success': [...listDefaults.DEFAULT_CRIT_SUCCESS_COMMENTS],
            'fail_portraits': [...listDefaults.DEFAULT_CRIT_FAIL_PORTRAITS],
            'portraits': [...listDefaults.DEFAULT_CRIT_SUCCESS_PORTRAITS]
        });
        this._registerSetting(settingDefaults.SETTING_KEYS.LISTS, {
            type: String,
            default: defaultList,
            scope: "world",
            config: false,
            restricted: true,
        });
    }

    private _getSetting(key: string): any {
        return game.settings.get(utils.moduleName, key);
    }

    private _setSetting(key: string, data: any): Promise<any> {
        return game.settings.set(utils.moduleName, key, JSON.stringify(data));
    }

    public resetLists(): Promise<any> {
        const defaultList = JSON.stringify({
            'fail': [...listDefaults.DEFAULT_CRIT_FAIL_COMMENTS],
            'success': [...listDefaults.DEFAULT_CRIT_SUCCESS_COMMENTS],
            'fail_portraits': [...listDefaults.DEFAULT_CRIT_FAIL_PORTRAITS],
            'portraits': [...listDefaults.DEFAULT_CRIT_SUCCESS_PORTRAITS]
        });

        return this.setSetting(settingDefaults.SETTING_KEYS.LISTS, defaultList);
    }

    public resetAllSettings() {
        for (const item in settingDefaults.SETTING_DEFAULTS) {
            const settings = this.setSetting(settingDefaults.SETTING_KEYS[item], settingDefaults.SETTING_DEFAULTS[item]);
        }
    }

    public resetCounter(): Promise<any> {
        return this.setCounter({});
    }

    public registerSettings(): void {
        this._registerLists();
        this._registerMenus();
        settingDefaults.SETTINGS.forEach((setting: any): void => {
            this._registerSetting(setting.key, setting.data);
        });

        utils.debug('Settings registered', false);
    }

    public getSetting(key: string): any {
        return this._getSetting(key);
    }

    public setSetting(key: string, data: any): Promise<any> {
        return game.settings.set(utils.moduleName, key, data);
    }

    public setCounter(counterData: any): Promise<any> {
        return this._setSetting(settingDefaults.SETTING_KEYS.COUNTER, counterData);
    }

    public getCounter(): any {
        const setting = this.getSetting(settingDefaults.SETTING_KEYS.COUNTER);
        try {
            return JSON.parse(setting);
        } catch (error) {
            return {};
        }
    }

    public setLists(listsData: any): Promise<any> {
        return this._setSetting(settingDefaults.SETTING_KEYS.LISTS, listsData);
    }

    public getLists(): any {
        const setting = this.getSetting(settingDefaults.SETTING_KEYS.LISTS);
        try {
            return JSON.parse(setting);
        } catch (error) {
            return {};
        }
    }

    public getPermissionLevel (): number {
        return this.getSetting(settingDefaults.SETTING_KEYS.RESET_LEVEL) ;
    }

    public resetUserCounter (userID) {
        const counter = this.getCounter();
        counter[userID]?.rolls?.fill(0);
        this.setCounter(counter);
    }
}

export default Settings.getInstance();