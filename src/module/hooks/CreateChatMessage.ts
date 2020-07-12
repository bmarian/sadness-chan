import Utils from "../Utils"
import Settings from "../Settings"
import nat20ComList from "../lists/nat20CommentsList"
import nat1ComList from "../lists/nat1CommentsList"

class CreateChatMessage {
    private static _instance: CreateChatMessage;
    private static playerWhisperChance = 50;

    private constructor() {
    }

    public static getInstance(): CreateChatMessage {
        if (!CreateChatMessage._instance) CreateChatMessage._instance = new CreateChatMessage();
        return CreateChatMessage._instance;
    }

    public async createChatMessageHook(chatMessage: any): Promise<void> {
        const user = chatMessage?.user?.data;
        if (!user) return;
        if (!game?.user?.hasRole(4)) return;

        const result = await this.extractAnalytics(chatMessage?._roll, chatMessage, user);
        await this.shouldIWhisper(result, user);
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
        const counter = Settings.getCounter();
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
        return Settings.setCounter(counter);
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

    private _selectRandomFromList(list: any) {
        const listIndex = Math.floor(Math.random() * list.length);
        return list[listIndex];
    }

    public selectMeanComment(user: any) {
        const message = this._selectRandomFromList(nat20ComList);
        return this.updateDynamicMessages(message, user);
    }

    public selectReallyMeanComment(user: any) {
        const message = this._selectRandomFromList(nat1ComList);
        return this.updateDynamicMessages(message, user);
    }

    public shouldIWhisper(roll: number, user: any): Promise<void> {
        const random = Math.floor(Math.random() * 100);
        if (random > CreateChatMessage.playerWhisperChance || !roll) return;

        return this.createWhisperMessage(
            user._id,
            roll === 20 ? this.selectMeanComment(user) : this.selectReallyMeanComment(user)
        );
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
        const imageUrl = "https://cdnb.artstation.com/p/assets/images/images/017/397/657/large/milvinke-madiharpart-dtiys-150-rosado.jpg?1555825697";
        const chatMessageClass = `${Utils.moduleName}-chat-message`;
        const chatHeaderClass = `${chatMessageClass}-header`;
        const chatBodyClass = `${chatMessageClass}-body`

        return `
            <div class="${chatMessageClass}">
                <div class="${chatHeaderClass}">
                    <img 
                        src="${imageUrl}" 
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

    public updateDynamicMessages(message: string, user: any): string {
        let messageOutput = '';

        const userData = this._extractUserData(user);
        const counter = Settings.getCounter();
        const userStructure = counter[userData.id];

        messageOutput = message.replace(/\[sc-d([0-9]{1,2})\]/, (match: string, value: string): string => {
            return userStructure.rolls[value];
        });

        messageOutput = messageOutput.replace(/\[sc-name\]/, (match: string): string => {
            return userData.name;
        });
        return messageOutput;
    }
}

export default CreateChatMessage.getInstance();