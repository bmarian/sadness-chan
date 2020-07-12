import createChatMessageHook from "./CreateChatMessage";
import Settings from "../Settings";

class PreCreateChatMessage {
    private static _instance: PreCreateChatMessage;

    private constructor() {
    }

    public static getInstance(): PreCreateChatMessage {
        if (!PreCreateChatMessage._instance) PreCreateChatMessage._instance = new PreCreateChatMessage();
        return PreCreateChatMessage._instance;
    }

    public preCreateChatMessageHook(message: any, options: any): void {
        let content = message?.content;
        const user = message?.user;
        if (!(user && content && content === '!sadness')) return;

        const counter = Settings.getSetting('counter');
        if (!counter) return;

        const userData = counter[user];
        if (!userData) return;

        message.content = createChatMessageHook.getStats(userData);
        message.whisper = [user];
        options.chatBubble = false;
    }
}

export default PreCreateChatMessage.getInstance();