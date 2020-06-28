class Utils {
    private static instance: Utils;
    private readonly _debugging: boolean;
    private readonly _trace: boolean;
    public readonly moduleName: string = 'Sadness Chan';
    public readonly moduleTitle: string = 'Sadness Chan';

    private constructor(debugging: boolean, trace: boolean) {
        this._debugging = debugging;
        this._trace = trace;

        CONFIG.debug.hooks = debugging;
    }

    public static getInstance(debugging: boolean, trace: boolean): Utils {
        if (!Utils.instance) {
            Utils.instance = new Utils(debugging, trace);
        }
        return Utils.instance;
    }

    private _consoleLog(output: any): void {
        console.log(
            `%c${this.moduleTitle} %c|`,
            'background: #222; color: #bada55',
            'color: #fff',
            output
        );
    }

    private _consoleTrace(output: any): void {
        console.groupCollapsed(
            `%c${this.moduleTitle} %c|`,
            'background: #222; color: #bada55',
            'color: #fff',
            output
        );
        console.trace();
        console.groupEnd();
    }

    public debug(output: any, doTrace?: boolean): void {
        if (this._debugging && output) {
            if (this._trace && doTrace !== false) {
                this._consoleTrace(output);
            } else {
                this._consoleLog(output);
            }
        }
    }
}

export default Utils.getInstance(true, true);