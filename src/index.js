require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');
const { default: mongoose } = require('mongoose');
const eventHandler = require('./handlers/eventHandler');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

(async () => {
    try {
        console.log('⌛ Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'checkin-bot',
        });
        console.log('✅ Connected to MongoDB!');

        eventHandler(client);
    } catch (error) {
        console.error(`❌ Error initializing: ${error}`);
    }
})();

client.login(process.env.TOKEN);
