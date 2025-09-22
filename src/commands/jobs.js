const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");
const { addJob } = require("../sheets/jobs");
const { getWallet, setWallet } = require("../sheets/wallets");
const { getConfig } = require("../sheets/config");

function generateJobId() {
    return "J" + Math.floor(Math.random() * 1000000);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("job")
        .setDescription("Manage jobs")
        .addSubcommand(sub =>
            sub.setName("create")
                .setDescription("Create a new job")
                .addUserOption(opt =>
                    opt.setName("customer")
                        .setDescription("Customer for the job")
                        .setRequired(true)
                )
                .addIntegerOption(opt =>
                    opt.setName("value")
                        .setDescription("Total job value in gp")
                        .setRequired(true)
                )
                .addIntegerOption(opt =>
                    opt.setName("deposit")
                        .setDescription("Deposit required for booster")
                        .setRequired(true)
                )
                .addStringOption(opt =>
                    opt.setName("description")
                        .setDescription("Job description")
                        .setRequired(true)
                )
                .addStringOption(opt =>
                    opt.setName("image")
                        .setDescription("Optional image URL")
                        .setRequired(false)
                )
        ),
    async execute(interaction) {
        try {
            if (interaction.options.getSubcommand() !== "create") return;

            console.log("➡️ /job create triggered");

            const customer = interaction.options.getUser("customer");
            const value = interaction.options.getInteger("value");
            const deposit = interaction.options.getInteger("deposit");
            const description = interaction.options.getString("description");
            const image = interaction.options.getString("image") || null;

            console.log("➡️ Options:", { customer: customer.id, value, deposit, description, image });

            // 🔎 Wallet check
            const wallet = await getWallet(customer.id);
            console.log("➡️ Wallet:", wallet);

            if (wallet.balance < value) {
                console.log("❌ Insufficient balance");
                return interaction.reply({ content: "❌ Customer has insufficient balance.", ephemeral: true });
            }

            await setWallet(customer.id, wallet.balance - value, wallet.spent, interaction.guild);
            console.log("➡️ Wallet updated");

            // 🔎 Add job to sheet
            const jobId = generateJobId();
            console.log("➡️ Adding job to sheet with ID:", jobId);

            await addJob({
                id: jobId,
                customerId: customer.id,
                boosterId: "",
                value,
                description,
                status: "Open",
                image,
                deposit
            });

            console.log("✅ Job added to sheet");

            return interaction.reply({ content: `✅ Created job ${jobId}`, ephemeral: true });
        } catch (err) {
            console.error("❌ Error in /job create full trace:", err);
            return interaction.reply({
                content: "❌ There was an error creating the job.",
                ephemeral: true
            });
        }
    }
};
