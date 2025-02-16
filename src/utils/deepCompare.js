const deepCompare = (obj1, obj2, keysToCompare = []) => {
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
        return obj1 === obj2;
    }

    if (keysToCompare.length === 0) {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        keysToCompare = [...new Set([...keys1, ...keys2])];
    }

    for (const key of keysToCompare) {
        if (!deepCompare(obj1[key] || [], obj2[key] || [])) {
            return false;
        }
    }
    return true;
};

module.exports = deepCompare;
