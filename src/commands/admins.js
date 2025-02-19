const {
    ApplicationCommandOptionType,
    PermissionsBitField,
    EmbedBuilder,
} = require('discord.js');
const Guild = require('../models/Guild');

module.exports = {
    name: 'admins',
    description: '🔧 Set the role managing rewards',
    defaultMemberPermissions: PermissionsBitField.Flags.Administrator,
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'add',
            description: 'Add new admin role',
            options: [
                {
                    type: ApplicationCommandOptionType.Role,
                    name: 'role',
                    description: 'role',
                    required: true,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'remove',
            description: 'Remove admin role',
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'id',
                    description: 'Role id from /admins list',
                    required: true,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'list',
            description: 'Admin roles list',
        },
    ],

    callback: async (client, interaction) => {
        const subCommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;
        const guildData = await Guild.findOne({ guildId });

        switch (subCommand) {
            case 'add':
                const role = interaction.options.getRole('role');

                if (guildData?.adminRoles?.includes(role.id)) {
                    return interaction.reply({
                        content: '❌ Эта роль уже добавлена.',
                        ephemeral: true,
                    });
                }

                await Guild.updateOne(
                    { guildId },
                    { $push: { adminRoles: role.id } },
                    { upsert: true }
                );

                await interaction.reply({
                    content: `✅ Роль <@&${role.id}> добавлена в администраторы!`,
                    ephemeral: true,
                });
                break;
            case 'remove':
                const roleId = interaction.options.getString('id');

                if (!guildData?.adminRoles?.includes(roleId)) {
                    return interaction.reply({
                        content: '❌ Роль не найдена в списке.',
                        ephemeral: true,
                    });
                }

                await Guild.updateOne(
                    { guildId },
                    { $pull: { adminRoles: roleId } }
                );

                interaction.reply({
                    content: '✅ Роль успешно удалена!',
                    ephemeral: true,
                });

                break;
            case 'list':
                const roles = guildData?.adminRoles || [];

                const embed = new EmbedBuilder()
                    .setTitle('📜')
                    .setColor('#3498db');
                if (roles.length === 0) {
                    embed.setDescription('Список пуст');
                } else {
                    const fields = roles.map(role => ({
                        name: `\`ID: ${role}\``,
                        value: `<@&${role}>`,
                        inline: false,
                    }));

                    embed.addFields(fields);
                }
                interaction.reply({
                    embeds: [embed],
                    ephemeral: true,
                });
                break;
        }
    },
};
