import Utils from "./Utils";

class SadnessChan {
    private static _instance: SadnessChan;
    private _portrait: string = "https://cdnb.artstation.com/p/assets/images/images/017/397/657/large/milvinke-madiharpart-dtiys-150-rosado.jpg?1555825697";

    private constructor() {
    }

    public static getInstance(): SadnessChan {
        if (!SadnessChan._instance) SadnessChan._instance = new SadnessChan();
        return SadnessChan._instance;
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
                        src="${this._portrait}" 
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
}

export default SadnessChan.getInstance();