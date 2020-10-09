import Utils from "../Utils";

export default {
    SETTING_DEFAULTS: {
        FAIL_CHANCE: 0.5,
        SUCCESS_CHANCE: 0.5,
        STATS_CMD: `!sadness`,
        DIE_TYPE: 20,
        CRT_FAIL: 1,
        CRT_SUCCESS: 20,
        STATS_MESSAGE_VISIBILITY: false,
        COMMENT_MESSAGE_VISIBILITY: false,
        AVERAGE_TOGGLE: false,
        IMAGE_BORDER: true,
        SADNESS_TITLE: Utils.moduleTitle,
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
        STATS_MESSAGE_VISIBILITY: 'statsWhisperToggle',
        COMMENT_MESSAGE_VISIBILITY: 'commentWhisperToggle',
        AVERAGE_TOGGLE: 'averageToggle',
        IMAGE_BORDER: 'imageBorder',
        SADNESS_TITLE: 'sadnessTitle',
        RESET_LEVEL: 'resetLevel'
    },
    ERROR_MESSAGES: {
        NOT_ENOUGH_PERMISSIONS: 'Sorry but this command is only for the big guy.',
        RESET_SOMEONE_ELSE: `Wow, covering up for someone else. Normally i would say you are a really nice guy, but I know you are a degenerate so...`,
        SETTINGS_RESET: 'Who are you, again?',
        COUNTER_RESET: 'Are you THAT embarrassed about your rolls?',
        LISTS_RESET: 'Oh good... I can be myself again (◔_◔)',
        INVALID_ARGUMENTS: 'Do you even know what you\'re doing?',
        NO_DATA: 'Play a little before spamming your friends with your failures -_-',
    },
    SETTINGS: [
        {
            key: "counter",
            data: {
                type: String,
                default: "{}",
                scope: "world",
                config: false,
                restricted: false,
            },
        },
        {
            key: "statsCmd",
            data: {
                name: "Stats command:",
                hint: "Do you fell happy? I can change that (｡◕‿◕｡)",
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
                name: "Observed die:",
                hint: "How many faces does your shiny fail rock has?",
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
                hint: "What number makes you the saddest?",
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
                hint: "You're never gonna see this. Does it even matter?",
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
                name: "Chance for a message on critical fail:",
                hint: "How often do I have to talk with you? 0 for never, 1 for always, I guess...",
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
                name: "Chance for a message on critical success:",
                hint: "Like the other one, you dummy ╰| ⊡ _ ⊡ |╯",
                type: Number,
                default: 0.5,
                scope: "world",
                config: true,
                restricted: true,

            }
        },
        {
            key: "sadnessTitle",
            data: {
                name: "My name",
                hint: "Call me whatever. I don't care anymore.",
                type: String,
                default: Utils.moduleTitle,
                scope: "world",
                config: true,
                restricted: true,
            }
        },
        {
            key: "statsWhisperToggle",
            data: {
                name: "Public stats",
                hint: "Ok... let the others know your worth.",
                type: Boolean,
                default: false,
                scope: "world",
                config: true,
                restricted: true,
            }
        },
        {
            key: "commentWhisperToggle",
            data: {
                name: "Public comments",
                hint: "You really like public shaming?",
                type: Boolean,
                default: false,
                scope: "world",
                config: true,
                restricted: true,
            }
        },
        {
            key: "averageToggle",
            data: {
                name: "Show average",
                hint: "You know this is just a random generator, right? If you really want to find out just search google for dice odds (◔_◔)",
                type: Boolean,
                default: false,
                scope: "world",
                config: true,
                restricted: true,
            }
        },
        {
            key: "imageBorder",
            data: {
                name: "Image Border",
                hint: "Do you hate that pesky little image border?",
                type: Boolean,
                default: true,
                scope: "world",
                config: true,
                restricted: true,
            }
        },
        {
            key: "resetLevel",
            data: {
                name: "Reset me permission: ",
                hint: "Should I let the plebs reset their counter? WARNING: this setting only works if the user category has the permission to \"Modify Configuration Settings\". Not sassy here, you'll get errors that aren't my fault. Don't message me or the idiots that made me about them -_-",
                type: Number,
                choices: {
                    1: "Plebs",
                    2: "Trusted Plebs",
                    3: "Big Man JR",
                    4: "Big Man"
                },
                default: 4,
                scope: "world",
                config: true,
                restricted: true,
            }
        },
    ],
};