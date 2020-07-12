import CreateChatMessage from "./module/hooks/CreateChatMessage"
import PreCreateChatMessage from "./module/hooks/PreCreateChatMessage";
import Init from "./module/hooks/Init";

Hooks.once('init', Init.initHook);

Hooks.on('preCreateChatMessage', PreCreateChatMessage.preCreateChatMessageHook);

Hooks.on('createChatMessage', async (chatMessage: any): Promise<void> => {
    const user = chatMessage?.user?.data;
    if (!user) return;
    if (!game?.user?.hasRole(4)) return;

    const result = await CreateChatMessage.extractAnalytics(chatMessage?._roll, chatMessage, user);
    await CreateChatMessage.shouldIWhisper(result, user);
});
