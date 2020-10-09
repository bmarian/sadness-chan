import Utils from "./Utils";
import Settings from "./Settings";
import settingDefaults from "./lists/settingsDefaults";

class SadnessChan {
    private static _instance: SadnessChan;
    private readonly _minPlayerWhisperChance = 0;
    private readonly _maxPlayerWhisperChance = 1;
    private readonly _minDieType = 2;
    private readonly _maxDieType = 1000;
    private readonly _minCrtValue = 1;
    private readonly _settingKeys = settingDefaults.SETTING_KEYS;

    private constructor() {
    }

    public static getInstance(): SadnessChan {
        if (!SadnessChan._instance) SadnessChan._instance = new SadnessChan();
        return SadnessChan._instance;
    }

    /**
     * Selects a random portrait from portraitsList.ts
     */
    private _getRandomPortrait(cssClass: string, isSuccess: boolean = true): string {
        const {fail_portraits, portraits} = Settings.getLists();
        const portrait = Utils.getRandomItemFromList(isSuccess ? portraits : fail_portraits);
        const noBorder = Settings.getSetting(this._settingKeys.IMAGE_BORDER) ? '' : 'no-border';
        if (!portrait) return '';

        return `
            <img
                src="${portrait}"
                alt="${Utils.moduleName}-portrait"
                class="${cssClass}__portrait ${noBorder}"
            />
        `;
    }

