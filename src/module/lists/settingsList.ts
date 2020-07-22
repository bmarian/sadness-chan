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
        key: "cmdSymbol",
        data: {
            name: "Command symbol:",
            hint: "The character that proceeds the command. (Attention, \"/\" can't be used!).",
            type: String,
            default: "!",
            scope: "world",
            config: true,
        }
    },
    {
        key: "statsCmd",
        data: {
            name: "Stats command:",
            type: String,
            default: "sadness",
            scope: "world",
            config: true,
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
        }
    }

];