const ApiContracts = require('authorizenet').APIContracts;
const ApiControllers = require('authorizenet').APIControllers;
const SDKConstants = require('authorizenet').Constants;

module.exports.chargeCreditCard = function (details) {
    return new Promise((resolve, reject) => {
        const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
        merchantAuthenticationType.setName(process.env.AUTHORIZE_LOGIN_ID);
        merchantAuthenticationType.setTransactionKey(process.env.AUTHORIZE_TRX_KEY);

        const creditCard = new ApiContracts.CreditCardType();
        creditCard.setCardNumber('5444483542431540');
        creditCard.setExpirationDate('0722');

        const paymentType = new ApiContracts.PaymentType();
        paymentType.setCreditCard(creditCard);

        const orderDetails = new ApiContracts.OrderType();
        orderDetails.setInvoiceNumber('FW-1');
        orderDetails.setDescription('Forward request');


        // const customer = new ApiContracts.CustomerDataType();
        // customer.setId(details.user._id);
        // customer.setEmail(details.user.email)


        const shipping = new ApiContracts.ExtendedAmountType();
        shipping.setAmount('14.55');
        shipping.setName(details.rate.servicelevel.token);
        shipping.setDescription('description field');

        const billTo = new ApiContracts.CustomerAddressType();
        billTo.setFirstName('Magnus');
        billTo.setLastName('Melbourne');
        billTo.setAddress('309 N Pearl St Apt 2');
        billTo.setCity('Ellensburg');
        billTo.setState('WA');
        billTo.setZip('98926');
        billTo.setCountry('USA');

        const shipTo = new ApiContracts.CustomerAddressType();
        shipTo.setFirstName('Magnus');
        shipTo.setLastName('Melbourne');
        shipTo.setAddress('309 N Pearl St Apt 2');
        shipTo.setCity('Ellensburg');
        shipTo.setState('WA');
        shipTo.setZip('98926');
        shipTo.setCountry('USA');

        var lineItem_id1 = new ApiContracts.LineItemType();
        lineItem_id1.setItemId('forward');
        lineItem_id1.setName('forward');
        lineItem_id1.setDescription('forward fee');
        lineItem_id1.setQuantity('1');
        lineItem_id1.setUnitPrice(19.99);

        var lineItem_id2 = new ApiContracts.LineItemType();
        lineItem_id2.setItemId('label');
        lineItem_id2.setName(details.rate.servicelevel.token);
        lineItem_id2.setDescription('shipping service for label');
        lineItem_id2.setQuantity('1');
        lineItem_id2.setUnitPrice(details.rate.amount);


        var lineItemList = [];
        lineItemList.push(lineItem_id1);
        lineItemList.push(lineItem_id2);


        var lineItems = new ApiContracts.ArrayOfLineItem();
        lineItems.setLineItem(lineItemList);





        var transactionSetting1 = new ApiContracts.SettingType();
        transactionSetting1.setSettingName('duplicateWindow');
        transactionSetting1.setSettingValue('120');

        var transactionSetting2 = new ApiContracts.SettingType();
        transactionSetting2.setSettingName('recurringBilling');
        transactionSetting2.setSettingValue('false');

        var transactionSettingList = [];
        transactionSettingList.push(transactionSetting1);
        transactionSettingList.push(transactionSetting2);

        var transactionSettings = new ApiContracts.ArrayOfSetting();
        transactionSettings.setSetting(transactionSettingList);

        var transactionRequestType = new ApiContracts.TransactionRequestType();
        transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
        transactionRequestType.setPayment(paymentType);
        transactionRequestType.setAmount('1');
        transactionRequestType.setLineItems(lineItems);
        transactionRequestType.setOrder(orderDetails);
        transactionRequestType.setShipping(shipping);
        transactionRequestType.setBillTo(billTo);
        transactionRequestType.setShipTo(shipTo);
        // transactionRequestType.setCustomer(customer)
        transactionRequestType.setTransactionSettings(transactionSettings);

        var createRequest = new ApiContracts.CreateTransactionRequest();
        createRequest.setMerchantAuthentication(merchantAuthenticationType);
        createRequest.setTransactionRequest(transactionRequestType);

        //pretty print request
        console.log(JSON.stringify(createRequest.getJSON(), null, 2));

        var ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());
        //Defaults to sandbox
        ctrl.setEnvironment(SDKConstants.endpoint.production);

        ctrl.execute(function () {

            var apiResponse = ctrl.getResponse();

            var response = new ApiContracts.CreateTransactionResponse(apiResponse);

            //pretty print response
            console.log(JSON.stringify(response, null, 2));

            if (response != null) {
                if (response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
                    if (response.getTransactionResponse().getMessages() != null) {
                        console.log('Successfully created transaction with Transaction ID: ' + response.getTransactionResponse().getTransId());
                        console.log('Response Code: ' + response.getTransactionResponse().getResponseCode());
                        console.log('Message Code: ' + response.getTransactionResponse().getMessages().getMessage()[0].getCode());
                        console.log('Description: ' + response.getTransactionResponse().getMessages().getMessage()[0].getDescription());
                        resolve(response)
                    }
                    else {
                        console.log('Failed Transaction.');
                        if (response.getTransactionResponse().getErrors() != null) {
                            console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
                            console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
                            reject(response)

                        }
                    }
                }
                else {
                    console.log('Failed Transaction. ');
                    if (response.getTransactionResponse() != null && response.getTransactionResponse().getErrors() != null) {

                        console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
                        console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
                        reject(response)

                    }
                    else {
                        console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
                        console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
                        reject(response)

                    }
                }
            }
            else {
                console.log('Null Response.');
                reject(response)
            }

            console.log(response);
        });




    })
}


