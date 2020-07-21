import utils from "./Utils";
import settingsList from "./lists/settingsList";

class Settings {
    private static _instance: Settings;
    private readonly _settingsList = settingsList;
    private readonly _counterKey: string = 'counter';
    private readonly _commandHeaderKey: string = 'commandHeader';
    private readonly _commandKey: string = 'commandKey';

    private constructor() {
    }

    public static getInstance(): Settings {
        if (!Settings._instance) Settings._instance = new Settings();
        return Settings._instance;
    }

    private _registerSetting(key: string, data: any): void {
        game.settings.register(utils.moduleName, key, data);
    }

    public getCommand(): string {
        if (!game?.settings?.get) return '!sadness';
        const header = game.settings.get(utils.moduleName, this._commandHeaderKey);
        const body = game.settings.get(utils.moduleName, this._commandKey);;

        return header + body;
    }

    private _getSetting(key: string): any {
        const setting = game.settings.get(utils.moduleName, key);
        try {
            return JSON.parse(setting);
        } catch (error) {
            return {};
        }
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

    public getCounter(): any {
        return this._getSetting(this._counterKey);
    }

    public setCounter(counterData: any): Promise<any> {
        return this._setSetting(this._counterKey, counterData);
    }

    public resetStorage(): Promise<any> {
        return this.setCounter({});
    }

}

export default Settings.getInstance();