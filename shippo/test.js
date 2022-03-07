var shippo = require('shippo')(process.env.SHIPPO_TEST);


var addressFrom  = {
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
    "length": "5",
    "width": "5",
    "height": "5",
    "distance_unit": "in",
    "weight": "6",
    "mass_unit": "lb"
};

let savedShipment = null;

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

module.exports.getShipment = function () {
    return new Promise((resolve,reject) => {
        if (savedShipment) {
            resolve(savedShipment)
        }
        shippo.shipment.create({
            "address_from": addressFrom,
            "address_to": addressTo,
            "parcels": [parcel],
            "async": false
        }, function(err, shipment){
            if (err) {
                console.log('SHIPPO ERROR')
                console.log(err)
                reject(err)
            }
            console.log('in shipment generator')
            console.log(shipment)
            savedShipment = shipment;
            resolve(shipment)
        });
    })
}

// genRates = async () => {
//     shippo.shipment.create({
//         "address_from": addressFrom,
//         "address_to": addressTo,
//         "parcels": [parcel],
//         "async": false
//     }, function(err, shipment){
//         if (err) {
//             console.log('SHIPPO ERROR')
//             console.log(err)
//             return
//         }
//         console.log('in rates generator')
//         console.log(shipment.rates)
//         return shipment.rates
//     });
// }

