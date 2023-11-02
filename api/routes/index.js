//MODIFY THIS:
const filesrc = './files/group-1-1.csv'

const express = require('express');
const cors = require('cors');
const router = express.Router();
require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
var SpotifyWebApi = require('spotify-web-api-node');

// credentials are optional
var spotifyApi = new SpotifyWebApi({});
let access_token =  process.env.ACCESS_TOKEN
let refresh_token = process.env.REFRESH_TOKEN

spotifyApi.setClientId(process.env.CLIENT_ID)
spotifyApi.setClientSecret(process.env.CLIENT_SECRET)
spotifyApi.setRedirectURI(process.env.REDIRECT_URI)

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

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const setTokens = ()=>{
  spotifyApi.setAccessToken(access_token)
  spotifyApi.setRefreshToken(refresh_token);
}

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
      //console.log("RESPONSE ::::", response.body);
      access_token = response.body['access_token'];
      refresh_token = response.body['refresh_token'];
      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);
      //console.log('The access token is ' + access_token);
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


router.get('/me', async (req, res)=>{
  setTokens()
  const info = await spotifyApi.getMe();
  //console.log(info)
  res.json(info)
})

const refreshToken = async ()=>{
  const response = await spotifyApi.refreshAccessToken();
  return response;
}

router.get('/refreshToken', async (req, res)=>{
  setTokens();
  console.log(process.env.REFRESH_TOKEN)
  spotifyApi.setRefreshToken(process.env.REFRESH_TOKEN)
  refreshToken().then((response)=>{
    res.json(response)
  })
  setTokens();
 // res.json(response)
})

router.get('/getTrack', (req, res)=>{
  console.log("REQUEST: ", req.query)
  spotifyApi.getTrack(req.query.trackId).then((response)=>{
    res.status(200).json(response.body);
  }).catch((error)=>{
    console.log(error.body);
    res.status(500).json(error.body)
  })
})

const getSeveralTracks = async (track_list) => {
  setTokens();

  try {
    const response = await spotifyApi.getTracks(track_list);
    const retval = response.body.tracks;
    return retval;
  } catch (error) {
    console.error('Error getting several tracks:', error);
    throw error;
  }
}


router.get('/getSeveralTracks', async (req, res) => {
  setTokens();
  try {
    const batch = 50; // Set your desired batch size
    var data = req.query.data; // Access the data from query parameters
    var retval = [];

    async function processBatch(batchdata) {
      try {
        const response = await spotifyApi.getTracks(batchdata);
        const tracks = response.body.tracks;
        retval.push(...tracks); // Combine the tracks into the retval array
        console.log("UPDATE: ", retval.length + '/' + data.length);
      } catch (error) {
        console.error("Error from Spotify API: ", error);
      }
    }

    // Use a loop to process data in smaller batches
    console.log("DATA bEHHHH=>>", data)
    for (let index = 0; index < req.query.data.length; index += batch) {
      const batchdata = data.slice(index, index + batch);
      console.log("BATCH DATA: ", batchdata);

      // Process the current batch
      await processBatch(batchdata);

      // Introduce a pause (e.g., 3 seconds) before processing the next batch
      if (index + batch < data.length) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    console.log("Processing Data...");

    // Assuming you want to send a response after processing
    res.status(200).send(retval);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: 'Failed to get several tracks', message: error.message });
  }
});








router.get('/getTracks', async (req, res) => {
  spotifyApi.setAccessToken(access_token)
  spotifyApi.setRefreshToken(refresh_token)
  const msg = {msg: 'The access token is ', tokens: access_token}
  //res.json(msg)
  // File path to the CSV file
  const filesrc = 'files/group-1-1.csv';
  const jsonoutputfile = 'files/output.json';

  // Number of rows to read in each batch
  const batchSize = 25;

  // Create an array to store the CSV data
  const csvData = [];

  // Variable to keep track of processed entries
  let processedEntries = 0;

  const processBatch = async (batch) => {
    try {
      // Use the Spotify API to get information about the tracks in the batch
      const response = await spotifyApi.getTracks(batch).then((response)=>{
        console.log("RESPONSE BEHHHH ===>>>>", response)
        setTimeout((()=>{
          console.log("Processing next batch ...")
        }), 3000);
      })

      // Process the response as needed (e.g., append to JSON file)
      //res.json(response.data)
      await appendResultsToJSONFile(jsonoutputfile, response.data);

      // Update the count of processed entries
      processedEntries += batch.length;

      // Log processing information
      console.log('Processed batch. Entries processed:', processedEntries);
    } catch (error) {
      console.error('Error processing batch: ', error);
    }
  };

  // Read the CSV file and parse it row by row
  const stream = fs.createReadStream(filesrc).pipe(csv());

  stream.on('data', (row) => {
    // Process each row and add it to the csvData array
    csvData.push(row);

    // If the batch size is reached, process the current batch
    if (csvData.length === batchSize) {
      processBatch([...csvData]); // Send a copy of the batch
      csvData.length = 0; // Clear the csvData array for the next batch
    }
  });

  stream.on('end', async () => {
    // Process any remaining rows in csvData
    if (csvData.length > 0) {
      processBatch([...csvData]); // Send a copy of the batch
    }

    console.log('Total entries processed:', processedEntries);
    res.json({ message: 'CSV data processed', totalEntries: processedEntries });
  });
});

// Function to append results to a JSON file
function appendResultsToJSONFile(jsonfile, data) {
  // Your existing code to append data to a JSON file
  // ...
}

module.exports = router;


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
