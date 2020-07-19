class NamelessChan {
    private static _instance: NamelessChan;

    private constructor() {
    }

    public static getInstance(): NamelessChan {
        if (!NamelessChan._instance) NamelessChan._instance = new NamelessChan();
        return NamelessChan._instance;
    }

    public getNamesMessage(content: string): string {
        return 'debugging';
    }
}

export default NamelessChan.getInstance();