const {
    PermissionsBitField,
    ApplicationCommandOptionType,
    EmbedBuilder,
} = require('discord.js');
const Guild = require('../models/Guild');

module.exports = {
    name: 'rewards',
    description:
        'Manage server check-in rewards. Only available to administrators.',
    defaultMemberPermissions: PermissionsBitField.Flags.Administrator,
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'add',
            description: 'Add a new reward.',
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'type',
                    description: 'type',
                    required: true,
                    choices: [
                        { name: 'streak', value: 'streak' },
                        { name: 'total', value: 'total' },
                    ],
                },
                {
                    type: ApplicationCommandOptionType.Integer,
                    name: 'threshold',
                    description: 'required number',
                    required: true,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'remove',
            description: 'Remove a reward by its ID.',
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'id',
                    description: 'Reward id from /rewards list',
                    required: true,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'list',
            description: 'View the list of all active rewards.',
        },
    ],

    callback: async (client, interaction) => {
        const subCommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;
        const guildData = await Guild.findOne({ guildId });

        switch (subCommand) {
            case 'add':
                const type = interaction.options.getString('type');
                const threshold = interaction.options.getInteger('threshold');

                await Guild.updateOne(
                    { guildId },
                    {
                        $push: {
                            rewards: {
                                type,
                                threshold,
                            },
                        },
                    },
                    { upsert: true }
                );

                await interaction.reply(
                    `✅ Reward added: ${type} ≥ ${threshold}`
                );
                break;
            case 'remove':
                const _id = interaction.options.getString('id');

                if (!guildData?.rewards?.some(reward => reward._id === _id)) {
                    return interaction.reply({
                        content: '❌ Награда не найдена в списке.',
                        ephemeral: true,
                    });
                }

                await Guild.updateOne(
                    { guildId },
                    { $pull: { rewards: { _id } } }
                );

                interaction.reply({
                    content: '✅ Роль успешно удалена!',
                    ephemeral: true,
                });
                break;
            case 'list':
                const rewards = guildData?.rewards || [];

                const embed = new EmbedBuilder()
                    .setTitle('📜')
                    .setColor('#3498db');
                if (rewards.length === 0) {
                    embed.setDescription('Список пуст');
                } else {
                    const fields = rewards.map(reward => ({
                        name: `\`ID: ${reward._id}\``,
                        value: `${reward.threshold} ${reward.type}`,
                        inline: false,
                    }));

                    embed.addFields(fields);
                }
                interaction.reply({
                    embeds: [embed],
                    ephemeral: true,
                });
                break;
        }
    },
};
