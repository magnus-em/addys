var shippo = require('shippo')(process.env.SHIPPO_TEST);


var addressFrom = {
    "name": "Shawn Ippotle",
    "street1": "1127 Evergreen Point Rd",
    "city": "Medina",
    "state": "WA",
    "zip": "98039",
    "country": "US"
};

var addressTo = {
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


// shippo.shipment.create({
//     "address_from": addressFrom,
//     "address_to": addressTo,
//     "parcels": [parcel],
//     "async": false
// }, function(err, shipment){

//     if (err) {
//         console.log('ERROR')
//         console.log(err)
//     }
//     createTransaction(shipment);
// });

// function createTransaction(shipment) {
//     let rate = null;
//     for (let r of shipment.rates) {
//         if (r.attributes.includes('CHEAPEST')) {
//             console.log('cheapest rate: ')
//             console.log(r)
//             rate = r
//         }
//     }

//     shippo.transaction.create({
//         "rate": rate.object_id,
//         "label_file_type": "PDF",
//         "async": false
//     }, function(err, transaction) {
//        console.log(err)
//        console.log('TRANSACTION')
//        console.log(transaction)
//     });
// }

module.exports.getShipment = function (address) {
    return new Promise((resolve, reject) => {

        shippo.shipment.create({
            "address_from": {
                "name": address.name,
                "street1": address.street1,
                "city": address.city,
                "state": address.state,
                "zip": address.zip,
                "country": address.country
            },
            "address_to": addressTo,
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

// module.exports.getRate = function (rate) {
//     return new Promise((resolve, reject) => {
//         resolve()
//     })
// }
