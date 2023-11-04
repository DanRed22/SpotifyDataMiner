import React, { useEffect } from 'react'
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useState } from 'react';
import { Button, Card, Container, Fade, FormText } from 'react-bootstrap';
import axios from 'axios'
import {API} from '../config'
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import Papa, { parse } from "papaparse";
import { Link } from 'react-router-dom';


const allowedExtensions = ["csv"];

function Home() {
    const [dataID, setDataID] = useState(null);
    const [data, setData] = useState([])
    const [isLoading, setIsLoading] = useState(false);
    const [isLoading2, setIsLoading2] = useState(false)
    const [showCard, setShowCard] = useState(true);
    const [loginStatus, setLoginStatus] = useState();
    const [cardColor, setCardColor] = useState("primary");
    const [searchTrackID, setSearchTrackID] = useState('');
    const [file, setFile] = useState(null);
    const [parsedFile, setParsedFile] = useState([]);
    const [error, setError] = useState('');


    const connect = () =>{
        setIsLoading(true)
        setIsLoading2(false)
        axios.get(`${API}/me`, ).then((response)=>{
            //console.log("RESPONSE: ", response);
            setLoginStatus('Login Success' + ' Spotify User: ' + response.data.body.display_name);
            setCardColor("primary")
            setShowCard(true);
            setIsLoading(false)
        }).catch((err)=>{
          console.log(err);
          setCardColor("danger")
          setLoginStatus(`Login UNSUCCESSFULL. Please refresh access token or relogin again  at http://localhost:8888/login`);
          setShowCard(true);
          setIsLoading(false)
        })
        
          
        
    }

    const processData = async () => {
      setIsLoading2(true);
      const sendBatch = 500;
      const batches = [];
    
      // Split the data into batches
      for (let index = 0; index < data.length; index += sendBatch) {
        batches.push(data.slice(index, index + sendBatch));
      }
    
      const responses = [];
    
      try {
        // Use Promise.all to send batch requests concurrently
        await Promise.all(
          batches.map(async (batch) => {
            try {
              const response = await axios.get(`${API}/getSeveralTracks`, {
                params: { data: batch }
              });
              responses.push(response.data);
            } catch (error) {
              console.log(error);
              setIsLoading2(false);
              setLoginStatus("Failed to Process Request");
              setShowCard(true);
            }
          })
        );
    
        if (responses.length > 0) {
          // Only download if there's data
          const retval = responses.reduce(
            (accumulator, currentResponse) => accumulator.concat(currentResponse),
            []
          );
    
          const jsonData = JSON.stringify(retval);
    
          // Create a Blob containing the JSON data
          const blob = new Blob([jsonData], { type: 'application/json' });
    
          // Create a URL for the Blob
          const url = URL.createObjectURL(blob);
    
          // Create an anchor (a) element in the HTML
          const a = document.createElement('a');
    
          // Set the anchor's href attribute to the URL
          a.href = url;
    
          // Set the anchor's download attribute with the desired file name
          a.download = 'processedData.json';
    
          // Trigger a click event on the anchor element to start the download
          a.click();
    
          // Clean up by revoking the URL to release the object from memory
          URL.revokeObjectURL(url);
    
          setIsLoading2(false);
          setLoginStatus('API Finished Processing');
          setShowCard(true);
        } else {
          // No data to download
          setIsLoading2(false);
          setLoginStatus('No data to download.');
          setShowCard(true);
        }
      } catch (error) {
        console.error(error);
        setIsLoading2(false);
        setLoginStatus('Failed to Process Request');
        setShowCard(true);
      }
    };
    




    const refreshToken = async () =>{
      setIsLoading(true)
      setIsLoading2(false)
      axios.get(`${API}/refreshToken`).then((response)=>{
       // console.log("REFRESHED:: ", response);
        setLoginStatus("Token successfully refreshed (expires in 1hr) ! Change Access Token in ENV: "+ response.data.body.access_token);
        setCardColor("success");
        setIsLoading(false)
      }).catch((error)=>{
        console.log("ERROR TOKEN: ", error)
        setLoginStatus("Error refreshing token! Err: ", error.message);
        setCardColor("danger");
        setIsLoading(false)
      })
      
    }

    const getTrack = async ()=>{
      setIsLoading(true)
      if (searchTrackID != ''){
      axios.get(`${API}/getTrack`, {
        params: {
          trackId: searchTrackID
        }
      }).then((response)=>{
        setLoginStatus("Found track with ID: "+searchTrackID + " - " + response.data.name)
        setCardColor("success");
        setShowCard(true)
        console.log(response);
        setIsLoading(false)
      }).catch((error)=>{
        console.log("EEEEEEEERRR :", error)
        setLoginStatus("Error! " + error.response.data.error.message)
        setCardColor("danger");
        setShowCard(true);
        setIsLoading(false)
      })
    }else{
      setLoginStatus("Track ID is Required");
      setCardColor("danger")
      setShowCard(true);
      setIsLoading(false)
    }
    
    }

    const handleFileChange = (e) => {

      // Check if user has entered the file
      if (e.target.files.length) {
          const inputFile = e.target.files[0];

          const fileExtension =
              inputFile?.type.split("/")[1];
          if (
              !allowedExtensions.includes(fileExtension)
          ) {
              setLoginStatus("Please input a VALID CSV file");
              setCardColor("danger");
              setShowCard(true);
              
              return;
          }
          setFile(inputFile);
      }
  };

  const handleFileSubmit = () => {
    // If user clicks the parse button without
    // a file we show an error
      setIsLoading2(true);
      setLoginStatus("Processing File");
      setCardColor("primary")
      setShowCard(true)
    var data = []
    if (!file) {
      setLoginStatus("Please Upload a CSV File");
      setCardColor("danger");
      setShowCard(true);
      setIsLoading2(false);
      return;
    }
    setIsLoading(true);

    // Initialize a reader which allows the user
    // to read any file or blob.
    const reader = new FileReader();

    // Event listener on the reader when the file
    // loads, we parse it and set the data.
    reader.onload = async ({ target }) => {
      const csv = await Papa.parse(target.result, {
        header: true,
      });

      const parsedData = csv?.data;
      //console.log("PARSED DATA =>", parsedData)
      if (parsedData){
        for ( const row of parsedData){
          //console.log(row)
          if (row.trackId != ''){
            data.push(row.trackId)
          }
          
        }
        //console.log("DATA::: ", data);
        setData(data);
                // Optional: Display a success message after processing
                setIsLoading2(false)
                setLoginStatus("CSV File has been processed successfully.");
                setCardColor("success");
                setShowCard(true);

                // setTimeout(()=>{
                //   setIsLoading2(true);
                //   setLoginStatus("Sending Parsed Data to API");
                //   setCardColor("primary")
                //   setShowCard(true)
                // }, 4000)

                // setTimeout(()=>{
                //   setIsLoading2(true);
                //   setLoginStatus("Prossessing Parsed Data to API. Please Wait Patiently");
                //   setCardColor("info")
                //   setShowCard(true)
                //   processData();
                // }, 8000)
                setIsLoading2(true);
                setLoginStatus("Prossessing Parsed Data to API. Please Wait Patiently");
                setCardColor("info")
                setShowCard(true)
                processData();
      }
      
          
      
    };

    reader.readAsText(file);
    setIsLoading(false);
};


  return (
    <>

    <Container className=' p-3'>
      {isLoading? <Spinner animation="border" variant="primary" /> : <></>}
        {showCard == true && loginStatus != null? 
        <Fade in={showCard}>
        <Alert  variant={cardColor}>
          {isLoading2? <div><Spinner animation="border" variant="danger"></Spinner> </div>: <></>}
        <div>
        {loginStatus}</div>
      </Alert>
      </Fade>:<></>
            }
            <Row>
            <div className='w-25 p-2'>
        {/* Add a button that redirects to the "Convert" page */}
        <Link to="/convert">
          <Button>Convert {">"}</Button>
        </Link>
      </div>
            </Row>
      <Row>
        <div className='w-25 border p-2'>
          <Button onClick={connect}>Check Login Status</Button>
          <br/><br/>
      <Form.Label htmlFor="trackIDSearch">Search By Track ID</Form.Label>
      <Form.Control
        type="text"
        id="searchTrackID"
        value={searchTrackID} // Set the value prop to the state value
        onChange={(e) => setSearchTrackID(e.target.value)} // Handle changes and update state
        aria-describedby="trackIDSearchHelpBlock"
        placeholder='Enter Track ID Here'
      /> <Button className='mt-2' onClick={getTrack}>Search Track ID</Button>
      </div>

      <div className='w-25 border p-2'>
        <p>Be sure that you already logged in. To check you're logged in the card above should have the message:</p>
        <p>Login Success Spotify User: "Your Name Here"</p>
      <Button className='mt-2' onClick={refreshToken}>Refresh Access Token</Button>
      </div>

      <div className='w-25 border p-2'>
        <p>This gets all the tracks in a CSV File and outputs a JSON File</p>
        <Form.Label htmlFor="fileCSV">CSV File</Form.Label>
        <Form.Control type="file" id="fileCSV" name="file" onChange={handleFileChange}></Form.Control>
        <Button className='my-2' onClick={handleFileSubmit}>Get Data</Button>
      </div>

      
      </Row>
      
      
       
      </Container>
    
    </>
  )
}

export default Home