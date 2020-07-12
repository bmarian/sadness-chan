import Utils from "./Utils";
import portraitsList from "./lists/portraitsList";
import nat1CommentsList from "./lists/nat1CommentsList";
import nat20CommentsList from "./lists/nat20CommentsList";
import Settings from "./Settings";

class SadnessChan {
    private static _instance: SadnessChan;
    private _portraits: string[] = portraitsList;
    private readonly _playerWhisperChance = 0.5;

    private constructor() {
    }

    public static getInstance(): SadnessChan {
        if (!SadnessChan._instance) SadnessChan._instance = new SadnessChan();
        return SadnessChan._instance;
    }

    /**
     * Selects a random portrait from portraitsList.ts
     */
    private _getRandomPortrait(): string {
        return Utils.getRandomItemFromList(this._portraits);
    }

    /**
     * Creates the display message
     * 
     * @param content - the selected message 
     */
    private _sadnessMessage(content: string): string {
        const chatMessageClass = `${Utils.moduleName}-chat-message`;
        const chatHeaderClass = `${chatMessageClass}-header`;
        const chatBodyClass = `${chatMessageClass}-body`

        return `
            <div class="${chatMessageClass}">
                <div class="${chatHeaderClass}">
                    <img
                        src="${this._getRandomPortrait()}"
                        alt="${Utils.moduleName}-portrait"
                        class="${chatHeaderClass}__portrait"
                    />
                    <h3 class="${chatHeaderClass}__name">
                        ${Utils.moduleTitle}
                    </h3>
                </div>
                <div class="${chatBodyClass}">
                    ${content}
                </div>
            </div>
        `;
    }

    /**
     * Creates body of the message for !sadness command
     * 
     * @param userData - current user
     * @param statsBodyClass - css class for the body
     */
    private _getStatsMessageBody(userData: any, statsBodyClass: string): string {
        let message = `
            <h2 class="${statsBodyClass}__username">${userData.name}</h2>
        `;

        const rolls = userData.rolls;
        if (rolls) {
            const nat1 = rolls[1];
            const nat20 = rolls[20];
            const rollsClass = `${statsBodyClass}__rolls`;
            const rollClass = `${rollsClass}-roll`;

            message += `
                <ol class="${rollsClass}">
                    <li class="${rollClass}">
                        <span class="${rollClass}-dice min">1</span>    
                        <span class="${rollClass}-count">${nat1}</span>    
                    </li>
                    <li class="${rollClass}">
                        <span class="${rollClass}-dice max">20</span>    
                        <span class="${rollClass}-count">${nat20}</span>
                    </li>
                </ol>
            `;
        }

        return message;
    }

    /**
     * Decieds if the whisper should be sent to the user
     * 
     * @param rolls - array of rolls made by the user
     */
    private _shouldIWhisper(rolls: Array<number>): boolean {
        if (!(Math.random() < this._playerWhisperChance && rolls && rolls?.length)) return false;
        return !!(rolls[1] || rolls[20]);
    }

    /**
     * Creates and sends the whisper message
     * 
     * @param target - who should receive the message
     * @param content - content of the message
     */
    private async _createWhisperMessage(target: string, content: string): Promise<any> {
        return ChatMessage.create({
                user: target,
                content: this._sadnessMessage(content),
                whisper: [target]
            },
            {
                chatBubble: false,
            });
    }

    /**
     * Updates messages that contain [sc-] tags
     * 
     * @param message - the message that should have tags replaced
     * @param user - current user 
     */
    private _updateDynamicMessages(message: string, user: any): string {
        const counter = Settings.getCounter();
        const userStructure = counter[user._id];

        let messageOutput = message.replace(/\[sc-d([0-9]{1,2})\]/, (_0: string, value: string): string => {
            return userStructure.rolls[value];
        });

        messageOutput = messageOutput.replace(/\[sc-name\]/, (): string => {
            return user.name;
        });

        return messageOutput;
    }

    private _selectNat1Comments(user: any): string {
        const message = Utils.getRandomItemFromList(nat1CommentsList);
        return this._updateDynamicMessages(message, user);
    }

    private _selectNat20Comments(user: any): string {
        const message = Utils.getRandomItemFromList(nat20CommentsList);
        return this._updateDynamicMessages(message, user);
    }

    /**
     * Creates the stats message
     * 
     * @param userData - current user
     */
    public getStatsMessage(userData: any): string {
        const statsClass = `${Utils.moduleName}-chat-stats`;
        const statsHeaderClass = `${statsClass}-header`;
        const statsBodyClass = `${statsClass}-body`

        return `
            <div class="${statsClass}">
                <div class="${statsHeaderClass}">
                    <img 
                        src="${this._getRandomPortrait()}" 
                        alt="${Utils.moduleName}-portrait"
                        class="${statsHeaderClass}__portrait"
                    />
                    <h3 class="${statsHeaderClass}__name">
                        ${Utils.moduleTitle}
                    </h3>
                </div>
                <div class="${statsBodyClass}">
                    ${this._getStatsMessageBody(userData, statsBodyClass)}
                </div>
            </div>
        `;
    }

    /**
     * Sends the whisper message
     * 
     * @param rolls - array of rolls made by the user
     * @param user - current user
     */
    public async whisper(rolls: Array<number>, user: any): Promise<any> {
        if (!this._shouldIWhisper(rolls)) return;
        const content = rolls[1] > rolls[20] ? this._selectNat1Comments(user) : this._selectNat20Comments(user);

        Utils.debug(`Whisper sent to ${user.name}`);
        return this._createWhisperMessage(user._id, content);
    }
}

export default SadnessChan.getInstance();