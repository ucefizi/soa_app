var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');


var SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';


fs.readFile('client_secret.json', function processClientSecrets(err, content) {
	  if (err) {
		      console.log('Error loading client secret file: ' + err);
		      return;
		    }
	  authorize(JSON.parse(content), getChannel);
});


function authorize(credentials, callback) {
	  var clientSecret = credentials.installed.client_secret;
	  var clientId = credentials.installed.client_id;
	  var redirectUrl = credentials.installed.redirect_uris[0];
	  var auth = new googleAuth();
	  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

	  fs.readFile(TOKEN_PATH, function(err, token) {
		      if (err) {
			            getNewToken(oauth2Client, callback);
			          } else {
					        oauth2Client.credentials = JSON.parse(token);
					        callback(oauth2Client);
					      }
		    });
}


function getNewToken(oauth2Client, callback) {
	  var authUrl = oauth2Client.generateAuthUrl({
		      access_type: 'offline',
		      scope: SCOPES
		    });
	  console.log('Authorize this app by visiting this url: ', authUrl);
	  var rl = readline.createInterface({
		      input: process.stdin,
		      output: process.stdout
		    });
	  rl.question('Enter the code from that page here: ', function(code) {
		      rl.close();
		      oauth2Client.getToken(code, function(err, token) {
			            if (err) {
					            console.log('Error while trying to retrieve access token', err);
					            return;
					          }
			            oauth2Client.credentials = token;
			            storeToken(token);
			            callback(oauth2Client);
			          });
		    });
}


function storeToken(token) {
	  try {
		      fs.mkdirSync(TOKEN_DIR);
		    } catch (err) {
			        if (err.code != 'EEXIST') {
					      throw err;
					    }
			      }
	  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
	  console.log('Token stored to ' + TOKEN_PATH);
}


function getChannel(auth) {
	  var rl = readline.createInterface({
		      input: process.stdin,
		      output: process.stdout
		    });
	  rl.question('Enter user name to sarch: ', function(user) {
		      rl.close();
		      var service = google.youtube('v3');
		      service.channels.list({
			            auth: auth,
			            part: 'snippet,contentDetails,statistics',
			            forUsername: user
			          }, function(err, response) {
					        if (err) {
							        console.log('The API returned an error: ' + err);
							        return;
							      }
					        var channels = response.items;
					        if (channels.length == 0) {
							        console.log('No channel found.');
							      } else {
								              console.log('Found ' + channels.length + ' channel(s) for user ' + user);
								              for (var i = 0; i < channels.length; i++) {
										                console.log('');
										                console.log('Channel no. ' + (i+1) + ':');
										                console.log('');
										                console.log('Channel Name: ' + channels[i].snippet.title);
										                console.log('');
										                console.log('Description: ');
										                console.log(channels[i].snippet.description);
										                console.log('');
										                console.log('The channel was created at: ' + channels[i].snippet.publishedAt);
										                console.log('');
										                console.log('Some statistics of the channel: ');
										                console.log('Number of published videos: ' + channels[i].statistics.videoCount);
										                console.log('Number of subscribers: ' + channels[i].statistics.subscriberCount);
										                console.log('Total number of views: ' + channels[i].statistics.viewCount);
										                console.log('');
										                }
								            }
					      });
		    });
}




