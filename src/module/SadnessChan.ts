import Utils from "./Utils";
import portraitsList from "./lists/portraitsList";
import crtFailCommentsList from "./lists/crtFailCommentsList";
import crtSuccessCommentsList from "./lists/crtSuccessCommentsList";
import Settings from "./Settings";
import settingNames from "./lists/settingNamesList";

class SadnessChan {
    private static _instance: SadnessChan;
    private _portraits: string[] = portraitsList;
    private readonly _minPlayerWhisperChance = 0;
    private readonly _maxPlayerWhisperChance = 1;
    private readonly _minDieType = 2;
    private readonly _maxDieType = 1000;

    private constructor() {
    }

    public static getInstance(): SadnessChan {
        if (!SadnessChan._instance) SadnessChan._instance = new SadnessChan();
        return SadnessChan._instance;
    }

    /**
     * Selects a random portrait from portraitsList.ts
     */
    private _getRandomPortrait(cssClass: string): string {
        const portrait = Utils.getRandomItemFromList(this._portraits);
        if (!portrait) return '';

        return`
            <img
                src="${portrait}"
                alt="${Utils.moduleName}-portrait"
                class="${cssClass}__portrait"
            />
        `;
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
                    ${this._getRandomPortrait(chatHeaderClass)}
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
        const failNumber = this._getCrtValue(false);
        const successNumber = this._getCrtValue(true);
        
        let message = `
            <h2 class="${statsBodyClass}__username">${userData.name}</h2>
        `;

        const rolls = userData.rolls;
        if (rolls) {
            const critFail = rolls[failNumber];
            const critSucces = rolls[successNumber];
            const rollsClass = `${statsBodyClass}__rolls`;
            const rollClass = `${rollsClass}-roll`;

            message += `
                <ol class="${rollsClass}">
                    <li class="${rollClass}">
                        <span class="${rollClass}-dice min">${failNumber}</span>    
                        <span class="${rollClass}-count">${critFail}</span>    
                    </li>
                    <li class="${rollClass}">
                        <span class="${rollClass}-dice max">${successNumber}</span>    
                        <span class="${rollClass}-count">${critSucces}</span>
                    </li>
                </ol>
            `;
        }

        return message;
    }
    /**
     * Returns the chance for a whisper to be sent
     * 
     * @param isCrtSuccess 
     */
    private _getWhisperChance (isCrtSuccess: boolean): number{
        const setting = isCrtSuccess ? settingNames.SUCCESS_CHANCE : settingNames.FAIL_CHANCE;
        const chance = Settings.getSetting(setting);
        if (chance < this._minPlayerWhisperChance) {
            this._resetValueInSettings(setting, this._minPlayerWhisperChance)
            return this._minPlayerWhisperChance;
        }
        if (chance > this._maxPlayerWhisperChance) {
            this._resetValueInSettings(setting, this._maxPlayerWhisperChance)
            return this._maxPlayerWhisperChance;
        }
        return chance;
    }

    /**
     * Decieds if the whisper should be sent to the user
     *
     * @param rolls - array of rolls made by the user
     * @param fail
     * @param success
     * @param dieType
     */
    private _shouldIWhisper(rolls: Array<number>, dieType: number, success: number, fail: number): boolean {
        const playerWhisperChance = this._getWhisperChance(rolls[success] > rolls[fail])
        if (!(Math.random() < playerWhisperChance && rolls?.length)) return false;
        return !!(rolls[fail] || rolls[success]);
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
                whisper: [target],
                speaker: {
                    alias: `${Utils.moduleTitle}`,
                },
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

    private _selectCrtFailComments(user: any): string {
        const message = Utils.getRandomItemFromList(crtFailCommentsList);
        return this._updateDynamicMessages(message, user);
    }

    private _selectCrtSuccessComments(user: any): string {
        const message = Utils.getRandomItemFromList(crtSuccessCommentsList);
        return this._updateDynamicMessages(message, user);
    }

    // TODO Marian: comments
    private _resetValueInSettings(key: string, value: any): void {
        Settings.setSetting(key, value);
    }

    /**
     * Returns the value that is considered a crit fail or success
     * 
     * @param isCrtSuccess - true if you want to get the crit success value, false if you want to get crit fail value
     */
    private _getCrtValue(isCrtSuccess: boolean): number {
        const crtValue = Settings.getSetting(isCrtSuccess ? settingNames.CRT_SUCCESS : settingNames.CRT_FAIL);
        const dieType = this.getDieType();
        if (isCrtSuccess && crtValue > dieType) {
            this._resetValueInSettings(settingNames.CRT_SUCCESS, dieType);
            return dieType;
        }
        if (!isCrtSuccess && crtValue < 1) {
            this._resetValueInSettings(settingNames.CRT_SUCCESS, 1);
            return 1;
        }
        return crtValue;
    }

    /**
     * Returns number of faces of the die based on user settings
     * The number of faces must be between 2 and 1000
     */
    public getDieType(): number{
        const dieType = Settings.getSetting(settingNames.DIE_TYPE);

        if (dieType < this._minDieType) {
            this._resetValueInSettings(settingNames.DIE_TYPE, this._minDieType);
            return this._minDieType;
        }
        if (dieType > this._maxDieType) {
            this._resetValueInSettings(settingNames.DIE_TYPE, this._maxDieType);
            return this._maxDieType;
        }
        return dieType;
    }

    /**
     * Returns the command for getting the statistics. It is made from the symbom and the name of the command 
     */
    public buildStatsCmd(): string {
        const symbol = Settings.getSetting(settingNames.CMD_SYMBOL);
        const statsCmd = Settings.getSetting(settingNames.STATS_CMD);
        return symbol + statsCmd;
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
                    ${this._getRandomPortrait(statsHeaderClass)}
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
        const dieType = this.getDieType();
        const successNumber = this._getCrtValue(true);
        const failNumber = this._getCrtValue(false);

        if (!this._shouldIWhisper(rolls, dieType, successNumber, failNumber)) return;
        const content = rolls[failNumber] > rolls[successNumber] ? this._selectCrtFailComments(user) : this._selectCrtSuccessComments(user);

        Utils.debug(`Whisper sent to ${user.name}`);
        return this._createWhisperMessage(user._id, content);
    }
}

export default SadnessChan.getInstance();