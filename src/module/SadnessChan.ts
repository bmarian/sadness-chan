import Utils from "./Utils";
import portraitsList from "./lists/portraitsList";

class SadnessChan {
    private static _instance: SadnessChan;
    private _portraits: string[] = portraitsList;
    private readonly _playerWhisperChance = 50;

    private constructor() {
    }

    public static getInstance(): SadnessChan {
        if (!SadnessChan._instance) SadnessChan._instance = new SadnessChan();
        return SadnessChan._instance;
    }

    private _getRandomPortrait(): string {
        return Utils.getRandomItemFromList(this._portraits);
    }

    private _getStatsMessageBody(userData: any, statsBodyClass: string):string {
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

    public async whisper(result: Array<number>, user: any): Promise<void> {

    }


    //
    // public calculateNumberOfRolls(rolls: any) {
    //     return rolls.reduce((total: number, roll: number): number => {
    //         return total + roll;
    //     }, 0);
    // }
    //
    // private _selectRandomFromList(list: any) {
    //     const listIndex = Math.floor(Math.random() * list.length);
    //     return list[listIndex];
    // }
    //
    // public selectMeanComment(user: any) {
    //     const message = this._selectRandomFromList(nat20ComList);
    //     return this.updateDynamicMessages(message, user);
    // }
    //
    // public selectReallyMeanComment(user: any) {
    //     const message = this._selectRandomFromList(nat1ComList);
    //     return this.updateDynamicMessages(message, user);
    // }
    //
    // public shouldIWhisper(roll: number, user: any): Promise<void> {
    //     const random = Math.floor(Math.random() * 100);
    //     if (random > CreateChatMessage.playerWhisperChance || !roll) return;
    //
    //     return this.createWhisperMessage(
    //         user._id,
    //         roll === 20 ? this.selectMeanComment(user) : this.selectReallyMeanComment(user)
    //     );
    // }
    //
    // public async createWhisperMessage(target: any, content: any): Promise<void> {
    //     const message = {
    //         user: target,
    //         content: this.sadnessMessage(content),
    //         whisper: [target]
    //     };
    //
    //     await ChatMessage.create(message);
    // }
    //
    //
    // public sadnessMessage(content: string): string {
    //     const imageUrl = "https://cdnb.artstation.com/p/assets/images/images/017/397/657/large/milvinke-madiharpart-dtiys-150-rosado.jpg?1555825697";
    //     const chatMessageClass = `${Utils.moduleName}-chat-message`;
    //     const chatHeaderClass = `${chatMessageClass}-header`;
    //     const chatBodyClass = `${chatMessageClass}-body`
    //
    //     return `
    //         <div class="${chatMessageClass}">
    //             <div class="${chatHeaderClass}">
    //                 <img
    //                     src="${imageUrl}"
    //                     alt="${Utils.moduleName}-portrait"
    //                     class="${chatHeaderClass}__portrait"
    //                 />
    //                 <h3 class="${chatHeaderClass}__name">
    //                     ${Utils.moduleTitle}
    //                 </h3>
    //             </div>
    //             <div class="${chatBodyClass}">
    //                 ${content}
    //             </div>
    //         </div>
    //     `;
    // }
    //
    // public updateDynamicMessages(message: string, user: any): string {
    //     let messageOutput = '';
    //
    //     const userData = this._extractUserData(user);
    //     const counter = Settings.getCounter();
    //     const userStructure = counter[userData.id];
    //
    //     messageOutput = message.replace(/\[sc-d([0-9]{1,2})\]/, (match: string, value: string): string => {
    //         return userStructure.rolls[value];
    //     });
    //
    //     messageOutput = messageOutput.replace(/\[sc-name\]/, (match: string): string => {
    //         return userData.name;
    //     });
    //     return messageOutput;
    // }
}

export default SadnessChan.getInstance();