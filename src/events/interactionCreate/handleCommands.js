const { devs, testServer } = require('../../../config.json');
const getLocalCommands = require('../../utils/getLocalCommands');
const { MessageFlags } = require('discord.js');

module.exports = async (client, interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const userLang = interaction.locale;

    try {
        const localCommands = getLocalCommands();

        const commandObject = localCommands.find(
            command => command.name === interaction.commandName
        );

        if (!commandObject) return;

        if (commandObject.devsOnly && !devs.includes(interaction.user.id)) {
            return interaction.reply({
                content: "⛔ You don't have permission to use this command.",
                flags: MessageFlags.Ephemeral,
            });
        }

        if (commandObject.testOnly && interaction.guild.id !== testServer) {
            return interaction.reply({
                content:
                    '🚧 This command is only available in the test server.',
                flags: MessageFlags.Ephemeral,
            });
        }

        await commandObject.callback(client, interaction);
    } catch (error) {
        console.error(`❌ handleCommands error: ${error}`);
        interaction.reply(t('errors.generic', userLang));
    }
};
