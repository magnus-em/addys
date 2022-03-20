module.exports.getSubAmount = function (tier) {
    switch (tier) {
        case 'BASIC':
            return 1;
            break;
        case 'PLUS':
            return 2;
            break;
        case 'MAX':
            return 3;
            break;
    }
}