//MODIFY THIS:
const filesrc = './files/group-1-1.csv'

const express = require('express');
const cors = require('cors');
const router = express.Router();
require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');

var SpotifyWebApi = require('spotify-web-api-node');
const { setTimeout } = require('timers/promises');

// credentials are optional
var spotifyApi = new SpotifyWebApi({});

spotifyApi.setClientId("7fbbf2a03ca94c37b9fa2d0c06930106")
spotifyApi.setClientSecret("4838fe5597834c6e89bf97a47d0a7497")
spotifyApi.setRedirectURI("http://localhost:8888/callback")

const scopes = [
  'ugc-image-upload',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
  'app-remote-control',
  'user-read-email',
  'user-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-read-private',
  'playlist-modify-private',
  'user-library-modify',
  'user-library-read',
  'user-top-read',
  'user-read-playback-position',
  'user-read-recently-played',
  'user-follow-read',
  'user-follow-modify'
];




// Use CORS middleware to allow all origins
router.use(cors());

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/test', (req, res)=>{
  const response = { message: 'working' };
  res.json(response);
})

router.get('/callback', (req, res, next) => {
  const code = req.query.code.toString();

  try {
    spotifyApi.authorizationCodeGrant(code).then((response) => {
      console.log("RESPONSE ::::", response.body);
      const access_token = response.body.access_token;
      const refresh_token = response.body.refresh_token;

      spotifyApi.setAccessToken(String(access_token));
      spotifyApi.setRefreshToken(String(refresh_token));
      console.log('The access token is ' + spotifyApi.getAccessToken());
      data = {
        message: "success",
        access_token: access_token,
        refresh_token: refresh_token,
        token_duration: String(response.body.expires_in / 60) + ' mins',
      };
      res.json(data);
    });
  } catch (err) {
    res.json({ message: "fail" });
    console.log("ERROR! in connecting to Spotify API! ", err);
  }
});


router.get('/login', (req, res)=>{
  res.redirect(spotifyApi.createAuthorizeURL([scopes]))
})



router.get('/getTracks', async (req, res) => {
  console.log('The access token is ' + spotifyApi.getAccessToken());
  
  // File path to the CSV file
  const filesrc = 'files/group-1-1.csv';
  const jsonoutputfile = 'files/output.json';

  // Number of rows to read in each batch
  const batchSize = 25;
  
  // Create an array to store the CSV data
  const csvData = [];

  // Variable to keep track of processed entries
  let processedEntries = 0;

  // Read the CSV file and parse it row by row
  const stream = fs.createReadStream(filesrc).pipe(csv());

  stream.on('data', async (row) => {
    // Process each row and add it to the csvData array
    csvData.push(row);

    // If the batch size is reached, process the current batch
    if (csvData.length === batchSize) {
      // Process the batch
      console.log('Processing batch...', processedEntries, 'entries processed');
      
      // Use the Spotify API to get information about the tracks in csvData
      await spotifyApi.getTracks(csvData).then((response) => {
        console.log("RESPONSE JSON:: ", response.body)
        appendResultsToJSONFile(jsonoutputfile, response.body);

      }).catch((error) => {
        console.error('Error processing batch: ', error);
      });

      // Update the count of processed entries
      processedEntries += csvData.length;

      // Clear the csvData array for the next batch
      csvData.length = 0;
    }
  });

  stream.on('end', async () => {
    // Process any remaining rows in csvData
    if (csvData.length > 0) {
      console.log('Processing remaining entries...', processedEntries, 'entries processed');
      
      // Use the Spotify API to get information about the tracks in csvData
      await spotifyApi.getTracks(csvData).then((response) => {
        // Process the response as needed
        // ...

        // Append the results to the JSON file
        appendResultsToJSONFile(jsonoutputfile, response);

      }).catch((error) => {
        console.error('Error processing remaining entries:', error);
      });
      
      // Update the count of processed entries
      processedEntries += csvData.length;
    }

    console.log('Total entries processed:', processedEntries);
    res.json({ message: 'CSV data processed', totalEntries: processedEntries });
  });
});

// Function to append results to a JSON file
// Function to append results to a JSON file
function appendResultsToJSONFile(jsonfile, data) {
  fs.readFile(jsonfile, 'utf8', (err, fileData) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      return;
    }

    let existingData = [];

    // Check if the file is not empty and contains valid JSON data
    if (fileData) {
      try {
        existingData = JSON.parse(fileData);
      } catch (parseError) {
        console.error('Error parsing JSON file:', parseError);
        return;
      }
    }

    existingData.push(data);

    fs.writeFile(jsonfile, JSON.stringify(existingData, null, 2), 'utf8', (err) => {
      if (err) {
        console.error('Error writing to JSON file:', err);
      }
    });
  });
}







module.exports = router;
