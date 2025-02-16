const fs = require('fs');

let locales = {};

module.exports = (keyPath, lang = 'en', args = {}) => {
    if (Object.keys(locales).length === 0) {
        const languages = fs.readdirSync('./src/locales');
        languages.forEach(lang => {
            const code = lang.split('.')[0];
            locales[code] = require(`../locales/${lang}`);
        });
    }

    const languageData = locales[lang] || locales['en'];

    const keys = keyPath.split('.');

    let result = languageData;
    for (const key of keys) {
        result = result?.[key];
        if (result === undefined) break;
    }

    if (typeof result !== 'string') {
        return `[TRANSLATION MISSING: ${keyPath}]`;
    }

    return result.replace(/\{\{(\w+)\}\}/g, (match, placeholder) => {
        return args[placeholder] ?? match;
    });
};
