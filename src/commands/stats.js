const { ApplicationCommandOptionType } = require('discord.js');
const t = require('../utils/t');
const { EmbedBuilder } = require('@discordjs/builders');
const GuildUser = require('../models/GuildUser');

module.exports = {
    name: 'stats',
    description: 'Show check-in stats',
    options: [
        {
            name: 'user',
            description: 'User to check',
            type: ApplicationCommandOptionType.User,
            required: false,
        },
    ],

    callback: async (client, interaction) => {
        await interaction.deferReply();

        const targetUser =
            interaction.options.getUser('user') || interaction.user;
        const guildId = interaction.guild.id;
        const userLang = interaction.locale || 'en';

        try {
            const guildUser = await GuildUser.findOne({
                userId: targetUser.id,
                guildId,
            });

            const embed = new EmbedBuilder().setAuthor({
                name: `${targetUser.username}'s stats`,
                iconURL: targetUser.displayAvatarURL(),
            });

            if (!guildUser) {
                embed.setDescription('No data');
            } else {
                const streakBar =
                    '▰'.repeat(guildUser.currentStreak) +
                    '▱'.repeat(Math.max(0, 7 - guildUser.currentStreak));

                embed.addFields(
                    {
                        name: 'Total',
                        value: `${guildUser.totalCheckins}`,
                        inline: true,
                    },
                    {
                        name: 'Streak',
                        value: `${streakBar} (${guildUser.currentStreak})`,
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
