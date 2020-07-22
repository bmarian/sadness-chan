import utils from "./Utils";
import settingsList from "./lists/settingsList";
import settingNames from "./lists/settingNamesList";

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

    private _getSetting (key: string): any{
        return game.settings.get(utils.moduleName, key);
    }

    private _setSetting(key: string, data: any): Promise<any> {
        return game.settings.set(utils.moduleName, key, JSON.stringify(data));
    }

    public registerSettings(): void {
        this._settingsList.forEach((setting: any): void => {
            this._registerSetting(setting.key, setting.data);
        });

        utils.debug('Settings registered', false);
    }

    public getSetting(key: string): any {
        return this._getSetting(key);
    }

    public resetCounter(): Promise<any> {
        return this.setCounter({});
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

}

export default Settings.getInstance();