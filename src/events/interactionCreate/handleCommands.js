const { devs, testServer } = require('../../../config.json');
const getLocalCommands = require('../../utils/getLocalCommands');

module.exports = async (client, interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const localCommands = getLocalCommands();

    try {
        const commandObject = localCommands.find(
            command => command.name === interaction.commandName
        );

        if (!commandObject) return;

        if (commandObject.devsOnly && !devs.includes(interaction.user.id)) {
            return interaction.reply({
                content: "⛔ You don't have permission to use this command.",
                ephemeral: true,
            });
        }

        if (commandObject.testOnly && interaction.guild.id !== testServer) {
            return interaction.reply({
                content:
                    '🚧 This command is only available in the test server.',
                ephemeral: true,
            });
        }

        await commandObject.callback(client, interaction);
    } catch (error) {
        console.error(`❌ There was an error: ${error}`);
    }
};
