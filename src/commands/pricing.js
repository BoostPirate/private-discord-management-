const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPricingOptions } = require("../sheets/pricing");
const { getWallet } = require("../sheets/wallets");
const { getConfig } = require("../sheets/config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pricing")
        .setDescription("Show pricing options with discounts"),
    async execute(interaction) {
        const options = await getPricingOptions();
        const wallet = await getWallet(interaction.user.id);
        const config = await getConfig();

        // find highest discount tier the user qualifies for
        let discountPercent = 0;
        const thresholds = Object.keys(config)
            .filter(k => k.startsWith("discount_threshold"))
            .map(k => ({
                threshold: Number(config[k]),
                discount: Number(config[`discount_percent_${k.split("_").pop()}`] || 0)
            }))
            .sort((a, b) => b.threshold - a.threshold);

        for (const t of thresholds) {
            if (wallet.spent >= t.threshold) {
                discountPercent = t.discount;
                break;
            }
        }

        const embed = new EmbedBuilder()
            .setTitle("📊 Pricing")
            .setColor("Blue")
            .setDescription(discountPercent > 0 ? `💸 You qualify for **${discountPercent}% discount**` : "No discount applied")
            .addFields(
                options.map(opt => {
                    const base = Number(opt.price);
                    const discounted = Math.floor(base * (1 - discountPercent / 100));
                    return {
                        name: opt.name || "Service",
                        value: discountPercent > 0 ? `${base} gp → **${discounted} gp**` : `${base} gp`,
                        inline: true
                    };
                })
            );

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
