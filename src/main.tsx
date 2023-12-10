import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { SplashScreen } from '@capacitor/splash-screen';
import { OfflineProvider } from './utils/contexts';
import { Preferences } from '@capacitor/preferences';

// Call the element loader before the render call
defineCustomElements(window);

const container = document.getElementById('root');
const root = createRoot(container!);
async function init() {
  console.log("Showing splash...")
  await SplashScreen.show({
    showDuration:2000,
    autoHide: false,
  });
}

async function downloadDataStore(isLoad?:boolean){
  try{
    const datastore = await (await fetch(`${import.meta.env.VITE_SERVER_URL}/datastore`)).json();
    console.log(datastore);
    await Preferences.set({
      key: 'datastore',
      value: JSON.stringify(datastore),
  })
  }catch(err){
    console.log(err);
  }
  if(isLoad){
    await SplashScreen.hide();
  }
}
root.render(
  <React.StrictMode>
    <OfflineProvider pull={downloadDataStore} >
    <App />
    </OfflineProvider>
  </React.StrictMode>
);
init();