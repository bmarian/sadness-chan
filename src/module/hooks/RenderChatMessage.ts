import utils from "../Utils"
import settings from "../Settings"
import meanComments from "../meanComments"
import reallyMeanComments from "../reallyMeanComments"

class RenderChatMessage {
    private static _instance: RenderChatMessage;
    private readonly _counterKey: string = 'counter';
    private static playerWhisperChance = 100; // out of 100

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

    private async _updateDiceRolls(recentRolls: number[], userData: any): Promise<void> {
        if (!userData) return;
        const counter = settings.getSetting(this._counterKey);
        const user = counter[userData.id];

        if (user && user.rolls) {
            for (let i = 1; i <= 20; i++) {
                if (recentRolls[i]) {
                    if (user.rolls[i]) {
                        user.rolls[i] += recentRolls[i];
                    } else {
                        user.rolls[i] = recentRolls[i];
                    }
                }
            }
            user.name = userData.name;
        } else {
            const rolls: number[] = recentRolls; //rolls is initialized with recentRolls to account for a new player's first roll
            // counter data structure holds an array where on position x it is stored the number of times x has been rolled
            counter[userData.id] = {
                rolls,
                ...userData,
            }
        }
        utils.debug(counter);
        return settings.setSetting(this._counterKey, counter);
    }

    // recentRolls holds on position x the number of times x has been rolled 
    public async extractSimpleAnalytics(roll: any, user: any): Promise<number> {
        const dice = roll._dice;
        if (!dice) return;

        const recentRolls = new Array(21).fill(0);
        if (dice[0].faces === 20) {
            const rolls = dice[0]?.rolls;
            for (let key in rolls) {
                const rollValue = rolls[key].roll;
                recentRolls[rollValue] += 1;
            }
        }
        await this._updateDiceRolls(recentRolls, this._extractUserData(user));

        if (recentRolls[1] > 0) return 1;
        if (recentRolls[20] > 0) return 20;
        return 0;
    }

    public async extractBetter5eRollsAnalytics(chatMessage: any, user: string): Promise<number> {
        const dieRegex = /<li.*roll die d20.*>([0-9]+)<\/li>/g;
        const valueRegex = /(\d+)(?!.*\d)/g;
        const matches = chatMessage.match(dieRegex);
        if (!matches) return;

        const recentRolls = new Array(21).fill(0);

        for (let i = 0; i < matches.length; i++) {
            const valueMatch = matches[i].match(valueRegex);
            const rollValue = recentRolls[valueMatch[0]];
            recentRolls[valueMatch[0]] = rollValue ? rollValue + 1 : 1;
        }
        await this._updateDiceRolls(recentRolls, this._extractUserData(user));

        if (recentRolls[1] > 0) return 1;
        if (recentRolls[20] > 0) return 20;
        return 0;
    }

    public calculateNumberOfRolls(rolls: any) {
        return rolls.reduce((total: number, roll: number): number => {
            return total + roll;
        }, 0);
    }

    private selectRandomFromList(list: any) {
        const listIndex = Math.floor(Math.random() * list.length);
        return list[listIndex];
    }

    public selectMeanComment() {
        return this.selectRandomFromList(meanComments);
    }

    public selectReallyMeanComment() {
        return this.selectRandomFromList(reallyMeanComments);
    }

    // takes all active players ids
    // generates random index
    // generates random value 0 -> 100
    public shouldIWhisper(roll: number, user: any) {
        // const players = game.users.filter(u => u.active).map(u => u.id);
        // const randomPlayerIndex = Math.floor(Math.random() * players.length);
        const random = Math.floor(Math.random() * 100);
        if (random < RenderChatMessage.playerWhisperChance) {
            if (roll === 20) {
                this.createWhisperMessage(user._id, this.selectMeanComment());
            } else if (roll === 1) {
                this.createWhisperMessage(user._id, this.selectReallyMeanComment());
            }
        }
    }

    public async createWhisperMessage(target: any, content: any): Promise<void> {
        const message = {
            user: target,
            content: this.sadnessMessage(content),
            whisper: [target]
        };

        await ChatMessage.create(message);
    }

    public async extractAnalytics(_roll: any, chatMessage: any, user: any): Promise<number> {
        let rollValue = 0;
        if (_roll) {
            rollValue = await this.extractSimpleAnalytics(_roll, user);
        } else if (this.checkIfBetter5eRollsIsInstalled() && chatMessage?.data?.content) {
            rollValue = await this.extractBetter5eRollsAnalytics(chatMessage.data.content, user);
        }
        return rollValue;
    }

    public sadnessMessage(content: string): string {
        return `
            <div class="sadness-header-container">
                <img 
                    src="https://cdnb.artstation.com/p/assets/images/images/017/397/657/large/milvinke-madiharpart-dtiys-150-rosado.jpg?1555825697" 
                    alt="sadness-portrait"
                    width="50px"
                    height="50px"
                />
                <h3>Sadness Chan</h3>
            </div>
            <div class="sadness-header-container">
                ${content}
            </div>
        `;
    }
}

export default RenderChatMessage.getInstance();