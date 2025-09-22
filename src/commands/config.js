const { SlashCommandBuilder } = require("discord.js");
const { getConfig, setConfig } = require("../sheets/config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("config")
        .setDescription("View or update bot configuration")
        .addSubcommand(sub =>
            sub.setName("get")
                .setDescription("Get a config value")
                .addStringOption(opt =>
                    opt.setName("key").setDescription("Config key").setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("set")
                .setDescription("Set a config value")
                .addStringOption(opt =>
                    opt.setName("key").setDescription("Config key").setRequired(true)
                )
                .addStringOption(opt =>
                    opt.setName("value").setDescription("Config value").setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("list")
                .setDescription("List all config values")
        ),
    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        if (sub === "get") {
            const key = interaction.options.getString("key");
            const config = await getConfig();
            const value = config[key];
            return interaction.reply({
                content: value ? `⚙️ **${key}** = ${value}` : `❌ Key "${key}" not found.`,
                ephemeral: true
            });
        }

        if (sub === "set") {
            const key = interaction.options.getString("key");
            const value = interaction.options.getString("value");
            await setConfig(key, value);
            return interaction.reply({
                content: `✅ Set **${key}** = ${value}`,
                ephemeral: true
            });
        }

        if (sub === "list") {
            const config = await getConfig();
            const list = Object.entries(config)
                .map(([k, v]) => `• **${k}** = ${v}`)
                .join("\n");

            return interaction.reply({
                content: list.length ? `⚙️ **Config Values:**\n${list}` : "⚠️ No config found.",
                ephemeral: true
            });
        }
    }
};
