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

    public preCreateChatMessageHook(message: any, options: any): void {
        const content = message?.content;
        const user = message?.user;
        const counter = Settings.getCounter();
        if (!(user && content && content === Settings.getCommand() && counter && counter[user])) return;

        this._modifyMessage(message, options, counter[user], user);
        Utils.debug('Sad stats displayed.');
    }

    private _modifyMessage(message: any, options: any, userData: any, userId: string): void {
        message.content = SadnessChan.getStatsMessage(userData);
        message.whisper = [userId];
        options.chatBubble = false;
    }
}

export default PreCreateChatMessage.getInstance();