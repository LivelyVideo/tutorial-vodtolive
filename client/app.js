import 'whatwg-fetch';
import StockPlayer from '@livelyvideo/stock-live-player';
import LivelyChat from '@livelyvideo/chat'
const subdomain = 'sandbox';

let chat;
function loadChat(userId) {
	if (chat) {
		chat.destroy();
	}

	chat = new LivelyChat(document.getElementById('chat'), {
		user: 'foobar',
		room: userId,
		apiHost: `https://${subdomain}.livelyvideo.tv`,
		websocketHost: `ws://ws-${subdomain}.livelyvideo.tv`,
		authUrl: `/access-token`,
	});
}

let stockPlayer;
function loadVideo(manifest) {
	if (stockPlayer) {
		stockPlayer.destroy();
	}

	stockPlayer = new StockPlayer(document.getElementById('video'), manifest, {
		drivers: ['mediaSourceMp4', 'hlsjs', 'hls', 'flashRtmp'],
		hlsjsPath: '/libs/hlsjs/hls.min.js',
		tfSwfPath: '/libs/thinflash/thin.swf'
	}, {
		messages: {
			"Full Screen": "Full Screen",
			"Stream is currently offline": "Stream is currently offline",
			"Play": "Play",
			"Pause": "Pause",
			"Toggle play/pause": "Toggle play/pause",
			"Pause": "Pause",
			"Popout": "Popout",
			"Quality Selector": "Quality Selector",
			"Auto": "Auto",
			"Mute": "Mute",
			"Unmute": "Unmute"
		}
	});

	stockPlayer.player.on('error', (code) => {
		switch (code) {
			case 'http-server-unauthorized':
			case 'http-server-forbidden':
				// handle unauthed cases
				break;
			default:
				break;
		}
	});
}

function main() {
		fetch('/random-stream')
		.then((response) => {
			if (response.status > 399) {
				console.error('unexpected response status code', {
					code: response.status
				});
				return;
			}
			return response.json();
		})
		.then((body) => {
			loadChat(body.userId);
			loadVideo(body.manifest);
		})
		.catch((err) => {
			console.error('fetch failed to load random stream', { err });
		});
}

main();
