const Guild = require('../../models/Guild');
const {
    ModalBuilder,
    TextInputBuilder,
    ActionRowBuilder,
    TextInputStyle,
    PermissionsBitField,
} = require('discord.js');

module.exports = async (client, interaction) => {
    if (!interaction.isButton()) return;

    const userLang = interaction.locale || 'en';

    if (interaction.customId.startsWith('close_reward')) {
        const { member, guild } = interaction;
        const rewardId = interaction.customId.split('_')[2];

        const guildData = await Guild.findOne({ guildId: guild.id });
        const isAdmin =
            member.permissions.has(PermissionsBitField.Flags.Administrator) ||
            guildData?.adminRoles?.some(r => member.roles.cache.has(r.roleId));

        if (!isAdmin) {
            return interaction.reply({
                content: '❌ Только администраторы могут закрывать кейсы.',
                ephemeral: true,
            });
        }

        const modal = new ModalBuilder()
            .setCustomId(`close_reward_${rewardId}`)
            .setTitle('Закрытие кейса');

        const commentInput = new TextInputBuilder()
            .setCustomId('comment')
            .setLabel('Комментарий для истории')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(commentInput));

        await interaction.showModal(modal);
    }
};
