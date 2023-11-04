import React from 'react';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Button, Card, Container, Fade, FormControl, FormLabel, FormText } from 'react-bootstrap';
import axios from 'axios'
import {API} from '../config'
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import { Link } from 'react-router-dom';
import { json2csv } from 'json-2-csv';
import { useState } from 'react';
import { CSVLink } from 'react-csv';


const allowedExtensions = ["json"];


function Convert() {
  const [file, setFile] = useState();
  const [isLoading, setIsLoading] = useState(false);
    const [isLoading2, setIsLoading2] = useState(false)
    const [showCard, setShowCard] = useState(true);
    const [loginStatus, setLoginStatus] = useState();
    const [cardColor, setCardColor] = useState("primary");
    const [fileRead, setFileRead] = useState(null);
  const [csvData, setCsvData] = useState(null);

    const handleFileChange = async (event) => {
      const file = event.target.files[0];
      setIsLoading2(true)
      setLoginStatus("Converting to CSV ...")
      setCardColor("primary")
      setShowCard(true)
      if (file) {
        const reader = new FileReader();
        reader.readAsText(file);
  
        reader.onload = (e) => {
          const fileContent = e.target.result;
          setFileRead(fileContent);
  
          // Convert JSON to CSV using json-2-csv
          try {
            
            const jsonData = JSON.parse(fileContent);
            const options = {
              expandNestedObjects: false,
              expandArrayObjects: false
            }
            var newJson = [];

            for (const data of jsonData){
              var artistsList = [];
              var artistsNameList = [];
              for (const artist of data.artists){
                artistsList.push({
                  id: artist.id
                })
                artistsNameList.push({
                  name: artist.name
                })
              }
              var artistsListString = ''
              var artistsNameString = ''
              artistsList.forEach(element => {
                //console.log("ELEMENT: ", element.id);
                  artistsListString = artistsListString.concat(`,${element.id}`)
                  
              });

              artistsNameList.forEach(element => {
                //console.log("ELEMENT: ", element.id);
                artistsNameString = artistsNameString.concat(`,${element.id}`)
                  
              });
              console.log("ARTISTS LIST: ", artistsListString);
              newJson.push({
                id: data.id,
                title: data.name,
                popularity: data.popularity,
                artistId: artistsListString.replace(/"/g, ''),


              })
            }
            const csv = json2csv(newJson, options)
            console.log("CSV DATA==>", csv)
            setCsvData(csv);
            setIsLoading2(false)
            setLoginStatus("Success!")
            setCardColor("success")
            setShowCard(true)
            console.log(csv);
          } catch (error) {
            setIsLoading2(false)
      setLoginStatus("Error parsing JSON or converting to CSV")
      setCardColor("danger")
      setShowCard(true)
            console.error('Error parsing JSON or converting to CSV', error);
          }
        };
      }
    };


    const handleFileChange2 = async (event) => {
      const file = event.target.files[0];
      setIsLoading2(true)
      setLoginStatus("Converting to JSON Predefined Format...")
      setCardColor("primary")
      setShowCard(true)
      if (file) {
        const reader = new FileReader();
        reader.readAsText(file);
        
  
        reader.onload = (e) => {
          const fileContent = e.target.result;
          setFileRead(fileContent);
  
          // Convert JSON to CSV using json-2-csv
          try {
            
            const jsonFile = JSON.parse(fileContent);
            const options = {
              expandNestedObjects: false,
              expandArrayObjects: false
            }
            var newJson = [];

            for (const data of jsonFile){
              var artistsList = [];
              var artistsNameList = [];
              for (const artist of data.artists){
                //console.log("SLAYYYY::: ", artist.name)
                artistsList.push({
                  id: artist.id
                })
                artistsNameList.push({
                  name:  artist.name
                })
              }
              var artistsListString = ''
              var artistsNameListString = ''
              artistsList.forEach(element => {
                //console.log("ELEMENT: ", element.id);
                if (artistsListString === ''){
                  artistsListString = artistsListString.concat(element.id)
                }else{
                  artistsListString = artistsListString.concat(`,${element.id}`)
                }
                 
                  
              });

              artistsNameList.forEach(element => {
                //console.log("ELEMENT: ", element.id);
                if (artistsNameListString === ''){
                  artistsNameListString = artistsNameListString.concat(`${element.name}`)
                }else{
                artistsNameListString = artistsNameListString.concat(`,${element.name}`)
                }
              });
              //console.log("ARTISTS LIST: ", artistsListString);
              newJson.push({
                id: data.id,
                title: data.name,
                popularity: data.popularity,
                artist_Ids: artistsListString.replace(/"/g, ''),
                artist_names: artistsNameListString.replace(/"/g, ''),
                album_type: data.album.album_type,
                album_total_tracks: data.album.total_tracks,
                track_number: data.track_number,
                type: data.type,
                


              })
            }

              const jsonData = JSON.stringify(newJson);
    
          // Create a Blob containing the JSON data
          const blob = new Blob([jsonData], { type: 'application/json' });
    
          // Create a URL for the Blob
          const url = URL.createObjectURL(blob);
    
          // Create an anchor (a) element in the HTML
          const a = document.createElement('a');
    
          // Set the anchor's href attribute to the URL
          a.href = url;
    
          // Set the anchor's download attribute with the desired file name
          a.download = `P-${file.name}`;
    
          // Trigger a click event on the anchor element to start the download
          a.click();
    
          // Clean up by revoking the URL to release the object from memory
          URL.revokeObjectURL(url);
            
           
            console.log("JSON DATA==>", newJson)
            
            setIsLoading2(false)
            setLoginStatus("Success!")
            setCardColor("success")
            setShowCard(true)
            
          } catch (error) {
            setIsLoading2(false)
            setLoginStatus("Error JSON or converting to Predef")
            setCardColor("danger")
            setShowCard(true)
            console.error('Error JSON or converting to Predef', error);
          }
        };
      }
    };
    
    

  return (
    <Container className='my-4'>
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
      <h1>Convert Page</h1>
      {/* Add your content for the "Convert" page here */}
      <div className='w-25 border p-2'>
        {/* Add a button that redirects to the "Convert" page */}
        <Link to="/">
          <Button> {'< '}Home</Button>
        </Link>
      </div>

      {/* <div className='w-25 border p-2'>
            <FormLabel htmlFor='file'>Convert JSON to CSV</FormLabel>
      <FormControl type="file" name='file' id='file' onChange={handleFileChange} />
      {csvData && (
        
        <CSVLink data={csvData} filename={'exported-data.csv'}>
          <Button className='my-2 ' variant={"success"}>
          Download CSV
          </Button>
        </CSVLink>
        
      )}
      </div> */}

      <div className='w-25 border p-2'>
            <FormLabel htmlFor='file2'>Convert JSON to Predef Format</FormLabel>
      <FormControl type="file" name='file2' id='file2' onChange={handleFileChange2} />
      
          
        
     
      </div>
    </Container>
  );
}

export default Convert;