    /**
     * Creates the display message
     *
     * @param content - the selected message
     * @param isSuccess - if this message is for a crit success or fail
     */
    private _sadnessMessage(content: string, isSuccess: boolean = true): string {
        const chatMessageClass = `${Utils.moduleName}-chat-message`;
        const chatHeaderClass = `${chatMessageClass}-header`;
        const chatBodyClass = `${chatMessageClass}-body`

        return `
            <div class="${chatMessageClass}">
                <div class="${chatHeaderClass}">
                    ${this._getRandomPortrait(chatHeaderClass, isSuccess)}
                    <h3 class="${chatHeaderClass}__name">
                        ${Settings.getSetting(this._settingKeys.SADNESS_TITLE)}
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
            const crtFail = rolls[failNumber];
            const averageNumber = this._getAverage(rolls);
            const crtSuccess = rolls[successNumber];
            const rollsClass = `${statsBodyClass}__rolls`;
            const rollClass = `${rollsClass}-roll`;
            const averageRollDie = () => {
                if (!Settings.getSetting(this._settingKeys.AVERAGE_TOGGLE)) return '';

                return `<li class="${rollClass}">
                    <span class="${rollClass}-dice avg"><span>${averageNumber}</span></span>    
                    <span class="${rollClass}-count">avg</span>    
                </li>`
            };

            message += `
                <ol class="${rollsClass}">
                    <li class="${rollClass}">
                        <span class="${rollClass}-dice min">${failNumber}</span>    
                        <span class="${rollClass}-count">${crtFail}</span>    
                    </li>    
                    ${averageRollDie()}
                    <li class="${rollClass}">
                        <span class="${rollClass}-dice max">${successNumber}</span>    
                        <span class="${rollClass}-count">${crtSuccess}</span>
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
    private _getWhisperChance(isCrtSuccess: boolean): number {
        const setting = isCrtSuccess ? this._settingKeys.SUCCESS_CHANCE : this._settingKeys.FAIL_CHANCE;
        const chance = Settings.getSetting(setting);
        if (chance < this._minPlayerWhisperChance) {
            this._resetValueInSettings(setting, this._minPlayerWhisperChance);
            return this._minPlayerWhisperChance;
        }
        if (chance > this._maxPlayerWhisperChance) {
            this._resetValueInSettings(setting, this._maxPlayerWhisperChance);
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
     * @param origin - who should receive the message
     * @param content - content of the message
     * @param isSuccess - if this message is for a crit success or fail
     */
    private async _createWhisperMessage(origin: string, content: string, isSuccess: boolean = true): Promise<any> {
        const isPublic = Settings.getSetting(settingDefaults.SETTING_KEYS.COMMENT_MESSAGE_VISIBILITY);

        return ChatMessage.create({
                user: origin,
                content: this._sadnessMessage(content, isSuccess),
                whisper: isPublic ? [] : [origin],
                speaker: {
                    alias: ' ',
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
        const scInstance = this;

        let messageOutput = message.replace(/\[sc-d([0-9]{1,4})\]/, (_0: string, value: string): string => {
            return userStructure.rolls[value];
        });

        messageOutput = messageOutput.replace(/\[sc-name\]/, (): string => {
            return user.name;
        });

        messageOutput = messageOutput.replace(/\[sc-avg\]/, (): string => {
            return String(Math.ceil(scInstance._getAverage(userStructure.rolls)));
        });

        return messageOutput;
    }

    private _selectCrtFailComments(user: any): string {
        const {fail} = Settings.getLists();
        const message = Utils.getRandomItemFromList(fail);
        return this._updateDynamicMessages(message, user);
    }

    private _selectCrtSuccessComments(user: any): string {
        const {success} = Settings.getLists();
        const message = Utils.getRandomItemFromList(success);
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
        const crtValue = Settings.getSetting(isCrtSuccess ? this._settingKeys.CRT_SUCCESS : this._settingKeys.CRT_FAIL);
        const dieType = this.getDieType();
        if (isCrtSuccess && crtValue > dieType) {
            this._resetValueInSettings(this._settingKeys.CRT_SUCCESS, dieType);
            return dieType;
        }
        if (!isCrtSuccess && crtValue < this._minCrtValue) {
            this._resetValueInSettings(this._settingKeys.CRT_SUCCESS, this._minCrtValue);
            return this._minCrtValue;
        }
        return crtValue;
    }

    /**
     * Returns the average of all the rolls made by a user
     *
     * @private
     */
    private _getAverage(rolls: Array<number>): number {
        let rollsTotal = 0;
        let numberOfRolls = 0;
        for (let i = 0; i < rolls.length; i++) {
            rollsTotal += i * rolls[i];
            numberOfRolls += rolls[i];
        }
        return Utils.roundUp(rollsTotal / numberOfRolls) || 0;
    }

    /**
     * Returns number of faces of the die based on user settings
     * The number of faces must be between 2 and 1000
     */
    public getDieType(): number {
        const dieType = Settings.getSetting(this._settingKeys.DIE_TYPE);

        if (dieType < this._minDieType) {
            this._resetValueInSettings(this._settingKeys.DIE_TYPE, this._minDieType);
            return this._minDieType;
        }
        if (dieType > this._maxDieType) {
            this._resetValueInSettings(this._settingKeys.DIE_TYPE, this._maxDieType);
            return this._maxDieType;
        }
        return dieType;
    }

    /**
     * Returns the root command (!sadness)
     */
    public getCmd(): string {
        return Settings.getSetting(this._settingKeys.STATS_CMD);
    }

    /**
     * Creates the stats message
     *
     * @param userData - current user
     * @param displayPortrait -
     */
    public getStatsMessage(userData: any, displayPortrait: boolean = true): string {
        const statsClass = `${Utils.moduleName}-chat-stats`;
        const statsHeaderClass = `${statsClass}-header`;
        const statsBodyClass = `${statsClass}-body`;

        const portraitHTML = ()=> {
            if (!displayPortrait) return '';

            return `<div class="${statsHeaderClass}">
                        ${this._getRandomPortrait(statsHeaderClass)}
                        <h3 class="${statsHeaderClass}__name">
                            ${Settings.getSetting(this._settingKeys.SADNESS_TITLE)}
                        </h3>
                    </div>`;
        }

        return `
            <div class="${statsClass}">
                ${portraitHTML()}
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
        const isSuccess = rolls[failNumber] > rolls[successNumber];
        const content = isSuccess ? this._selectCrtFailComments(user) : this._selectCrtSuccessComments(user);

        Utils.debug(`Whisper sent to ${user.name}`);
        return this._createWhisperMessage(user._id, content, isSuccess);
    }

    public generateMessageStructure(content: string): string {
        return this._sadnessMessage(content);
    }
}

export default SadnessChan.getInstance();