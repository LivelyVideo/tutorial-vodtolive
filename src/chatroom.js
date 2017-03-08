const request = require('request');
const config = require('./config');

// this function creates a room, or updates it if exists
module.exports.createRoomIfNotExists = function(owner, roomName, cb) {
	// create the owner user if they do not exist
	request({
		method: 'POST',
		uri: `https://${config.subdomain}.livelyvideo.tv/chat/private/v1/users`,
		headers: {
			Authorization: `Bearer ${config.token}`
		},
		json: {
			id: owner,
			username: owner
		}
	}, (err, response, body) => {
		if (err) {
			cb(err);
			return;
		}

		if (response.statusCode > 399) {
			cb(new Error('failed ot create user'));
			return;
		}

		// the name of the room cannot change
		// the title will be displayed in the UI, it can change
		request({
			method: 'POST',
			uri: `https://${config.subdomain}.livelyvideo.tv/chat/private/v1/rooms`,
			headers: {
				Authorization: `Bearer ${config.token}`
			},
			json: {
				owner: owner,
				name: roomName,
				title: roomName
			}
		}, (err, response, body) => {
			if (err) {
				cb(err);
				return;
			}

			if (response.statusCode > 399) {
				cb(new Error('failed to create room'));
				return;
			}
			cb();
		});
	});
}
