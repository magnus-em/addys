const ApiContracts = require('authorizenet').APIContracts;
const ApiControllers = require('authorizenet').APIControllers;
const SDKConstants = require('authorizenet').Constants;

const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
merchantAuthenticationType.setName(process.env.AUTHORIZE_LOGIN_ID);
merchantAuthenticationType.setTransactionKey(process.env.AUTHORIZE_TRX_KEY);

module.exports.initialAccountCharge = function (details) {
	return new Promise((resolve, reject) => {
		// const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
		// merchantAuthenticationType.setName(process.env.AUTHORIZE_LOGIN_ID);
		// merchantAuthenticationType.setTransactionKey(process.env.AUTHORIZE_TRX_KEY);

		const creditCard = new ApiContracts.CreditCardType();
		creditCard.setCardNumber(details.cardNumber);
		creditCard.setCardCode(details.cvv)
		creditCard.setExpirationDate(details.cardExp);

		const paymentType = new ApiContracts.PaymentType();
		paymentType.setCreditCard(creditCard);

		const orderDetails = new ApiContracts.OrderType();
		orderDetails.setInvoiceNumber('basic-1');
		orderDetails.setDescription('Inital non-recurring subscription charge');


		const billTo = new ApiContracts.CustomerAddressType();
		billTo.setFirstName(details.firstName);
		billTo.setLastName(details.lastName);
		billTo.setAddress(details.street1 + " " + details.street2);
		billTo.setCity(details.city);
		billTo.setState(details.state);
		billTo.setZip(details.zip);
		billTo.setCountry('USA');

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
		transactionRequestType.setAmount(details.amount);
		transactionRequestType.setOrder(orderDetails);
		transactionRequestType.profile
		transactionRequestType.setBillTo(billTo);
		// transactionRequestType.setShipTo(shipTo);
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

module.exports.chargeRate = function (details, customerProfileId, customerPaymentProfileId) {
	return new Promise((resolve, reject) => {

		var profileToCharge = new ApiContracts.CustomerProfilePaymentType();
		profileToCharge.setCustomerProfileId(customerProfileId);

		var paymentProfile = new ApiContracts.PaymentProfile();
		paymentProfile.setPaymentProfileId(customerPaymentProfileId);
		profileToCharge.setPaymentProfile(paymentProfile);

		var orderDetails = new ApiContracts.OrderType();
		orderDetails.setInvoiceNumber('none');

		var lineItem_id1 = new ApiContracts.LineItemType();
		lineItem_id1.setItemId('1');
		lineItem_id1.setName('forward fee');
		lineItem_id1.setDescription('forward fee');
		lineItem_id1.setQuantity('1');
		lineItem_id1.setUnitPrice('19.99');

		var lineItem_id2 = new ApiContracts.LineItemType();
		lineItem_id2.setItemId('2');
		lineItem_id2.setName('shipping label');
		lineItem_id2.setDescription(details.rate.servicelevel.token);
		lineItem_id2.setQuantity('1');
		lineItem_id2.setUnitPrice(details.rate.amount);

		var lineItemList = [];
		lineItemList.push(lineItem_id1);
		lineItemList.push(lineItem_id2);

		var lineItems = new ApiContracts.ArrayOfLineItem();
		lineItems.setLineItem(lineItemList);

		var shipTo = new ApiContracts.CustomerAddressType();
		shipTo.setFirstName(details.shipment.address_to.name);
		shipTo.setAddress(details.shipment.address_to.street1 + ' ' + details.shipment.address_to.street2);
		shipTo.setCity(details.shipment.address_to.city);
		shipTo.setState(details.shipment.address_to.state);
		shipTo.setZip(details.shipment.address_to.zip);
		shipTo.setCountry(details.shipment.address_to.country);

		var transactionRequestType = new ApiContracts.TransactionRequestType();
		transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
		transactionRequestType.setProfile(profileToCharge);
		transactionRequestType.setAmount(details.rate.amount);
		transactionRequestType.setLineItems(lineItems);
		transactionRequestType.setOrder(orderDetails);
		transactionRequestType.setShipTo(shipTo);

		var createRequest = new ApiContracts.CreateTransactionRequest();
		createRequest.setMerchantAuthentication(merchantAuthenticationType);
		createRequest.setTransactionRequest(transactionRequestType);

		//pretty print request
		console.log(JSON.stringify(createRequest.getJSON(), null, 2));

		var ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());
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
				reject(null)

			}

		});

	})

}

