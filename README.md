# Sandbox Vod to Live Example

## Requirements

- ffmpeg
- ffprobe
- LTS node
- a media source (mp4, flv, rtmp )

## Getting Started

install with

		$ npm install

run a stream

		$ ./cmd/broadcast-video --files <any file or media source>

		for example

		$ ./cmd/broadcast-video --files rtmp://sea1a-border.stream.me/live/sea1a~4~931c1d57-785d-4629-adb2-f290b74b16eb_124_256x144_56

run the webserver

		$ ENV=prod PORT=4000 npm run start

or run server/client in dev mode

		$ ENV=dev PORT=4000 npm run start
		$ npm run dev

visit localhost:4000

## Explanation

### ./src/config.js

./src/config.js has the livelyvideo configs, subdomain and secret token.  It is set to our sandbox cluster right now, we can set up a bang cluster any time

The subdomain from config.js is duplicated in the client, client/app.js:4

### ./cmd/broadcast-video

./cmd/broadcast-video is a script to stream recorded content (or proxy live feeds) to lively.

For each file, it...
* checks to make sure it exists and has active streams
* gets a broadcasting accessKey for that file
* creates a chat room for that file if it did not already exist (this is assuming each stream has a different chat, can be 1 chat for all streams, too)
* spawns off the following ffmpeg command

ffmpeg -i <file> -vcodec copy -acodec copy -f flv <rtmp://ids1-ls-sandbox.livelyvideo.tv/origin/{key}>

Ideally h264/aac for codecs, but let us know what codecs and we will support

### ./src/chatroom.js

./src/chatroom.js is used by the broadcast-video command.  It makes sure a user and a chatroom are created before putting a stream online.  Room needs to exist before they can be joined.  They do not necessarily need owners, but this example has an owner

### ./src/server.js

./src/server.js serves dist as a static folder, and handles two endpoints

#### GET /access-token

GET /access-token is used by chat to retrieve an access token for a user.  Any userId and username can be used.  If the user should not be given access to this chat, just send a 403 status code (note: the UI does not work quite right with this release, will be fixing asap.)

#### GET /random-stream

GET /random-stream makes a request to the live api to retrieve active streams, then picks a random one to display.  We offer this, and webhook, to determine which streams are active.  Once we set up a bang cluster I can send over the webhook docs.

### ./client/app.js

Example client that picks a random streams, then plays the video and renders an accompanying chat.
