var shippo = require('shippo')(process.env.SHIPPO);

var addressFrom = {
    "name": "Mr Hippo",
    "street1": "10771 Bellagio Rd",
    "city": "Los Angeles",
    "state": "CA",
    "zip": "90077",
    "country": "US"
};

var parcel = {
    "length": "15",
    "width": "5",
    "height": "5",
    "distance_unit": "in",
    "weight": "6",
    "mass_unit": "lb"
};


module.exports.getShipment = function (address, addy) {
    return new Promise((resolve, reject) => {

        shippo.shipment.create({
            "address_to": {
                "name": address.name,
                "street1": address.street1,
                "city": address.city,
                "state": address.state,
                "zip": address.zip,
                "country": address.country
            },
            "address_from": {
                "name": "Addy Forwarder",
                "street1": addy.street1,
                "city": addy.city,
                "state": addy.state,
                "zip": addy.zip,
                "country": "US"
            },
            "parcels": [parcel],
            "async": false
        }, function (err, shipment) {
            if (err) {
                console.log('SHIPPO ERROR')
                console.log(err)
                reject(err)
            }
            resolve(shipment)
        });
    })
}

module.exports.createTransaction = function (rate) {
    return new Promise((resolve, reject) => {
        shippo.transaction.create({
            "rate": rate,
            "label_file_type": "PDF",
            "async": false
        }, function (err, transaction) {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(transaction)
        });
    })
}
