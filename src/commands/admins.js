const {
    ApplicationCommandOptionType,
    PermissionsBitField,
    EmbedBuilder,
    MessageFlags,
} = require('discord.js');
const Guild = require('../models/Guild');
const t = require('../utils/t');

module.exports = {
    name: 'admins',
    description:
        'Manage the bot admin roles having access to reward distribution.',
    defaultMemberPermissions: PermissionsBitField.Flags.Administrator,
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'add',
            description: 'Add a new admin role.',
            options: [
                {
                    type: ApplicationCommandOptionType.Role,
                    name: 'role',
                    description: 'Role to set.',
                    required: true,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'remove',
            description: 'Remove an admin role by its ID.',
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'id',
                    description: 'Role ID from /admins list to remove.',
                    required: true,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'list',
            description: 'View a list of all active bot admin roles.',
        },
    ],

    callback: async (client, interaction) => {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const subCommand = interaction.options.getSubcommand();
            const guildId = interaction.guild.id;
            const guildData = await Guild.findOne({ guildId });
            const userLang = interaction.locale;

            switch (subCommand) {
                case 'add':
                    const role = interaction.options.getRole('role');

                    if (guildData?.adminRoles?.includes(role.id)) {
                        return interaction.editReply({
                            content: t('admins.already', userLang),
                        });
                    }

                    await Guild.updateOne(
                        { guildId },
                        { $push: { adminRoles: role.id } },
                        { upsert: true }
                    );

                    await interaction.reply({
                        content: t('admins.added', userLang),
                    });
                    break;
                case 'remove':
                    const roleId = interaction.options.getString('id');

                    if (!guildData?.adminRoles?.includes(roleId)) {
                        return interaction.editReply({
                            content: t('admins.not_found', userLang),
                        });
                    }

                    await Guild.updateOne(
                        { guildId },
                        { $pull: { adminRoles: roleId } }
                    );

                    interaction.editReply({
                        content: t('admins.removed', userLang),
                    });

                    break;
                case 'list':
                    const roles = guildData?.adminRoles || [];

                    const embed = new EmbedBuilder()
                        .setTitle('📜')
                        .setColor('#3498db');
                    if (roles.length === 0) {
                        embed.setDescription(t('admins.empty', userLang));
                    } else {
                        const fields = roles.map(role => ({
                            name: `\`ID: ${role}\``,
                            value: `<@&${role}>`,
                            inline: false,
                        }));

                        embed.addFields(fields);
                    }
                    interaction.editReply({
                        embeds: [embed],
                    });
                    break;
            }
        } catch (error) {
            console.error('/admins error:', error);
            interaction.editReply(t('errors.generic', userLang));
        }
    },
};
