const { SlashCommandBuilder } = require("discord.js");
const { getGoldSales, addGoldSale, getMules, setMuleStock } = require("../sheets/gold");

function generateSaleId() {
    return "S" + Math.floor(Math.random() * 1000000); // replace later with idGenerator util
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("gold")
        .setDescription("Log and manage gold sales")
        .addSubcommand(sub =>
            sub.setName("log")
                .setDescription("Log a gold sale")
                .addUserOption(opt =>
                    opt.setName("customer").setDescription("Customer buying gold").setRequired(true)
                )
                .addStringOption(opt =>
                    opt.setName("mule").setDescription("Mule name").setRequired(true)
                )
                .addIntegerOption(opt =>
                    opt.setName("amount").setDescription("Amount sold (gp)").setRequired(true)
                )
                .addStringOption(opt =>
                    opt.setName("world").setDescription("World used").setRequired(false)
                )
                .addStringOption(opt =>
                    opt.setName("notes").setDescription("Optional notes").setRequired(false)
                )
        )
        .addSubcommand(sub =>
            sub.setName("list_sales")
                .setDescription("List recent gold sales")
        )
        .addSubcommand(sub =>
            sub.setName("list_mules")
                .setDescription("List all mule stock")
        )
        .addSubcommand(sub =>
            sub.setName("set_stock")
                .setDescription("Set mule stock manually")
                .addStringOption(opt =>
                    opt.setName("mule").setDescription("Mule name").setRequired(true)
                )
                .addIntegerOption(opt =>
                    opt.setName("stock").setDescription("New stock").setRequired(true)
                )
        ),
    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        if (sub === "log") {
            const customer = interaction.options.getUser("customer");
            const mule = interaction.options.getString("mule");
            const amount = interaction.options.getInteger("amount");
            const world = interaction.options.getString("world") || "";
            const notes = interaction.options.getString("notes") || "";

            const saleId = generateSaleId();
            await addGoldSale({
                id: saleId,
                customerId: customer.id,
                mule,
                amount,
                world,
                notes
            });

            return interaction.reply({
                content: `✅ Logged gold sale ${saleId}: ${amount} gp to ${customer.username} (Mule: ${mule})`,
                ephemeral: true
            });
        }

        if (sub === "list_sales") {
            const sales = await getGoldSales();
            if (!sales.length) {
                return interaction.reply({ content: "⚠️ No gold sales found.", ephemeral: true });
            }

            const recent = sales.slice(-5).map(s =>
                `💰 Sale ${s.id}: ${s.amount} gp → <@${s.customerId}> (Mule: ${s.mule}, World: ${s.world})`
            ).join("\n");

            return interaction.reply({ content: `**Recent Gold Sales:**\n${recent}`, ephemeral: true });
        }

        if (sub === "list_mules") {
            const mules = await getMules();
            if (!mules.length) {
                return interaction.reply({ content: "⚠️ No mules found.", ephemeral: true });
            }

            const list = mules.map(m =>
                `🐀 ${m.name}: ${m.stock} gp (World: ${m.world}, Last Trade: ${m.lastTrade})`
            ).join("\n");

            return interaction.reply({ content: `**Mules:**\n${list}`, ephemeral: true });
        }

        if (sub === "set_stock") {
            const mule = interaction.options.getString("mule");
            const stock = interaction.options.getInteger("stock");
            await setMuleStock(mule, stock);

            return interaction.reply({ content: `✅ Set stock for mule **${mule}** to ${stock} gp.`, ephemeral: true });
        }
    }
};
