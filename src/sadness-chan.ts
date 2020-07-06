import utils from "./module/Utils"
import settings from "./module/Settings"
import renderChatMessageHook from "./module/hooks/RenderChatMessage"

Hooks.once('init', async ():Promise<void> => {
    settings.registerSettings();
    utils.debug('Preparing to collect tears.');
});

Hooks.on('preCreateChatMessage', (message: any): void => {
    let content = message?.content;
    if (content && content === '/sadness') {
        const counter: any = settings.getSetting('counter');
        if (!counter) return;

        message.content = '<ol>';

        for (const key in counter) {
            const userData = counter[key];
            message.content += `<li><span>${userData.name}</span>: <br>`;
            for (let i=1; i<=20;i++){
                message.content += `<span>[${i}]: </span><span>${userData.rolls[i]}</span> <br>`;
            }
            message.content += `<span>Total number of rolls: </span>`
            message.content += `<span>${renderChatMessageHook.calculateNumberOfRolls(userData.rolls)}</span>`
            message.content += '</li>';
        }
        message.content += '</ol>';
    }
});

Hooks.on('createChatMessage', async (chatMessage: any): Promise<void> => {
    const user = chatMessage?.user?.data;
    if (!user) return;
    if(!game?.user?.hasRole(4)) return;

    const _roll = chatMessage?._roll;
    if (_roll) {
        await renderChatMessageHook.extractSimpleAnalytics(_roll, user);
    } else if (renderChatMessageHook.checkIfBetter5eRollsIsInstalled() && chatMessage?.data?.content) {
        await renderChatMessageHook.extractBetter5eRollsAnalytics(chatMessage.data.content, user);
    }
});
