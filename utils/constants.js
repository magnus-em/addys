module.exports.getSubAmount = function (tier) {
    switch (tier) {
        case 'BASIC':
            return process.env.BASIC_SUB_AMOUNT;
            break;
        case 'PLUS':
            return process.env.PLUS_SUB_AMOUNT;
            break;
        case 'MAX':
            return process.env.MAX_SUB_AMOUNT;
            break;
        case 'NONE':
            return 0;
            break;
    }
}

module.exports.getTierQuota = function (tier) {
    switch (tier) {
        case 'NONE':
            return 0;
            break;
        case 'BASIC':
            return 10;
            break;
        case 'PLUS':
            return 25;
            break;
        case 'MAX':
            return 1000;
            break;
    }
}

module.exports.getTierForwardFee = function (tier) {
    switch (tier) {
        case 'BASIC':
            return 19.99;
            break;
        case 'PLUS':
            return 19.99;
            break;
        case 'MAX':
            return 19.99;
            break;
    }
}