import Settings from "../Settings";
import SadnessChan from "../SadnessChan";
import Utils from "../Utils";
import settingsDefaults from "../lists/settingsDefaults";

class PreCreateChatMessage {
    private static _instance: PreCreateChatMessage;
    private readonly _errorMessages = settingsDefaults.ERROR_MESSAGES;

    private constructor() {
    }

    public static getInstance(): PreCreateChatMessage {
        if (!PreCreateChatMessage._instance) PreCreateChatMessage._instance = new PreCreateChatMessage();
        return PreCreateChatMessage._instance;
    }

    private _executeResetCmd(args: string) {
        if (!game.user.hasRole(4)) {
            return Utils.notifyUser("error", this._errorMessages.NOT_ENOUGH_PERMISSIONS);
        }

        switch (args) {
            case "settings":
                Settings.resetAllSettings();
                Utils.notifyUser("info", this._errorMessages.SETTINGS_RESET);
                break;
            case "counter":
                Settings.resetCounter();
                Utils.notifyUser("info", this._errorMessages.COUNTER_RESET);
                break;
            case "lists":
                Settings.resetLists();
                Utils.notifyUser("info", this._errorMessages.LISTS_RESET);
                break;
            default:
                Utils.notifyUser("error", this._errorMessages.INVALID_ARGUMENTS);
                break;
        }
    }

    private _prepareMessage(message: any, options: any, userId: string): void {
        const isPublic = Settings.getSetting(settingsDefaults.SETTING_KEYS.STATS_MESSAGE_VISIBILITY);
        
        !isPublic ? message.whisper = [userId] : message.whisper = '';
        message.speaker = {alias: `${Utils.moduleTitle}`};
        options.chatBubble = false;
    }

    private _sendStatsMessage(message: any, options: any, userData: any, userId: string): void {
        message.content = SadnessChan.getStatsMessage(userData);
        this._prepareMessage(message, options, userId);
    }

    private _executeStatsCmd(message: any, options: any, user: any) {
        const counter = Settings.getCounter();

        if (counter && counter[user]) {
            this._sendStatsMessage(message, options, counter[user], user);
            Utils.debug('Sad stats displayed.');
        }
    }

    private _sendAllRollsMessage(message: any, options: any, userId: any) {
        const counter = Settings.getCounter();
        const rolls = counter[userId]?.rolls;
        if (!(counter && rolls)) return;

        message.content = rolls.reduce((result: string, el: number, index: number): string => {
            return !index ? '' : result + `${index} ${el}<br>`;
        }, '');

        this._prepareMessage(message, options, userId);
    }

    public executeCommand(args: string, user: any, message: any, options: any) {
        const resetCommand = 'reset';
        const allCommand = 'all';
        if (args.startsWith(resetCommand)) {
            return this._executeResetCmd(args.replace(resetCommand + ' ', ''));
        }
        if (args.startsWith(allCommand)) {
            return this._sendAllRollsMessage(message, options, user);
        }
    }

    public preCreateChatMessageHook(message: any, options: any): void {
        const content = message?.content;
        const user = message?.user;
        const command = SadnessChan.getCmd();
        if (!(user && content && content.startsWith(command))) return;

        if (content === command) return this._executeStatsCmd(message, options, user);

        return this.executeCommand(content.replace(command + ' ', ''), user, message, options);
    }
}

export default PreCreateChatMessage.getInstance();