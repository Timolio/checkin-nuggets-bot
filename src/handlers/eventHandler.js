const path = require('path');
const getAllFiles = require('../utils/getAllFiles');
const countChar = require('../utils/countChar');

module.exports = client => {
    const eventFolders = getAllFiles(path.join(__dirname, '../events'), true);

    for (const eventFolder of eventFolders) {
        const eventFiles = getAllFiles(eventFolder);
        eventFiles.sort((a, b) => countChar(a, '!') - countChar(b, '!'));

        const eventName = eventFolder.replace(/\\/g, '/').split('/').pop();

        client.on(eventName, async arg => {
            for (const eventFile of eventFiles) {
                const eventFunction = require(eventFile);
                await eventFunction(client, arg);
            }
        });
    }
};
