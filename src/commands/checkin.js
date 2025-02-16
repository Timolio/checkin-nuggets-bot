const { MessageFlags } = require('discord.js');
const User = require('../models/User');
const Checkin = require('../models/Checkin');
const moment = require('moment-timezone');
const t = require('../utils/t');
const GuildUser = require('../models/GuildUser');

module.exports = {
    name: 'checkin',
    description: 'Daily check-in',

    callback: async (client, interaction) => {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const userLang = interaction.locale || 'en';
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;

        try {
            const user = await User.findOne({ userId });
            if (!user?.timezone) {
                return interaction.editReply(
                    t('checkin.no_timezone', userLang)
                );
            }

            let guildUser = await GuildUser.findOne({
                userId,
                guildId,
            });
            if (guildUser?.lastCheckin) {
                const lastCheckinLocal = moment(guildUser.lastCheckin).tz(
                    user.timezone
                );
                const nowLocal = moment().tz(user.timezone);

                if (lastCheckinLocal.isSame(nowLocal, 'day')) {
                    return interaction.editReply(
                        t('checkin.already_done', userLang)
                    );
                }

                const yesterday = nowLocal.clone().subtract(1, 'day');
                var isStreak = lastCheckinLocal.isSame(yesterday, 'day');
            }

            const updateData = {
                $set: { lastCheckin: new Date() },
                $inc: { totalCheckins: 1 },
            };

            if (guildUser?.lastCheckin && isStreak) {
                updateData.$inc.currentStreak = 1;
            } else {
                updateData.$set.currentStreak = 1;
            }

            await GuildUser.findOneAndUpdate({ userId, guildId }, updateData, {
                new: true,
                upsert: true,
            });

            await new Checkin({
                userId: interaction.user.id,
                guildId: interaction.guildId,
                timestamp: new Date(),
            }).save();

            interaction.editReply(t('checkin.success', userLang));
        } catch (error) {
            console.error('/checkin error:', error);
            return interaction.editReply(t('errors.generic', userLang));
        }
    },
};
