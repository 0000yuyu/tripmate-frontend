import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import './index.css';
import App from './App';
import {ProfileProvider} from "./hook/userContext";
import {CompanyProfileProvider} from "./hook/companyContext";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
      <ProfileProvider>
        <CompanyProfileProvider>
          <BrowserRouter>
            <App/>
          </BrowserRouter>
        </CompanyProfileProvider>
      </ProfileProvider>
    </React.StrictMode>
);