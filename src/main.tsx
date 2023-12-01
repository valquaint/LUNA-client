import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { SplashScreen } from '@capacitor/splash-screen';

// Call the element loader before the render call
defineCustomElements(window);

const container = document.getElementById('root');
const root = createRoot(container!);
async function init() {
  console.log("Showing splash...")
  await SplashScreen.show({
    showDuration:2000,
    autoHide: true,
  });
}
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
init();