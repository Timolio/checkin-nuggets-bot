const { MessageFlags, EmbedBuilder } = require('discord.js');
const User = require('../models/User');
const Checkin = require('../models/Checkin');
const moment = require('moment-timezone');
const t = require('../utils/t');
const GuildUser = require('../models/GuildUser');
const Guild = require('../models/Guild');
const handleReward = require('../utils/handleReward');

module.exports = {
    name: 'checkin',
    description: 'Daily check-in',

    callback: async (client, interaction) => {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const userLang = interaction.locale;
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;

        try {
            // Проверка часового пояса
            const user = await User.findOne({ userId });
            if (!user?.timezone) {
                // Часового пояса нету = просим установить
                return interaction.editReply(
                    t('checkin.no_timezone', userLang)
                );
            }

            // Проверка последнего чекина
            let guildUser = await GuildUser.findOne({
                userId,
                guildId,
            });
            if (guildUser?.lastCheckin) {
                // Последний чекин есть = проверяем сделан ли он не сегодня
                const lastCheckinLocal = moment(guildUser.lastCheckin).tz(
                    user.timezone
                );
                const nowLocal = moment().tz(user.timezone);

                console.log(lastCheckinLocal, nowLocal);

                if (lastCheckinLocal.isSame(nowLocal, 'day')) {
                    // Чекин уже сделан сегодня = уведомляем пользователя
                    return interaction.editReply(
                        t('checkin.already_done', userLang)
                    );
                }

                // Чекин сделан не сегодня = проверяем страйковость чекина
                const yesterday = nowLocal.clone().subtract(1, 'day');
                var isStreak = lastCheckinLocal.isSame(yesterday, 'day');
            }

            // Обновляем данные пользователя о чекинах
            const updateData = {
                $set: { lastCheckin: new Date() },
                $inc: { totalCheckins: 1 },
            };

            if (guildUser?.lastCheckin && isStreak) {
                updateData.$inc.currentStreak = 1;
            } else {
                updateData.$set.currentStreak = 1;
            }

            guildUser = await GuildUser.findOneAndUpdate(
                { userId, guildId },
                updateData,
                {
                    new: true,
                    upsert: true,
                }
            );

            // Сохраняем чекин в историю
            await new Checkin({
                userId: interaction.user.id,
                guildId: interaction.guildId,
                timestamp: new Date(),
            }).save();

            // Проверяем условия наград сервера
            const guildData = await Guild.findOne({ guildId });
            console.log(guildData);
            if (!guildData?.rewards?.length) return;

            for (const reward of guildData.rewards) {
                const currentValue =
                    guildUser[
                        reward.type === 'streak'
                            ? 'currentStreak'
                            : 'totalCheckins'
                    ];

                if (currentValue === reward.threshold) {
                    const channelId = await handleReward(
                        interaction,
                        reward,
                        guildData
                    );

                    const message =
                        reward.type === 'streak'
                            ? t('checkin.reward.streak', userLang, {
                                  channelId,
                                  treak: guildUser.currentStreak,
                              })
                            : t('checkin.reward.total', userLang, {
                                  channelId,
                                  total: guildUser.totalCheckins,
                              });
                    return interaction.editReply(message);
                }
            }

            // Уведомляем об успешном чекине
            interaction.editReply(
                t('checkin.success', userLang, {
                    streak: guildUser.currentStreak,
                })
            );
        } catch (error) {
            console.error('/checkin error:', error);
            interaction.editReply(t('errors.generic', userLang));
        }
    },
};
