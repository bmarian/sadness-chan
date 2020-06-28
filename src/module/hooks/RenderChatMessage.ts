import utils from "../Utils"
import settings from "../Settings"

class RenderChatMessage {
    private static _instance: RenderChatMessage;
    private readonly _counterKey: string = 'counter';

    private constructor() {
    }

    public static getInstance(): RenderChatMessage {
        if (!RenderChatMessage._instance) RenderChatMessage._instance = new RenderChatMessage();
        return RenderChatMessage._instance;
    }

    public checkIfBetter5eRollsIsInstalled(): boolean {
        return !!game.modules.get('betterrolls5e');
    }

    private _extractUserData(user: any): any {
        const id = user?._id;
        const name = user?.name;
        return id && name ? {id: id, name: name} : null;
    }

    private async _updateNumberOfOnes(numberOfOnes: number, userData: any): Promise<void> {
        if (!userData) return;
        const counter = JSON.parse(settings.getSetting(this._counterKey));
        const user = counter[userData.id];
        if (user) {
            user.numberOfOnes += numberOfOnes;
            user.name = userData.name;
        } else {
            counter[userData.id] = {
                numberOfOnes,
                ...userData,
            }
        }
        utils.debug(counter);
        return settings.setSetting(this._counterKey, JSON.stringify(counter));
    }

    public async extractSimpleAnalytics(roll: any, user: any): Promise<void> {
        const dice = roll._dice;
        if (!dice) return;
        const numberOfOnes = dice.reduce((numberOfOnes: number, die: Die): number => {
            if (die.faces !== 20) return numberOfOnes;
            return numberOfOnes + die.rolls.reduce((numberOfOnes: number, roll: any): number => {
                return roll.roll === 1 ? numberOfOnes + 1 : numberOfOnes;
            }, 0);
        }, 0)

        if (numberOfOnes > 0) return this._updateNumberOfOnes(numberOfOnes, this._extractUserData(user));
    }

    public async extractBetter5eRollsAnalytics(chatMessage: any, user: string): Promise<void> {
        const dieRegex = /<li.*roll die d20.*>(1)<\/li>/g;
        const oneMatches = chatMessage.match(dieRegex);
        const numberOfOnes = oneMatches ? oneMatches.length : 0;

        if (numberOfOnes > 0) return this._updateNumberOfOnes(numberOfOnes, this._extractUserData(user));
    }

}

export default RenderChatMessage.getInstance();