/**
 * Application Entry Point
 * 
 * This file is responsible for rendering the React application into the DOM.
 * It initializes the React app by mounting the root component (`App`) into the
 * DOM element with the `id="root"`. The application is wrapped in `React.StrictMode`
 * for additional checks during development.
 */

/*
 * Import the React library to use JSX and React components.
 * Import ReactDOM for rendering the app into the DOM.
 * Import the root component of the application.
 * Import global CSS styles for the application.
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App'
import './i18n'
import './css-styles/index.css'

/*
 * Initializes the React app and enables React 18 features like concurrent rendering.
 * Selects the DOM element where the app will be mounted.
 * <React.StrictMode> wrapps the code and adds additional checks and warnings in development mode.
 * <App />The root component of the application, which contains the rest of the app's structure.
 */

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)