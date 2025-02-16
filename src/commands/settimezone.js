const {
    ApplicationCommandOptionType,
    MessageFlags,
    StringSelectMenuBuilder,
    ActionRowBuilder,
} = require('discord.js');
const moment = require('moment-timezone');
const User = require('../models/User');
const t = require('../utils/t');

module.exports = {
    name: 'settimezone',
    description: 'Adjust 24-hour checkin interval to suit your timezone',
    options: [
        {
            name: 'time',
            type: ApplicationCommandOptionType.String,
            description: 'Your local time (HH:mm, e.g. 15:30)',
            required: true,
        },
    ],

    callback: async (client, interaction) => {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const userLang = interaction.locale || 'en';

        try {
            const user =
                (await User.findOne({ userId: interaction.user.id })) ||
                new User({ userId: interaction.user.id });

            const now = new Date();

            if (user?.lastTimezoneChange) {
                const cooldownEnd = new Date(
                    user.lastTimezoneChange.getTime() + 24 * 60 * 60 * 1000
                );

                if (now < cooldownEnd) {
                    return interaction.editReply(
                        '🚫 Менять часовый пояс можно только **раз в 24 часа**! Попробуй позже.'
                    );
                }
            }

            const timeInput = interaction.options.getString('time');
            const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/;
            if (!timeRegex.test(timeInput)) {
                return interaction.editReply(
                    '❌ Invalid time format. Use **HH:mm** (e.g. 15:30).'
                );
            }

            const [inputHours, inputMinutes] = timeInput.split(':').map(Number);
            const userTime = inputHours * 60 + inputMinutes;

            const utcHours = now.getUTCHours();
            const utcMinutes = now.getUTCMinutes();
            const utcTime = utcHours * 60 + utcMinutes;

            let offset = userTime - utcTime;
            if (offset > 720) offset -= 1440;
            if (offset < -720) offset += 1440;

            const zones = moment.tz.names().filter(tz => {
                const zoneOffset = moment.tz(now, tz).utcOffset();
                return zoneOffset === offset;
            });

            if (zones.length === 0) {
                return interaction.editReply(
                    '❌ Не найдено подходящих часовых поясов. Проверьте время.'
                );
            }

            if (zones.length === 1) {
                user.timezone = zones[0];
                user.lastTimezoneChange = now;
                await user.save();

                return interaction.editReply(
                    t('settimezone.set', userLang, { timezone: zones[0] })
                );
            }

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('timezone-select')
                .setPlaceholder('Выберите ваш часовой пояс')
                .addOptions(
                    zones.slice(0, 25).map(zone => ({
                        label: zone.replace('_', ' '),
                        value: zone,
                    }))
                );

            const row = new ActionRowBuilder().addComponents(selectMenu);
            await interaction.editReply({
                content: t('settimezone.choose', userLang),
                components: [row],
            });
        } catch (error) {
            console.error('/settimezone error:', error);
            return interaction.editReply(t('errors.generic', userLang));
        }
    },
};
