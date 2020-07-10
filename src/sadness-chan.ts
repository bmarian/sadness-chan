import utils from "./module/Utils"
import settings from "./module/Settings"
import renderChatMessageHook from "./module/hooks/RenderChatMessage"

Hooks.once('init', async ():Promise<void> => {
    settings.registerSettings();
    // settings.setSetting('counter', {}); // RESET BOSS

    utils.debug('Preparing to collect tears.');
});

Hooks.on('preCreateChatMessage', (message: any): void => {
    let content = message?.content;
    if (!(content && content === '/sadness')) return;

    const counter: any = settings.getSetting('counter');
    if (!counter) return;

    message.content = '';
    for (const key in counter) {
        const userData = counter[key];
        const userRolls = userData.rolls;
        const numberOfRolls = renderChatMessageHook.calculateNumberOfRolls(userData.rolls);

        // Header
        message.content += `<h2>${userData.name}</h2>`;

        // Roll list
        message.content += '<ul>';
        for (let i = 1; i < userRolls.length; i++) {
            message.content += `<li><span>[${i}]: </span><span>${userRolls[i]}</span></li>`;
        }
        message.content += '</ul>';
        
        // Total
        message.content += `<span>Total number of rolls: ${numberOfRolls}</span><br>`
    }
});

Hooks.on('createChatMessage', async (chatMessage: any): Promise<void> => {
    const user = chatMessage?.user?.data;
    if (!user) return;
    if(!game?.user?.hasRole(4)) return;

    const _roll = chatMessage?._roll;
    if (_roll) {
        await renderChatMessageHook.extractSimpleAnalytics(_roll, user);
        renderChatMessageHook.selectMeanComment();
    } else if (renderChatMessageHook.checkIfBetter5eRollsIsInstalled() && chatMessage?.data?.content) {
        await renderChatMessageHook.extractBetter5eRollsAnalytics(chatMessage.data.content, user);
    }
});
