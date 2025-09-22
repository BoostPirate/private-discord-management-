require("dotenv").config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// Load command files
const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

// Register commands with Discord API
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log("🔄 Refreshing slash commands...");
        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,  // your app ID
                process.env.GUILD_ID
            ),
            { body: commands }
        );
        console.log("✅ Slash commands registered.");
    } catch (error) {
        console.error(error);
    }
})();

// Load events
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

client.login(process.env.DISCORD_TOKEN);
