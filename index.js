const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const path = require('path');

//If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/script.send_mail',
'https://www.googleapis.com/auth/script.external_request',
'https://www.googleapis.com/auth/drive',
'https://www.googleapis.com/auth/script.cpanel',
'https://www.googleapis.com/auth/script.scriptapp',
'https://www.googleapis.com/auth/spreadsheets','https://www.googleapis.com/auth/script.projects'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Apps Script API.
  authorize(JSON.parse(content), runSample);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Creates a new script project, upload a file, and log the script's URL.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function callAppsScript(auth) {
  const script = google.script({version: 'v1', auth});
  script.projects.create({
    resource: {
      title: 'Final Script',
    },
  }, (err, res) => {
    if (err) return console.log(`The API create method returned an error: ${err}`);
    script.projects.updateContent({
      scriptId: res.data.scriptId,
      auth,
      resource: {
        files: [{
          name: 'hello',
          type: 'SERVER_JS',
          source: 'function helloWorld() {\n  console.log("Hello, world!");\n}',
        }, {
          name: 'appsscript',
          type: 'JSON',
          source: '{\"timeZone\":\"America/New_York\",\"exceptionLogging\":' +
           '\"CLOUD\"}',
        }],
      },
    }, {}, (err, res) => {
      if (err) return console.log(`The API updateContent method returned an error: ${err}`);
      console.log(`https://script.google.com/d/${res.data.scriptId}/edit`, res.data.files);
    });
  });
}

// async function runSample () {
       
//     const client = await google.auth.getClient({
//         keyFile: path.join(__dirname, 'practice-9cd3c-0edea9bc6f72.json'),
//         scopes: ['https://www.googleapis.com/auth/script.send_mail',
//         'https://www.googleapis.com/auth/script.external_request',
//         'https://www.googleapis.com/auth/drive',
//         'https://www.googleapis.com/auth/script.projects',
//         'https://www.googleapis.com/auth/spreadsheets']
//     });
//     const script = await google.script({version: 'v1'});
//      const res = script.scripts.run(
//         {
//             scriptId:'MEdHPBLUjHiIk7FeRIO1K_WsZOb4PlnIS',
//             auth: client,
//             resource : {
//                 function: 'helloWorld'
//             }
//         }
//     )
//     console.log(res.data);
//     return res.data;
//     // .then(function(response) {
//     //     // Handle the results here (response.result has the parsed body).
//     //     console.log("Response", JSON.stringify(response.data, response.status));
//     //   },
//     //   function(err) { console.error("Execute error", err); });


//     }

//     if (module === require.main) {
//         runSample().catch(console.error);
//     }


function runSample (auth) {
    const script = google.script({version: 'v1', auth});
    script.scripts.run(
        {
            
                scriptId:'MEdHPBLUjHiIk7FeRIO1K_WsZOb4PlnIS',
                auth: auth,
                function: 'helloWorld'
                
            
        }
    )
    .then(function(response) {
        // Handle the results here (response.result has the parsed body).
        console.log("Response", response.data);
      },
      function(err) { console.error("Execute error", err); });    
}
