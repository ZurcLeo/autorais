// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import App from './App';
import './index.css';
import './firebaseConfig';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
<BrowserRouter>
                  <ToastContainer />
                  <App />
              
        </BrowserRouter>
   
  </React.StrictMode>
);
