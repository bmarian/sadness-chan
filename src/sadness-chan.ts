import CreateChatMessage from "./module/hooks/CreateChatMessage"
import PreCreateChatMessage from "./module/hooks/PreCreateChatMessage";
import Init from "./module/hooks/Init";

Hooks.once('init', Init.initHook);

Hooks.on('preCreateChatMessage', PreCreateChatMessage.preCreateChatMessageHook);

Hooks.on('createChatMessage', CreateChatMessage.createChatMessageHook);
