import Settings from "../Settings";
import SadnessChan from "../SadnessChan";
import Utils from "../Utils";

class PreCreateChatMessage {
    private static _instance: PreCreateChatMessage;

    private constructor() {
    }

    public static getInstance(): PreCreateChatMessage {
        if (!PreCreateChatMessage._instance) PreCreateChatMessage._instance = new PreCreateChatMessage();
        return PreCreateChatMessage._instance;
    }

    private _executeResetCmd(args: string) {
        if (!game.user.hasRole(4)) {
            return Utils.notifyUser("error", "You don't have permissions to execute this command.")
        }

        switch (args) {
            case "settings":
                Settings.resetAllSettings();
                Utils.notifyUser("info", "Settings have been reset.");
                break;
            case "counter":
                Settings.resetCounter();
                Utils.notifyUser("info", "Dice rolls history has been reset.");
                break;
            case "lists":
                Settings.resetLists();
                Utils.notifyUser("info", "Settings have been reset.");
                break;
            default:
                Utils.notifyUser("error", "Invalid arguments.");
                break;
        }
    }

    private _prepareMessage(message: any, options: any, userId: string): void {
        message.whisper = [userId];
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

    public executeCommand(args: string) {
        const resetCommand = 'reset';
        if (args.startsWith(resetCommand)) {
            return this._executeResetCmd(args.replace(resetCommand + ' ', ''));
        }
    }

    public preCreateChatMessageHook(message: any, options: any): void {
        const content = message?.content;
        const user = message?.user;
        const command = SadnessChan.getCmd();
        if (!(user && content && content.startsWith(command))) return;

        if (content === command) return this._executeStatsCmd(message, options, user);

        this.executeCommand(content.replace(command + ' ', ''));
    }
}

export default PreCreateChatMessage.getInstance();