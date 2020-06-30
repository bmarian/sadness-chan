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
    //DO TO: change function name
    private async _updateNumberOfOnes(recentRolls: number[], userData: any): Promise<void> {
        if (!userData) return;
        const counter = settings.getSetting(this._counterKey);
        const user = counter[userData.id];
        if (user) {
            for (let i=1; i< 21; i++){
                if (user.rolls[i]){
                    user.rolls[i] = user.rolls[i] + recentRolls[i];
                }
                else {
                    user.rolls[i] = recentRolls[i];
                }
                
            }
            user.name = userData.name;
        } else {
            const rolls:number[] = new Array(21); 
            counter[userData.id] = {
                rolls,
                ...userData,
            }
        }
        utils.debug(counter);
        return settings.setSetting(this._counterKey, counter);
    }

    public async extractSimpleAnalytics(roll: any, user: any): Promise<void> {
        const dice = roll._dice;
        if (!dice) return;
        console.log(dice[0].faces);
        const recentRolls:number[] = [];
        if (dice[0].faces === 20){
            for (let key in dice[0].rolls){
                if (recentRolls[dice[0].rolls[key].roll] >= 0){
                    recentRolls[dice[0].rolls[key].roll]++;
                }
                else{
                    recentRolls[dice[0].rolls[key].roll] = 1;
                }
                console.log(recentRolls[dice[0].rolls[key].roll]);
            }
        }

        return this._updateNumberOfOnes(recentRolls, this._extractUserData(user));
    }

    public async extractBetter5eRollsAnalytics(chatMessage: any, user: string): Promise<void> {
        const dieRegex = /<li.*roll die d20.*>(1)<\/li>/g;
        const oneMatches = chatMessage.match(dieRegex);
        const numberOfOnes = oneMatches ? oneMatches.length : 0;
        const recentRolls: number[] = [];

        if (numberOfOnes > 0) return this._updateNumberOfOnes(recentRolls, this._extractUserData(user));
    }

}

export default RenderChatMessage.getInstance();