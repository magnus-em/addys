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

module.exports.getTierQuota = function (tier) {
    switch (tier) {
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
            return 18.99;
            break;
        case 'MAX':
            return 17.99;
            break;
    }
}