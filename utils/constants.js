module.exports.getSubAmount = function (tier) {
    switch (tier) {
        case 'BASIC':
            return 15;
            break;
        case 'PLUS':
            return 35;
            break;
        case 'MAX':
            return 55;
            break;
    }
}