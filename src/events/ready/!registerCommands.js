const { testServer } = require('../../../config.json');
const deepCompare = require('../../utils/deepCompare');
const getApplicationCommands = require('../../utils/getApplicationCommands');
const getLocalCommands = require('../../utils/getLocalCommands');

module.exports = async client => {
    try {
        const localCommands = getLocalCommands();
        const applicationCommands = await getApplicationCommands(
            client,
            testServer
        );
        console.log('⌛ Starting to synchronize commands...');

        for (const localCommand of localCommands) {
            const {
                name,
                description,
                defaultMemberPermissions,
                options,
                deleted,
            } = localCommand;

            const existingCommand = await applicationCommands.cache.find(
                command => command.name === name
            );

            if (existingCommand) {
                if (deleted) {
                    await applicationCommands.delete(existingCommand.id);
                    console.log(`🚮 Deleted command /${name}`);
                    continue;
                }

                if (
                    !deepCompare(localCommand, existingCommand, [
                        'description',
                        'options',
                        'defaultMemberPermissions',
                    ])
                ) {
                    await applicationCommands.edit(existingCommand.id, {
                        description,
                        defaultMemberPermissions,
                        options: options || [],
                    });
                    console.log(`✅ Updated command /${name}`);
                }
            } else {
                if (deleted) {
                    console.log(
                        `⏩ Skipped command /${name} as it's set to be deleted`
                    );
                    continue;
                }

                await applicationCommands.create({
                    name,
                    description,
                    defaultMemberPermissions,
                    options: options || [],
                });

                console.log(`✅ Registered command /${name}`);
            }
        }

        console.log('✅ Commands successfully synchronized!');
    } catch (error) {
        console.error(`❌ There was an error: ${error}`);
    }
};
