# SpotifyDataMiner

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
4. Modify the 
