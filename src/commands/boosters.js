const { SlashCommandBuilder } = require("discord.js");
const { getBoosters, setBooster } = require("../sheets/boosters");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("booster")
        .setDescription("Manage boosters & deposits")
        .addSubcommand(sub =>
            sub.setName("add")
                .setDescription("Add a user as booster")
                .addUserOption(opt =>
                    opt.setName("user").setDescription("User to add").setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("remove")
                .setDescription("Mark a booster as inactive")
                .addUserOption(opt =>
                    opt.setName("user").setDescription("User to remove").setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("list")
                .setDescription("List all boosters")
        )
        .addSubcommand(sub =>
            sub.setName("set_deposit")
                .setDescription("Set booster deposit")
                .addUserOption(opt =>
                    opt.setName("user").setDescription("Booster to update").setRequired(true)
                )
                .addIntegerOption(opt =>
                    opt.setName("amount").setDescription("Deposit amount").setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("add_deposit")
                .setDescription("Increase booster deposit")
                .addUserOption(opt =>
                    opt.setName("user").setDescription("Booster to update").setRequired(true)
                )
                .addIntegerOption(opt =>
                    opt.setName("amount").setDescription("Amount to add").setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("remove_deposit")
                .setDescription("Decrease booster deposit")
                .addUserOption(opt =>
                    opt.setName("user").setDescription("Booster to update").setRequired(true)
                )
                .addIntegerOption(opt =>
                    opt.setName("amount").setDescription("Amount to remove").setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("list_deposits")
                .setDescription("List all booster deposits")
        ),
    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const user = interaction.options.getUser("user");

        if (sub === "add") {
            await setBooster(user.id, 0, "Active");
            return interaction.reply({ content: `✅ Added **${user.username}** as booster.`, ephemeral: true });
        }

        if (sub === "remove") {
            await setBooster(user.id, 0, "Inactive");
            return interaction.reply({ content: `✅ Marked **${user.username}** as inactive.`, ephemeral: true });
        }

        if (sub === "list") {
            const boosters = await getBoosters();
            if (!boosters.length) {
                return interaction.reply({ content: "⚠️ No boosters found.", ephemeral: true });
            }

            const list = boosters.map(b => 
                `<@${b.id}> - ${b.status} (Deposit: ${b.deposit} gp)`
            ).join("\n");

            return interaction.reply({ content: `👥 **Boosters:**\n${list}`, ephemeral: true });
        }

        if (sub === "set_deposit") {
            const amount = interaction.options.getInteger("amount");
            await setBooster(user.id, amount, "Active");
            return interaction.reply({ content: `✅ Set deposit for **${user.username}** to ${amount} gp.`, ephemeral: true });
        }

        if (sub === "add_deposit") {
            const amount = interaction.options.getInteger("amount");
            const boosters = await getBoosters();
            const booster = boosters.find(b => b.id === user.id);
            const newDeposit = (booster?.deposit || 0) + amount;
            await setBooster(user.id, newDeposit, "Active");
            return interaction.reply({ content: `✅ Added ${amount} gp to **${user.username}**. New deposit: ${newDeposit} gp.`, ephemeral: true });
        }

        if (sub === "remove_deposit") {
            const amount = interaction.options.getInteger("amount");
            const boosters = await getBoosters();
            const booster = boosters.find(b => b.id === user.id);
            const newDeposit = Math.max((booster?.deposit || 0) - amount, 0);
            await setBooster(user.id, newDeposit, "Active");
            return interaction.reply({ content: `✅ Removed ${amount} gp from **${user.username}**. New deposit: ${newDeposit} gp.`, ephemeral: true });
        }

        if (sub === "list_deposits") {
            const boosters = await getBoosters();
            if (!boosters.length) {
                return interaction.reply({ content: "⚠️ No boosters found.", ephemeral: true });
            }

            const list = boosters.map(b => 
                `<@${b.id}> - Deposit: ${b.deposit} gp`
            ).join("\n");

            return interaction.reply({ content: `💰 **Deposits:**\n${list}`, ephemeral: true });
        }
    }
};

