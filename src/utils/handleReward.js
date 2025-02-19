const {
    ChannelType,
    PermissionFlagsBits,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
} = require('discord.js');
const Reward = require('../models/Reward');
const t = require('../utils/t');

module.exports = async (interaction, reward, guildData) => {
    const { guild, user, locale } = interaction;

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

    const channelName = `${user.username}-${reward._id}`;

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
            .setLabel('Close case')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🔒')
    );

    channel.send({
        content: t('handle_reward.message', locale, {
            threshold: reward.threshold,
            type: reward.type,
            userId: user.id,
        }),
        components: [closeButton],
    });

    return channel.id;
};
