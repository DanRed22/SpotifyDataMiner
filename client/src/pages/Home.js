import React, { useEffect } from 'react'
import Form from 'react-bootstrap/Form';
import { useState } from 'react';
import { Button, Card, Container, FormText } from 'react-bootstrap';
import axios from 'axios'
import {API} from '../config'
import Alert from 'react-bootstrap/Alert';

function Home() {
    const [dataID, setDataID] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showCard, setShowCard] = useState(true);
    const [loginStatus, setLoginStatus] = useState();
    
    const connect = () =>{
        try{
        axios.get(`${API}/login`, ).then((response)=>{
            setLoginStatus(response.data.message);
            showCard(true);
        })
    }catch(err){
            console.log(err);
            setLoginStatus("fail");
            showCard(true);
    }
    }

    useEffect(()=>{
        connect();
    }, [])

    useEffect(()=>{
        setTimeout(()=>{
            setShowCard(false)
        }, 10000)
    }, [showCard])
  return (
    <>
    <Container className=' p-3'>
        {showCard == true && !loginStatus? 
        <Alert  variant={"primary"}>
        Login is {}
      </Alert>:<></>
            }
        <div className='w-25 border p-2'>
      <Form.Label htmlFor="trackIDSearch">Search By Track ID</Form.Label>
      <Form.Control
        type="text"
        id="searchTrackID"
        aria-describedby="trackIDSearchHelpBlock"
        placeholder='Enter Track ID Here'
      /> <Button className='mt-2'>Search Track ID</Button>
      </div>

      <div className='w-25 border p-2'>
      <Button className='mt-2'>Refresh Access Token</Button>
      </div>
      
      
       
      </Container>
    
    </>
  )
}

export default Home