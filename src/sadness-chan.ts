import utils from "./module/Utils"
import settings from "./module/Settings"
import renderChatMessageHook from "./module/hooks/RenderChatMessage"

Hooks.once('init', async (): Promise<void> => {
    settings.registerSettings();
    // settings.setSetting('counter', {}); // RESET BOSS

    utils.debug('Preparing to collect tears.');
});

Hooks.on('preCreateChatMessage', (message: any): void => {
    let content = message?.content;
    if (!(content && content === 'sadness')) return;

    const counter: any = settings.getSetting('counter');
    if (!counter) return;

    for (const key in counter) {
        if (counter.hasOwnProperty(key)) {
            message.content = renderChatMessageHook.getStats(counter[key]);
        }

        // const userRolls = userData.rolls;
        // const numberOfRolls = renderChatMessageHook.calculateNumberOfRolls(userData.rolls);
        //
        // // Header
        // message.content += `<h2>${userData.name}</h2>`;
        //
        // // Roll list
        // message.content += '<ul>';
        // for (let i = 1; i < userRolls.length; i++) {
        //     message.content += `<li><span>[${i}]: </span><span>${userRolls[i]}</span></li>`;
        // }
        // message.content += '</ul>';
        //
        // // Total
        // message.content += `<span>Total number of rolls: ${numberOfRolls}</span><br>`
    }
});

Hooks.on('createChatMessage', async (chatMessage: any): Promise<void> => {
    const user = chatMessage?.user?.data;
    if (!user) return;
    if (!game?.user?.hasRole(4)) return;

    const result = await renderChatMessageHook.extractAnalytics(chatMessage?._roll, chatMessage, user);
    await renderChatMessageHook.shouldIWhisper(result, user);
});
