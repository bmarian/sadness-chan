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
        key: "portraits",
        data: {
            name: "Add portraits: ",
            type: String,
            default: "{}",
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