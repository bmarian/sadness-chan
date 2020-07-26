export default {
    SETTING_DEFAULTS: {
        FAIL_CHANCE: 0.5,
        SUCCESS_CHANCE: 0.5,
        STATS_CMD: `!sadness`,
        DIE_TYPE: 20,
        CRT_FAIL: 1,
        CRT_SUCCESS: 20,
    },
    SETTING_KEYS: {
        FAIL_CHANCE: 'failComChance',
        SUCCESS_CHANCE: 'successComChance',
        STATS_CMD: 'statsCmd',
        DIE_TYPE: 'dieType',
        CRT_FAIL: 'crtFail',
        CRT_SUCCESS: 'crtSuccess',
        COUNTER: 'counter',
        LISTS: 'lists',
        LISTS_EDITOR: 'listsEditor',
    },
    ERROR_MESSAGES: {},
    SETTINGS: [
        {
            key: "counter",
            data: {
                type: String,
                default: "{}",
                scope: "world",
                config: false,
                restricted: true,
            },
        },
        {
            key: "statsCmd",
            data: {
                name: "Stats command:",
                type: String,
                default: "!sadness",
                scope: "world",
                config: true,
                restricted: true,

            }
        },
        {
            key: "dieType",
            data: {
                name: "Die to observe:",
                hint: "The number of faces the observed die has.",
                type: Number,
                default: 20,
                scope: "world",
                config: true,
                restricted: true,

            }
        },
        {
            key: "crtFail",
            data: {
                name: "Critical fail value:",
                hint: "The value considered a critical failure.",
                type: Number,
                default: 1,
                scope: "world",
                config: true,
                restricted: true,

            }
        },
        {
            key: "crtSuccess",
            data: {
                name: "Critical success value:",
                hint: "The value considered a critical success.",
                type: Number,
                default: 20,
                scope: "world",
                config: true,
                restricted: true,

            }
        },
        {
            key: "failComChance",
            data: {
                name: "Message chance on critical fail:",
                hint: "This is a number between 0 and 1 that represents the percentage change for a message to be sent on a critical fail",
                type: Number,
                default: 0.5,
                scope: "world",
                config: true,
                restricted: true,

            }
        },
        {
            key: "successComChance",
            data: {
                name: "Message chance on critical success:",
                hint: "This is a number between 0 and 1 that represents the percentage change for a message to be sent on a critical fail",
                type: Number,
                default: 0.5,
                scope: "world",
                config: true,
                restricted: true,

            }
        }
    ],
};