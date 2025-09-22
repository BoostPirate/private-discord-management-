const { SlashCommandBuilder } = require("discord.js");
const { getWallet, setWallet } = require("../sheets/wallets");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("wallet")
        .setDescription("Wallet commands")
        .addSubcommand(sub =>
            sub.setName("check")
                .setDescription("Check a user's wallet")
                .addUserOption(opt =>
                    opt.setName("user").setDescription("User to check").setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("add")
                .setDescription("Add balance to a user")
                .addUserOption(opt =>
                    opt.setName("user").setDescription("User to add balance to").setRequired(true)
                )
                .addIntegerOption(opt =>
                    opt.setName("amount").setDescription("Amount to add").setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("remove")
                .setDescription("Remove balance (spend)")
                .addUserOption(opt =>
                    opt.setName("user").setDescription("User to charge").setRequired(true)
                )
                .addIntegerOption(opt =>
                    opt.setName("amount").setDescription("Amount to remove").setRequired(true)
                )
        ),
    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const user = interaction.options.getUser("user");

        if (sub === "check") {
            const wallet = await getWallet(user.id);
            return interaction.reply({
                content: `💰 Wallet for **${user.username}**: ${wallet.balance} gp (Spent: ${wallet.spent} gp)`,
                ephemeral: true
            });
        }

        if (sub === "add") {
            const amount = interaction.options.getInteger("amount");
            const wallet = await getWallet(user.id);
            const newBalance = wallet.balance + amount;
            await setWallet(user.id, newBalance, wallet.spent, interaction.guild);

            return interaction.reply({
                content: `✅ Added ${amount} gp to **${user.username}**. New balance: ${newBalance} gp`,
                ephemeral: true
            });
        }

        if (sub === "remove") {
            const amount = interaction.options.getInteger("amount");
            const wallet = await getWallet(user.id);
            const newBalance = Math.max(wallet.balance - amount, 0);
            const newSpent = wallet.spent + amount;
            await setWallet(user.id, newBalance, newSpent, interaction.guild);

            return interaction.reply({
                content: `✅ Charged ${amount} gp from **${user.username}**. New balance: ${newBalance} gp (Spent: ${newSpent} gp)`,
                ephemeral: true
            });
        }
    }
};

