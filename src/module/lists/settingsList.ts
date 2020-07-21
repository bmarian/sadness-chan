export default [
    {
        key: "counter",
        data: {
            type: String,
            default: "{}",
            scope: "world",
            config: false,
        },
    },
    {
        key: "commandHeader",
        data: {
            name: "Command simbol: ",
            hint: "Type the character that should procede the command key word. Attention: (The \"/\" character does not work)",
            type: String,
            default: "!",
            scope: "world",
            config: true,
        }
    },
    {
        key: "commandKey",
        data: {
            name: "Command key word: ",
            hint: "This is the word that when typed will trigger the display of the roll stats.",
            type: String,
            default: "sadness",
            scope: "world",
            config: true,
        }
    },
    {
        key: "diceType",
        data: {
            name: "Observed die",
            hint: "This is the type of dice that the module will count and observe",
            type: String,
            default: "d20",
            scope: "world",
            config: true,
        }
    },
    {
        key: "critFail",
        data: {
            name: "Critical fail value",
            hint: "This is the value that is considered a critical fail",
            type: Number,
            default: 1,
            scope: "world",
            config: true,
        }
    },
    {
        key: "critSucces",
        data: {
            name: "Critical succes value",
            hint: "This is the value that is considered a critical succes",
            type: Number,
            default: 20,
            scope: "world",
            config: true,
        }
    }
    // {
    //     key: "discordBotKey",
    //     data: {
    //         name: "Discord bot key:",
    //         hint: "Register a discord bot to send you cool chat messages.",
    //         type: String,
    //         default: "",
    //         scope: "world",
    //         config: true,
    //     },
    // },
];