const { ApplicationCommandOptionType } = require('discord.js');
const GuildUser = require('../models/GuildUser');

module.exports = {
    deleted: true, //Command is not finished
    name: 'leaderboard',
    description: 'Show the leaderboard of this channel',
    options: [
        {
            name: 'type',
            description: 'Ranking type',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: 'Total check-ins number', value: 'total' },
                { name: 'Current streak', value: 'streak' },
            ],
        },
    ],

    callback: async (client, interaction) => {
        try {
            await interaction.deferReply();

            const userLang = interaction.locale;
            const type = interaction.options.getString('type');
            const guildId = interaction.guild.id;

            const leaderboard = await GuildUser.find({ guildId })
                .sort({
                    [type === 'total' ? 'totalCheckins' : 'currentStreak']: -1,
                })
                .limit(10)
                .exec();

            if (leaderboard.length === 0) {
                return interaction.editReply(
                    '🏆 Рейтинг этого сервера пока пуст!'
                );
            }

            const userIds = leaderboard.map(entry => entry.userId);

            const members = await interaction.guild.members.fetch({
                user: userIds,
                force: false,
            });
        } catch (error) {
            console.error('/leaderboard error:', error);
            interaction.editReply(t('errors.generic', userLang));
        }
    },
};
