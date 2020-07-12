import settings from "../Settings";
import utils from "../Utils";

class Init {
    private static _instance: Init;

    private constructor() {
    }

    public static getInstance(): Init {
        if (!Init._instance) Init._instance = new Init();
        return Init._instance;
    }

    public async initHook(): Promise<void> {
        settings.registerSettings();
        utils.debug('Prepared to collect tears.');
    }
}

export default Init.getInstance();