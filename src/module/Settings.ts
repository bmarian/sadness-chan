import utils from "./Utils";
import settingsList from "./lists/settingsList";
import settingNames from "./lists/settingEnum";
import ListsEditor from "./apps/ListsEditor";

import defaultCrtFailCom from "./lists/defaultCrtFailCom";
import defaultCrtSuccessCom from "./lists/defaultCrtSuccessCom";
import defaultValues from "./lists/defaultsEnum"

class Settings {
    private static _instance: Settings;
    private readonly _settingsList = settingsList;

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
        game.settings.registerMenu(utils.moduleName, settingNames.LISTS_EDITOR, {
            name: "Custom Comments Menu",
            label: "Open comments editor",
            icon: "fas fa-edit",
            type: ListsEditor,
            restricted: true,
        });
    }

    private _registerLists(): void {
        const defaultList = JSON.stringify({
            'fail': [...defaultCrtFailCom],
            'success': [...defaultCrtSuccessCom],
            'portraits': [],
        });
        this._registerSetting(settingNames.LISTS, {
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

    public resetSettings() {
        for (const item in defaultValues) {
            this.setSetting(settingNames[item], defaultValues[item]);
        }
    }

    public resetCounter(): Promise<any> {
        return this.setCounter({});
    }

    public registerSettings(): void {
        this._registerLists();
        this._registerMenus();
        this._settingsList.forEach((setting: any): void => {
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
        return this._setSetting(settingNames.COUNTER, counterData);
    }

    public getCounter(): any {
        const setting = this.getSetting(settingNames.COUNTER);
        try {
            return JSON.parse(setting);
        } catch (error) {
            return {};
        }
    }

    public setLists(listsData: any): Promise<any> {
        return this._setSetting(settingNames.LISTS, listsData);
    }

    public getLists(): any {
        const setting = this.getSetting(settingNames.LISTS);
        try {
            return JSON.parse(setting);
        } catch (error) {
            return {};
        }
    }

}

export default Settings.getInstance();