module.exports.createCustFromTrx = function (details, transactionId) {

	// var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
	// merchantAuthenticationType.setName(process.env.AUTHORIZE_LOGIN_ID);
	// merchantAuthenticationType.setTransactionKey(process.env.AUTHORIZE_TRX_KEY);

	var customerProfileType = new ApiContracts.CustomerProfileType();
	customerProfileType.setMerchantCustomerId(client.shortId);
	customerProfileType.setEmail(client.email)


	var createRequest = new ApiContracts.CreateCustomerProfileFromTransactionRequest();
	createRequest.setCustomer(customerProfileType)
	createRequest.setTransId(transactionId);
	createRequest.setMerchantAuthentication(merchantAuthenticationType);

	console.log(JSON.stringify(createRequest.getJSON(), null, 2));

	var ctrl = new ApiControllers.CreateCustomerProfileFromTransactionController(createRequest.getJSON());

	ctrl.setEnvironment(SDKConstants.endpoint.production);


	ctrl.execute(function () {

		var apiResponse = ctrl.getResponse();

		var response = new ApiContracts.CreateCustomerProfileResponse(apiResponse);
		console.log(JSON.stringify(response.getJSON(), null, 2));

		if (response != null) {
			if (response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
				console.log('Successfully created a customer payment profile with id: ' + response.getCustomerProfileId() +
					' from a transaction : ' + transactionId);
			}
			else {
				//console.log(JSON.stringify(response));
				//console.log('Result Code: ' + response.getMessages().getResultCode());
				console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
				console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
			}
		}
		else {
			console.log('Null response received');
		}


	});
}

module.exports.createCustomerProfileNoPayment = function (details) {

	return new Promise((resolve, reject) => {

		// const creditCard = new ApiContracts.CreditCardType();
		// creditCard.setCardNumber(details.cardNumber);
		// creditCard.setExpirationDate(details.cardExp);
		// creditCard.setCardCode(details.cvv)

		// const paymentType = new ApiContracts.PaymentType();
		// paymentType.setCreditCard(creditCard);

		const customerAddress = new ApiContracts.CustomerAddressType();
		customerAddress.setFirstName(details.firstName);
		customerAddress.setLastName(details.lastName);
		customerAddress.setAddress(details.street1 + " " + details.street2);
		customerAddress.setCity(details.city);
		customerAddress.setState(details.state);
		customerAddress.setZip(details.zip);
		customerAddress.setCountry('USA');


		// const customerPaymentProfileType = new ApiContracts.CustomerPaymentProfileType();
		// customerPaymentProfileType.setCustomerType(ApiContracts.CustomerTypeEnum.INDIVIDUAL);
		// customerPaymentProfileType.setPayment(paymentType);
		// customerPaymentProfileType.setBillTo(customerAddress);
		// customerPaymentProfileType.setDefaultPaymentProfile = true;

		// var paymentProfilesList = [];
		// paymentProfilesList.push(customerPaymentProfileType);

		var customerProfileType = new ApiContracts.CustomerProfileType();
		customerProfileType.setMerchantCustomerId(details.client.shortId);
		customerProfileType.setDescription('Profile description here');
		customerProfileType.setEmail(details.client.email);

		var createRequest = new ApiContracts.CreateCustomerProfileRequest();
		createRequest.setProfile(customerProfileType);
		createRequest.setMerchantAuthentication(merchantAuthenticationType);


		// console.log(JSON.stringify(createRequest.getJSON(), null, 2));



		var ctrl = new ApiControllers.CreateCustomerProfileController(createRequest.getJSON());

		ctrl.setEnvironment(SDKConstants.endpoint.production);


		ctrl.execute(function () {

			var apiResponse = ctrl.getResponse();

			var response = new ApiContracts.CreateCustomerProfileResponse(apiResponse);

			//pretty print response
			console.log(JSON.stringify(response, null, 2));

			if (response != null) {
				if (response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
					console.log('Successfully `create`d a customer profile with id: ' + response.getCustomerProfileId());
					resolve({ success: true, id: response.getCustomerProfileId() })
				}
				else {
					console.log('Result Code: ' + response.getMessages().getResultCode());
					console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
					console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
					reject({ success: false, id: response.getMessages().getResultCode() })
				}
			}
			else {
				console.log('Null response received');
				reject({ success: false, id: 'null response received' })

			}

		});

	})

}

