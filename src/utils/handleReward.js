const {
    ChannelType,
    PermissionFlagsBits,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
} = require('discord.js');
const Reward = require('../models/Reward');

module.exports = async (interaction, reward, guildData) => {
    const { guild, user } = interaction;

    const newReward = new Reward({
        userId: user.id,
        guildId: guild.id,
        reward,
    });
    await newReward.save();

    const admins = guildData?.adminRoles?.map(admin => ({
        id: admin,
        allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.ManageChannels,
        ],
    }));

    const channelName = `${user.username}-reward-${reward._id}`;

    const channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        permissionOverwrites: [
            {
                id: guild.id,
                deny: [PermissionFlagsBits.ViewChannel],
            },
            {
                id: user.id,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                ],
            },
            ...admins,
        ],
    });

    const closeButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`close_reward_${newReward._id}`)
            .setLabel('Закрыть канал')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🔒')
    );

    channel.send({
        content:
            `🎉 <@${user.id}> достиг(ла) отметки в ${reward.threshold} ${reward.type} чекинов!\n` +
            `<@&${guildData.adminRoleId}> Проведёт дальнейшие процедуры выдачи награды.`,
        components: [closeButton],
    });

    return channel.id;
};
