import React from 'react';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Button, Card, Container, Fade, FormText } from 'react-bootstrap';
import axios from 'axios'
import {API} from '../config'
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import { Link } from 'react-router-dom';

function Convert() {
  return (
    <Container>
      <h1>Convert Page</h1>
      {/* Add your content for the "Convert" page here */}
      <div className='w-25 border p-2'>
        {/* Add a button that redirects to the "Convert" page */}
        <Link to="/">
          <Button>Go to Convert Page</Button>
        </Link>
      </div>
    </Container>
  );
}

export default Convert;