module.exports.createCustomerProfile = function (details) {

	return new Promise((resolve, reject) => {

		const creditCard = new ApiContracts.CreditCardType();
		creditCard.setCardNumber(details.cardNumber);
		creditCard.setExpirationDate(details.cardExp);
		creditCard.setCardCode(details.cvv)

		const paymentType = new ApiContracts.PaymentType();
		paymentType.setCreditCard(creditCard);

		const customerAddress = new ApiContracts.CustomerAddressType();
		customerAddress.setFirstName(details.firstName);
		customerAddress.setLastName(details.lastName);
		customerAddress.setAddress(details.street1 + " " + details.street2);
		customerAddress.setCity(details.city);
		customerAddress.setState(details.state);
		customerAddress.setZip(details.zip);
		customerAddress.setCountry('USA');


		const customerPaymentProfileType = new ApiContracts.CustomerPaymentProfileType();
		customerPaymentProfileType.setCustomerType(ApiContracts.CustomerTypeEnum.INDIVIDUAL);
		customerPaymentProfileType.setPayment(paymentType);
		customerPaymentProfileType.setBillTo(customerAddress);
		customerPaymentProfileType.setDefaultPaymentProfile = true;

		var paymentProfilesList = [];
		paymentProfilesList.push(customerPaymentProfileType);

		var customerProfileType = new ApiContracts.CustomerProfileType();
		customerProfileType.setMerchantCustomerId(details.client.shortId);
		customerProfileType.setDescription('Profile description here');
		customerProfileType.setEmail(details.client.email);
		customerProfileType.setPaymentProfiles(paymentProfilesList);

		var createRequest = new ApiContracts.CreateCustomerProfileRequest();
		createRequest.setProfile(customerProfileType);
		createRequest.setValidationMode(ApiContracts.ValidationModeEnum.TESTMODE);
		createRequest.setMerchantAuthentication(merchantAuthenticationType);


		// console.log(JSON.stringify(createRequest.getJSON(), null, 2));



		var ctrl = new ApiControllers.CreateCustomerProfileController(createRequest.getJSON());

		ctrl.setEnvironment(SDKConstants.endpoint.production);


		ctrl.execute(function () {

			var apiResponse = ctrl.getResponse();

			var response = new ApiContracts.CreateCustomerProfileResponse(apiResponse);

			//pretty print response
			console.log(JSON.stringify(response, null, 2));

			if (response != null) {
				if (response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
					console.log('Successfully created a customer profile with id: ' + response.getCustomerProfileId());
					resolve({ success: true, id: response.getCustomerProfileId() })
				}
				else {
					console.log('Result Code: ' + response.getMessages().getResultCode());
					console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
					console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
					reject({ success: false, id: response.getMessages().getResultCode() })
				}
			}
			else {
				console.log('Null response received');
				reject({ success: false, id: 'null response received' })

			}

		});

	})

}

module.exports.getCustomerProfile = function (customerProfileId) {

	// var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
	// merchantAuthenticationType.setName(process.env.AUTHORIZE_LOGIN_ID);
	// merchantAuthenticationType.setTransactionKey(process.env.AUTHORIZE_TRX_KEY);

	var getRequest = new ApiContracts.GetCustomerProfileRequest();
	getRequest.setCustomerProfileId(customerProfileId)
	getRequest.setMerchantAuthentication(merchantAuthenticationType);

	//pretty print request
	console.log(JSON.stringify(getRequest.getJSON(), null, 2));

	var ctrl = new ApiControllers.GetCustomerProfileController(getRequest.getJSON());

	ctrl.setEnvironment(SDKConstants.endpoint.production);


	ctrl.execute(function () {

		var apiResponse = ctrl.getResponse();

		var response = new ApiContracts.GetCustomerProfileResponse(apiResponse);

		//pretty print response
		console.log(JSON.stringify(response, null, 2));

		if (response != null) {
			if (response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
				console.log('Customer profile ID : ' + response.getProfile().getCustomerProfileId());
				console.log('response.getProfile() : ' + response.getProfile());
				console.log('Customer Email : ' + response.getProfile().getEmail());
				console.log('Description : ' + response.getProfile().getDescription());
			}
			else {
				//console.log('Result Code: ' + response.getMessages().getResultCode());
				console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
				console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
			}
		}
		else {
			console.log('Null response received');
		}

	});
}

