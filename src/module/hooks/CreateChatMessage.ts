import Utils from "../Utils"
import Settings from "../Settings"
import SadnessChan from "../SadnessChan";

class CreateChatMessage {
    private static _instance: CreateChatMessage;

    private constructor() {
    }

    public static getInstance(): CreateChatMessage {
        if (!CreateChatMessage._instance) CreateChatMessage._instance = new CreateChatMessage();
        return CreateChatMessage._instance;
    }

    public async createChatMessageHook(chatMessage: any): Promise<void> {
        const user = chatMessage?.user?.data;
        if (!(user && game.user.hasRole(4))) return;

        const result = await this._extractAnalytics(chatMessage?._roll, chatMessage, user);
        if (!result) return;
        return await SadnessChan.whisper(result, user);
    }

    /**
     * Checks if Better 5e Rolls is installed
     */
    private _checkIfBR5eIsInstalled(): boolean {
        return !!game.modules.get('betterrolls5e');
    }

    private _extractUnparsedRollsFromEmbedded (message: any): any {
        const regexRoll = /roll=\"(.*?)\"/g;
        return [...message.matchAll(regexRoll)];
    }

    private _extractUnparsedRollsFromBR5e (message: any): any {
        const dieType = SadnessChan.getDieType();
        const rollsRegExp = new RegExp(`<li.*roll die d${dieType}.*>([0-9]+)<\/li>`, 'g');
        return [...message.matchAll(rollsRegExp)];
    }

    /**
     * Return an array filled with 0
     *
     * @param length - the length of the array
     */
    private _getZeroArray(length: number): Array<number> {
        const zeroArray = new Array<number>(length);
        for (let i = 0; i < length; i++) zeroArray[i] = 0;

        return zeroArray;
    }

    /**
     * Extracts userId and userName from user
     *
     * @param user
     * @return {userId, userName} || null
     */
    private _prepareUserDataForStorage(user: any): any {
        const id = user?._id;
        const name = user?.name;
        return id && name ? {id: id, name: name} : null;
    }

    /**
     * Extracts rolls from the current message and returns an array with them
     *
     * @param _roll - a list of rolls for this message (not available in better5erolls
     * @param chatMessage - chat message data
     * @param user - current user
     * @return array of rolls
     */
    private async _extractAnalytics(_roll: any, chatMessage: any, user: any): Promise<Array<number>> {
        if (_roll) {
            return await this._extractSimpleAnalytics(_roll, user);
        }

        if (game.data.version > '0.6.5') {
            const extractedURIEmbedded = this._extractUnparsedRollsFromEmbedded (chatMessage.data.content);
            if (extractedURIEmbedded && extractedURIEmbedded.length > 0) {
                return await this._parseEmbeddedRolls(extractedURIEmbedded, user);
            }
        }
         
        if (this._checkIfBR5eIsInstalled() && chatMessage?.data?.content) {
            const extractedStringsFromBR5e = this._extractUnparsedRollsFromBR5e (chatMessage?.data?.content)
            if (extractedStringsFromBR5e && extractedStringsFromBR5e.length > 0) {
                return await this._extractBR5eAnalytics(extractedStringsFromBR5e, user);
            }
        }

        return [];
    }

    /**
     * Extracts data from a normal roll
     *
     * @param roll - all the rolls in this message
     * @param user - current user
     * @return an array with all the recent rolls
     */
    private async _extractSimpleAnalytics(roll: any, user: any): Promise<Array<number>> {
        const dice = roll.dice && roll.dice.length !== 0 ? roll.dice : roll._dice;
        if (!(dice?.length > 0)) return;

        const dieType = SadnessChan.getDieType();
        const recentRolls = this._getZeroArray(dieType + 1);

        dice.forEach((die: Die): void => {
            if (die.faces !== dieType) return;
            const results = die.results || die.rolls;
            results.forEach((roll: any): void => {
                const r = roll.result || roll.roll;
                recentRolls[r] += 1;
            });
        });
        await this._updateDiceRolls(recentRolls, this._prepareUserDataForStorage(user));

        Utils.debug('Analytics extracted from simple roll.');
        return recentRolls;
    }

    /**
     * Extracts data from Better 5e Rolls
     *
     * @param rolls - array of unparsed rolls
     * @param user - current user
     * @return an array with all the recent rolls
     */
    private async _extractBR5eAnalytics(rolls: any, user: string): Promise<Array<number>> {
        const dieType = SadnessChan.getDieType();
        if (!(rolls?.length > 0)) return;

        const recentRolls = this._getZeroArray(dieType + 1);
        rolls.forEach((roll: any): void => {
            const value = roll[1];
            if (!value) return;

            recentRolls[value] += 1;
        });
        await this._updateDiceRolls(recentRolls, this._prepareUserDataForStorage(user));

        Utils.debug('Analytics extracted from betterrolls5e.');
        return recentRolls;
    }

    /**
     * Updates the values saved for user rolls.
     *
     * @param recentRolls - an array of how many of each roll
     * @param userData - extracted {userId, userName} from user
     */
    private _updateDiceRolls(recentRolls: Array<number>, userData: any): Promise<void> {
        if (!userData) return;
        const counter = Settings.getCounter();
        const storedUser = counter[userData.id];

        if (storedUser && storedUser.rolls) {
            storedUser.name = userData.name;

            const storedUserRolls = storedUser.rolls;
            recentRolls.forEach((roll: number, index: number): void => {
                if (index === 0) return;
                storedUserRolls[index] = storedUserRolls[index] ? storedUserRolls[index] + roll : roll;
            });
        } else {
            // First time setup, when user has no data
            counter[userData.id] = {
                rolls: [...recentRolls],
                ...userData,
            }
        }
        return Settings.setCounter(counter);
    }

    /**
     * Parses embedded rolls to make them JSONs
     * 
     * @param matches - URI component
     * @param user - author of the message
     */
    private async _parseEmbeddedRolls (matches: any, user: any): Promise<Array<number>> {
        const dieType = SadnessChan.getDieType();
        if (!(matches && matches.length > 0)) return [];

        let allRecentRolls = this._getZeroArray(dieType + 1);
        matches.forEach((element:any) => {
            try {
                const parsedEmbedded = JSON.parse(decodeURIComponent(element[1]));
                const recentRolls = this._extractEmbeddedRolls(parsedEmbedded, user);
                recentRolls.forEach((element: any, index: number) => {
                    allRecentRolls[index] = element;
                })
            } catch (error) {
                return []
            }
        });
        
        await this._updateDiceRolls(allRecentRolls, this._prepareUserDataForStorage(user));
        return allRecentRolls;
    }

    /**
     * Extracts rolls from the embedded JSON structure
     * 
     * @param messageJSON - parsed message
     * @param user - owner of the message
     */
    private _extractEmbeddedRolls (messageJSON: any, user: any): Array<number> {
        const terms = messageJSON.terms;
        const dieType = SadnessChan.getDieType();
        const recentRolls = this._getZeroArray(dieType + 1);
        if (!terms) return;
        
        terms.forEach((term: any) => {
            if (term === '+' || term.faces !== dieType) return;

            term.results.forEach((element: any) => recentRolls[element.result] += 1);
        });

        Utils.debug('Analytics extracted from embedded rolls.');
        return recentRolls;
    }
}

export default CreateChatMessage.getInstance();