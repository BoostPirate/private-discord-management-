const { EmbedBuilder } = require("discord.js");
const { updateJob, getJob } = require("../sheets/jobs");

module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
        // Slash commands
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(error);
                await interaction.reply({
                    content: "❌ There was an error executing that command.",
                    ephemeral: true
                });
            }
            return;
        }

        // Buttons
        if (interaction.isButton()) {
            const [action, jobId] = interaction.customId.split("_");

            if (action === "claim") {
                const booster = interaction.user;

                try {
                    // Update job in Sheets
                    await updateJob(jobId, {
                        worker: booster.id,
                        status: "CLAIMED"
                    });

                    // Fetch job details
                    const job = await getJob(jobId);
                    const orderChannelId = job.channel_id;

                    // Update embed
                    const oldEmbed = interaction.message.embeds[0];
                    const updatedEmbed = EmbedBuilder.from(oldEmbed);

                    const fields = updatedEmbed.data.fields.map(f =>
                        f.name === "Worker"
                            ? { ...f, value: `<@${booster.id}>` }
                            : f
                    );
                    updatedEmbed.setFields(fields);

                    // Disable button
                    await interaction.update({
                        content: `✅ Order ${jobId} claimed by ${booster}`,
                        embeds: [updatedEmbed],
                        components: []
                    });

                    // Add booster into the correct ticket channel
                    const orderChannel =
                        interaction.guild.channels.cache.get(orderChannelId);
                    if (orderChannel) {
                        await orderChannel.permissionOverwrites.edit(booster.id, {
                            ViewChannel: true,
                            SendMessages: true
                        });

                        await orderChannel.send(
                            `${booster} has been added as the worker for this job.`
                        );
                    }
                } catch (err) {
                    console.error("❌ Error claiming job:", err);
                    await interaction.reply({
                        content: "❌ Failed to claim this job.",
                        ephemeral: true
                    });
                }
            }
        }
    }
};