module.exports.getCustomerProfileIds = function () {

	// var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
	// merchantAuthenticationType.setName(process.env.AUTHORIZE_LOGIN_ID);
	// merchantAuthenticationType.setTransactionKey(process.env.AUTHORIZE_TRX_KEY);

	var getRequest = new ApiContracts.GetCustomerProfileIdsRequest();
	getRequest.setMerchantAuthentication(merchantAuthenticationType);

	//pretty print request
	//console.log(JSON.stringify(getRequest.getJSON(), null, 2));

	var ctrl = new ApiControllers.GetCustomerProfileIdsController(getRequest.getJSON());

	ctrl.setEnvironment(SDKConstants.endpoint.production);


	ctrl.execute(function () {

		var apiResponse = ctrl.getResponse();

		var response = new ApiContracts.GetCustomerProfileIdsResponse(apiResponse);

		//pretty print response
		//console.log(JSON.stringify(response, null, 2));

		if (response != null) {
			if (response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
				console.log('List of Customer profile Ids : ');
				var profileIds = response.getIds().getNumericString();
				for (var i = 0; i < profileIds.length; i++) {
					console.log(profileIds[i].toString());
				}
			}
			else {
				//console.log('Result Code: ' + response.getMessages().getResultCode());
				console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
				console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
			}
		}
		else {
			console.log('Null response received');
		}

	});
}

module.exports.deleteCustomerProfile = function (customerProfileId) {

	// var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
	// merchantAuthenticationType.setName(process.env.AUTHORIZE_LOGIN_ID);
	// merchantAuthenticationType.setTransactionKey(process.env.AUTHORIZE_TRX_KEY);

	var deleteRequest = new ApiContracts.DeleteCustomerProfileRequest();
	deleteRequest.setMerchantAuthentication(merchantAuthenticationType);
	deleteRequest.setCustomerProfileId(customerProfileId);

	//pretty print request
	//console.log(JSON.stringify(createRequest.getJSON(), null, 2));

	var ctrl = new ApiControllers.DeleteCustomerProfileController(deleteRequest.getJSON());
	ctrl.setEnvironment(SDKConstants.endpoint.production);


	ctrl.execute(function () {

		var apiResponse = ctrl.getResponse();

		var response = new ApiContracts.DeleteCustomerProfileResponse(apiResponse);

		//pretty print response
		//console.log(JSON.stringify(response, null, 2));

		if (response != null) {
			if (response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
				console.log('Successfully deleted a customer profile with id: ' + customerProfileId);
			}
			else {
				//console.log('Result Code: ' + response.getMessages().getResultCode());
				console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
				console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
			}
		}
		else {
			console.log('Null response received');
		}

	});
}

module.exports.getCustomerPaymentProfile = function (customerProfileId, customerPaymentId) {
	return new Promise((resolve, reject) => {

		var getRequest = new ApiContracts.GetCustomerPaymentProfileRequest();
		getRequest.setMerchantAuthentication(merchantAuthenticationType);
		getRequest.setCustomerProfileId(customerProfileId);
		getRequest.setCustomerPaymentProfileId(customerPaymentId);


		var ctrl = new ApiControllers.GetCustomerProfileController(getRequest.getJSON());

		ctrl.setEnvironment(SDKConstants.endpoint.production);


		ctrl.execute(function () {

			var apiResponse = ctrl.getResponse();

			var response = new ApiContracts.GetCustomerPaymentProfileResponse(apiResponse);

			//pretty print response
			console.log(JSON.stringify(response, null, 2));

			if (response != null) {
				if (response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
					console.log('Customer Payment Profile ID : ' + response.getPaymentProfile().getCustomerPaymentProfileId());
					console.log('Customer Name : ' + response.getPaymentProfile().getBillTo().getFirstName() + ' ' +
						response.getPaymentProfile().getBillTo().getLastName());
					console.log('Address : ' + response.getPaymentProfile().getBillTo().getAddress());
					resolve(response)
				}
				else {
					//console.log('Result Code: ' + response.getMessages().getResultCode());
					console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
					console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
					reject(response)
				}
			}
			else {
				console.log('Null response received');
				reject(null)
			}
		});
	})

}

