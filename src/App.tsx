import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Menu from './components/Menu';
import Page from './pages/Page';
import Login from './pages/Login';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

/* Capacitor Plugins */
import { Preferences } from '@capacitor/preferences';

setupIonicReact();
function ping(): Promise<Boolean> {
  return new Promise(async (resolve) => {
    try {
      
      const ping = await fetch(`${import.meta.env.VITE_SERVER_URL}/ping`).catch((err) => {
        console.log(err);
      })
      if (typeof ping === "object" && ping.status === 200) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (err) {
      resolve(false);
    }
  })
}
const App: React.FC = () => {

  const [online, setOnline] = useState<Boolean>(false);

  useEffect( () => {
    async function act() {
      const isOnline = await ping();
      setOnline(isOnline)
    }
    act();
  })

  const [verified, setVerified] = useState(false);

  useEffect( () => {
    async function checkVerified() {
      const { value } = await Preferences.get({ key: 'tokens' });
      if(value){
        const {access, refresh} = JSON.parse(value);
        const isValidated = await fetch(`${import.meta.env.VITE_SERVER_URL}/authorize`,{
          method:"POST",
          headers: {
            "x-access-token":access,
            "x-refresh-token":refresh
          }
        })
        if(isValidated.status===200){
          const {faction_name, colony_name, username} = await isValidated.json();
          await Preferences.set({
            key: 'userdata',
            value: JSON.stringify({faction_name, colony_name, username}),
        });
          setVerified(true);
        }else{
          await Preferences.remove({ key: "tokens"}).catch(console.log);
          setVerified(false);
        }
        
      }else{
        setVerified(false);
      }
    }
    checkVerified();
  })

  return (
    <IonApp>
      <IonReactRouter>
        { !verified && <Login setVerified={setVerified}/> }
        {verified && <IonSplitPane contentId="main"> 
          <Menu /> 
          <IonRouterOutlet id="main">
            <Route path="/" exact={true}>
              <Redirect to="/folder/Home" />
            </Route>
            <Route path="/folder/:name" exact={true}>
              <Page isOnline={online}/>
            </Route>
          </IonRouterOutlet>
        </IonSplitPane> }
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
