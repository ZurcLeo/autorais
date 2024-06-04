//eloswebapp/src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './components/resources/userContext';
import AuthProvider from './components/resources/AuthService';
import { ConnectionProvider } from './components/resources/ConnectionService';
import NotificationProvider from './components/resources/NotificationService';
import {StatusProvider } from './components/resources/StatusContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './firebase.config';
import { PhotosProvider } from './components/resources/Common/PrivateRoute/hooks/PhotosContext';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
  <NotificationProvider>
  <StatusProvider>
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <ConnectionProvider>
            <PhotosProvider>
              
            <ToastContainer />
              <App />
              
              </PhotosProvider>
          </ConnectionProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  </StatusProvider>
  </NotificationProvider>
</React.StrictMode>
);