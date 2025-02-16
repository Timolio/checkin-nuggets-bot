const User = require('../../models/User');
const t = require('../../utils/t');

module.exports = async (client, interaction) => {
    if (!interaction.isStringSelectMenu()) return;

    const userLang = interaction.locale || 'en';

    if (interaction.customId === 'timezone-select') {
        if (!interaction.values[0]) return;

        await User.findOneAndUpdate(
            { userId: interaction.user.id },
            {
                timezone: interaction.values[0],
                lastTimezoneChange: new Date(),
            },
            { upsert: true }
        );
        await interaction.update({
            content: t('settimezone.set', userLang, {
                timezone: interaction.values[0],
            }),
            components: [],
        });
    }
};
