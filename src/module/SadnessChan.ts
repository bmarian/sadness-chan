class SadnessChan {
    private static _instance: SadnessChan;

    private constructor() {
    }

    public static getInstance(): SadnessChan {
        if (!SadnessChan._instance) SadnessChan._instance = new SadnessChan();
        return SadnessChan._instance;
    }
}

export default SadnessChan.getInstance();