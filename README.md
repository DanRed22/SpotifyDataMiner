# SpotifyDataMiner

# IMPORTANT
- Please make sure you have your Client ID and Client Secret Ready and available. This is obtained from the Spotify Web API.
- Make sure your Spotify Web API app's callback is set to http://localhost:8888/callback

# Prerequisite steps
1. Go to cd /api
2. npm i
3. npm run start
4. Edit in your CLIENT_ID and CLIENT_SECRET in the ENV file in the api folder (No Quotation), SAVE
5. Go to your browser: http://localhost:8888/login
6. Approve app (if prompted)
7. Copy the JSON OUTPUT
8. Open Console Log and paste there and hit enter
9. Expand the resulting JSON object and copy the "access_token" and "refresh_token"
10. Paste the tokens in your ENV file, SAVE
11. On another terminal, go to cd /client
12. npm i
13. npm run start
14. When loading the page you should see "Login Success Spotify User : *Your Spotify Username Here*"


# When getting tracks from a CSV File
1. Be sure to do the Prerequisite Steps successfully(above)
2. Go to api/files
3. Place your csv file in that folder
4. be sure the csv files are the same format as the sample csv file in the files folder
5. Upload your CSV and wait for the API to process your request
6. The file will automatically be downloaded after the api processes your data


# Converting the JSON data to another JSON predefined format
1. Be sure you have a file ready from the previous step
2. Go to: http://localhost:3000/convert
3. Upload your JSON file from the previous step
4. The file will automatically download after processing

# Converting the Predefined Format JSON File to an XLSX file
(i didnt have time to code this to the API so i used an online tool)
1. Go to this website: https://products.aspose.app/cells/conversion/json-to-xlsx
2. Upload your predefined format JSON file from the previous steps
3. Download.


*Notes:*
*npm i* - is a one-time step no need to re-execute this command when using the dataminer
*npm start* - is a needed step each time you run the dataminer

Troubleshooting:
*Can't login?*
Be sure to provide your client id and client secret correctly in your .env file located in the /api/.env

If you are sure you provided the correct Client ID and Client Secret the do the ff:
Restart the api. By going to the api folder:
*Quick Method:* go to the app.js in the api and hit cntrl-s (save)
*Long Method:* stop the service of the api in your terminal, and re run by "npm run start"
Open new tab. - THIS IS IMPORTANT
go to http://localhost:8888/login this should fix the issue 



*Can't get data? Refresh Token is Err?* 
Relogin again by going to http://localhost:8888/login and copy pasting the credentials in your .env file (located at /api)

*Can't upload files?*
Probably its in the wrong format. I made the fields only to accept a specific file type.


