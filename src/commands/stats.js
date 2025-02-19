const { ApplicationCommandOptionType } = require('discord.js');
const t = require('../utils/t');
const { EmbedBuilder } = require('@discordjs/builders');
const GuildUser = require('../models/GuildUser');

module.exports = {
    name: 'stats',
    description:
        'Displays the check-in statistics for yourself or another user.',
    options: [
        {
            name: 'user',
            description: 'User to check',
            type: ApplicationCommandOptionType.User,
            required: false,
        },
    ],

    callback: async (client, interaction) => {
        try {
            await interaction.deferReply();

            const targetUser =
                interaction.options.getUser('user') || interaction.user;
            const guildId = interaction.guild.id;
            const userLang = interaction.locale;

            const guildUser = await GuildUser.findOne({
                userId: targetUser.id,
                guildId,
            });

            const embed = new EmbedBuilder().setAuthor({
                name: t('stats.title', userLang, { name: targetUser.username }),
                iconURL: targetUser.displayAvatarURL(),
            });

            if (!guildUser) {
                embed.setDescription(t('stats.no_data', userLang));
            } else {
                embed.addFields(
                    {
                        name: t('stats.total', userLang),
                        value: `${guildUser.totalCheckins}`,
                        inline: true,
                    },
                    {
                        name: t('stats.streak', userLang),
                        value: `${guildUser.currentStreak} ${
                            guildUser.currentStreak > 1 ? ' 🔥' : ''
                        }`,
                        inline: true,
                    }
                );
            }

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('/stats error:', error);
            return interaction.editReply(t('errors.generic', userLang));
        }
    },
};
