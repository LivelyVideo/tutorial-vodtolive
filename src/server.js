const express = require('express');
const app = express();
const request = require('request');
const path = require('path');
const moment = require('moment')
const config = require('./config');

// Get listings from the private livelyvideo api
app.get('/random-stream', (req, res, next) => {
	// retrieves an access token for viewing streams
	request({
		uri: `https://${config.subdomain}.livelyvideo.tv/auth/v1/access-tokens`,
		method: 'POST',
		headers: {
			Authorization: `Bearer ${config.token}`
		},
		json: {
			// 10 minutes of viewing and then reject
			expire: moment.utc().add(10, 'minutes').format(),
			scopes: ['media'],
			// we track viewership minutes by id, can leave undefined
			userId: 'testuser'
		}
	}, (err, response, body) => {
		if (err) {
			res.status(500).send('internal server error')
			return;
		}
		if (response.statusCode > 399) {
			res.status(response.statusCode).send(body);
			return;
		}
		res.locals.accessToken = body;
		next();
	});
}, (req, res) => {
	// requests current live streams, using the users access token hydrates it in the manifest
	// applying an access token in the manifest will allow us to properly authorize viewership
	request({
		uri: `https://${config.subdomain}.livelyvideo.tv/api/ls/v1/live?user-token=${res.locals.accessToken.token}`,
		method: 'GET',
		json: true,
		qs: {
			limit: 100,
			offset: 0
		},
		headers: {
			Authorization: `Bearer ${res.locals.accessToken.token}`
		},
	}, (err, response, body) => {
		if (err) {
			res.status(500).send('internal server error')
			return;
		}

		if (response.statusCode > 399) {
			res.status(response.statusCode).send(body);
			return;
		}

		if (!body.results.length) {
			res.status(404).send('no streams found');
			return;
		}

		res.send(body.results[Math.floor(body.results.length * Math.random())]);
	});
});

// this request creates an access token
// access tokens are paired with user and grant access for that user to specific scopes
// access tokens are intended to be used directly by users on clients in cookies or auth headers
app.get('/access-token', (req, res) => {
	request({
		uri: `https://${config.subdomain}.livelyvideo.tv/auth/v1/access-tokens`,
		method: 'POST',
		headers: {
			Authorization: `Bearer ${config.token}`
		},
		json: {
			expire: moment.utc().add(1, 'days').format(),
			scopes: ['chat'],
			userId: req.query.username,
			chatUser: {
				avatar: null,
				username: req.query.username
			}
		}
	}, (err, response, body) => {
		if (err) {
			res.status(500).send('internal server error')
			return;
		}
		res.status(response.statusCode).send(body);
	});
});

// proxy to webpack dev server
if (process.env.ENV === 'dev') {
	const proxy = require('express-http-proxy');
	app.use('/js', proxy('localhost:9123'));
}

// serve dist
app.use('/', express.static(path.join(__dirname, '..', 'dist')));

const server = app.listen(process.env.PORT || 4000, () => {
	console.log('listening', {
		port: server.address().port
	});
});
