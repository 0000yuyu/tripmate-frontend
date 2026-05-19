import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {CompanyProfileProvider} from "./hooks/companyContext.jsx";
import {ProfileProvider} from "./hooks/userContext.jsx";
import {BrowserRouter} from 'react-router-dom';
import {MatchingStreamProvider} from "@hooks/useStreamContext.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <ProfileProvider>
        <MatchingStreamProvider>
          <CompanyProfileProvider>
            <BrowserRouter>
              <App/>
            </BrowserRouter>
          </CompanyProfileProvider>
        </MatchingStreamProvider>
      </ProfileProvider>
  </StrictMode>,
)