module.exports.createCustomerPaymentProfile = function (details, profileId, setDefault) {
	return new Promise((resolve, reject) => {
		const creditCard = new ApiContracts.CreditCardType();
		creditCard.setCardNumber(details.cardNumber);
		creditCard.setExpirationDate(details.cardExp);
		creditCard.setCardCode(details.cvv)

		const paymentType = new ApiContracts.PaymentType();
		paymentType.setCreditCard(creditCard);

		const customerAddress = new ApiContracts.CustomerAddressType();
		customerAddress.setFirstName(details.firstName);
		customerAddress.setLastName(details.lastName);
		customerAddress.setAddress(details.street1 + " " + details.street2);
		customerAddress.setCity(details.city);
		customerAddress.setState(details.state);
		customerAddress.setZip(details.zip);
		customerAddress.setCountry('USA');


		var profile = new ApiContracts.CustomerPaymentProfileType();
		profile.setBillTo(customerAddress);
		profile.setPayment(paymentType);
		profile.setDefaultPaymentProfile(setDefault);

		var createRequest = new ApiContracts.CreateCustomerPaymentProfileRequest();

		createRequest.setMerchantAuthentication(merchantAuthenticationType);
		createRequest.setCustomerProfileId(profileId);
		createRequest.setPaymentProfile(profile);

		//pretty print request
		//console.log(JSON.stringify(createRequest.getJSON(), null, 2));

		var ctrl = new ApiControllers.CreateCustomerPaymentProfileController(createRequest.getJSON());

		ctrl.setEnvironment(SDKConstants.endpoint.production);


		ctrl.execute(function () {

			var apiResponse = ctrl.getResponse();

			var response = new ApiContracts.CreateCustomerPaymentProfileResponse(apiResponse);

			//pretty print response
			console.log(JSON.stringify(response, null, 2));

			if (response != null) {
				if (response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
					console.log('createCustomerPaymentProfile: Successfully created a customer payment profile with id: ' + response.getCustomerPaymentProfileId());
					resolve(response)
				}
				else {
					console.log('Result Code: ' + response.getMessages().getResultCode());
					console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
					console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
					reject(response)
				}
			}
			else {
				console.log('Null response received');
				reject(null)
			}
		});
	})
}

module.exports.deleteCustomerPaymentProfile = function (customerProfileId, customerPaymentProfileId) {
	return new Promise((resolve, reject) => {
		var deleteRequest = new ApiContracts.DeleteCustomerPaymentProfileRequest();
		deleteRequest.setMerchantAuthentication(merchantAuthenticationType);
		deleteRequest.setCustomerProfileId(customerProfileId);
		deleteRequest.setCustomerPaymentProfileId(customerPaymentProfileId);



		var ctrl = new ApiControllers.DeleteCustomerPaymentProfileController(deleteRequest.getJSON());

		ctrl.setEnvironment(SDKConstants.endpoint.production);


		ctrl.execute(function () {

			var apiResponse = ctrl.getResponse();

			var response = new ApiContracts.DeleteCustomerPaymentProfileResponse(apiResponse);

			//pretty print response
			console.log(JSON.stringify(response, null, 2));

			if (response != null) {
				if (response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
					console.log('Successfully deleted a customer payment profile with id: ' + customerPaymentProfileId);
					resolve(response)
				}
				else {
					//console.log('Result Code: ' + response.getMessages().getResultCode());
					console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
					console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
					reject(response)
				}
			}
			else {
				console.log('Null response received');
				reject(null)
			}

		});
	})
}