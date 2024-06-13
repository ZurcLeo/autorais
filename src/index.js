// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './components/resources/userContext';
import { ConnectionProvider } from './components/resources/ConnectionService';
import { StatusProvider } from './components/resources/StatusContext';
import { ToastContainer } from 'react-toastify';
import { PhotosProvider } from './components/resources/Common/PrivateRoute/hooks/PhotosContext';
import App from './App';
import AuthProvider from './components/resources/AuthService';
import NotificationProvider from './components/resources/NotificationService';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import 'react-toastify/dist/ReactToastify.css';
import './firebase.config';

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
