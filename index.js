const dropboxV2Api = require('dropbox-v2-api');
const Hapi = require('@hapi/hapi');
const fs = require('fs');
const path = require('path');
const Opn = require('opn');


//set auth credentials
const dropbox = dropboxV2Api.authenticate({
	client_id: "API_ID" , 
	client_secret:"APP_Secert",
	token_access_type: 'offline',
	redirect_uri: 'http://localhost:4000/oauth'
});

//prepare server & oauth2 response callback
(async () => {
	const server = Hapi.server({
		port: 4000,
		host: 'localhost'
	});

	server.route({
		method: 'GET',
		path: '/oauth',
		handler: function (request, h) {
			var params = request.query;

			return new Promise((resolve) => {
				dropbox.getToken(params.code, function (err, response) {
					console.log(err);
					console.log('user\'s access_token: ', response.access_token);
					console.log('user\'s refresh_token: ', response.refresh_token);
					//call api
					dropbox({
						resource: 'users/get_current_account'
					}, function (err, response) {
						console.log(err);
						resolve(response);
					});
					//or refresh token!
					dropbox.refreshToken(response.refresh_token, (err, result) => {
						console.log('---error--',err);
						console.log('-----result-----',result);
					})
				});
			})
		}
	});

	await server.start();
	Opn(dropbox.generateAuthUrl());
	console.log('Server running on %s', server.info.uri);
})()
