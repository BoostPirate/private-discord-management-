const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getAccounts, addAccount, updateAccount } = require("../sheets/accounts");
const { generateAccountId } = require("../utils/idGenerator");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("account")
        .setDescription("Manage accounts for sale")
        .addSubcommand(sub =>
            sub.setName("add")
                .setDescription("Upload a new account for sale")
                .addStringOption(opt =>
                    opt.setName("description").setDescription("Account description").setRequired(true)
                )
                .addIntegerOption(opt =>
                    opt.setName("price").setDescription("Account price").setRequired(true)
                )
                .addStringOption(opt =>
                    opt.setName("image").setDescription("Optional image URL").setRequired(false)
                )
        )
        .addSubcommand(sub =>
            sub.setName("list")
                .setDescription("List all available accounts")
        )
        .addSubcommand(sub =>
            sub.setName("mark_sold")
                .setDescription("Mark an account as sold")
                .addStringOption(opt =>
                    opt.setName("account_id").setDescription("Account ID").setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("edit")
                .setDescription("Edit an account listing")
                .addStringOption(opt =>
                    opt.setName("account_id").setDescription("Account ID").setRequired(true)
                )
                .addStringOption(opt =>
                    opt.setName("description").setDescription("New description").setRequired(false)
                )
                .addIntegerOption(opt =>
                    opt.setName("price").setDescription("New price").setRequired(false)
                )
                .addStringOption(opt =>
                    opt.setName("image").setDescription("New image URL").setRequired(false)
                )
        ),
    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        if (sub === "add") {
            const description = interaction.options.getString("description");
            const price = interaction.options.getInteger("price");
            const image = interaction.options.getString("image") || null;

            const accounts = await getAccounts();
            const accountId = await generateAccountId(interaction.user.username, accounts);

            await addAccount({
                id: accountId,
                uploaderId: interaction.user.id,
                description,
                price,
                status: "Available",
                image
            });

            return interaction.reply({
                content: `✅ Added account ${accountId} for sale.`,
                ephemeral: true
            });
        }

        if (sub === "list") {
            const accounts = await getAccounts();
            const available = accounts.filter(acc => acc.status === "Available");

            if (!available.length) {
                return interaction.reply({ content: "⚠️ No accounts available.", ephemeral: true });
            }

            const embeds = available.map(acc =>
                new EmbedBuilder()
                    .setTitle(`🧾 Account ${acc.id}`)
                    .setDescription(acc.description)
                    .addFields(
                        { name: "Price", value: `${acc.price} gp`, inline: true },
                        { name: "Status", value: acc.status, inline: true }
                    )
                    .setColor("Blue")
                    .setImage(acc.image || null)
            );

            return interaction.reply({ embeds, ephemeral: true });
        }

        if (sub === "mark_sold") {
            const accountId = interaction.options.getString("account_id");
            const success = await updateAccount(accountId, { status: "Sold" });

            return interaction.reply({
                content: success ? `✅ Marked account ${accountId} as sold.` : "❌ Account not found.",
                ephemeral: true
            });
        }

        if (sub === "edit") {
            const accountId = interaction.options.getString("account_id");
            const description = interaction.options.getString("description");
            const price = interaction.options.getInteger("price");
            const image = interaction.options.getString("image");

            const success = await updateAccount(accountId, { description, price, image });

            return interaction.reply({
                content: success ? `✅ Updated account ${accountId}.` : "❌ Account not found.",
                ephemeral: true
            });
        }
    }
};
