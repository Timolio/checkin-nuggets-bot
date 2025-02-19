const Reward = require('../../models/Reward');

module.exports = async (client, interaction) => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId.startsWith('close_reward')) {
        await interaction.deferReply({ ephemeral: true });

        const rewardId = interaction.customId.split('_')[2];

        const comment = interaction.fields.getTextInputValue('comment');

        try {
            await Reward.findOneAndUpdate(
                { _id: rewardId },
                {
                    $set: {
                        comment,
                        closedBy: interaction.user.id,
                        closedAt: new Date(),
                    },
                }
            );

            await interaction.channel.delete().catch(() => {});
        } catch (error) {
            console.error('Error:', error);
        }
    }
};
