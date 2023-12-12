import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route, Switch } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import Menu from './components/Menu';
import {LunaProvider, LunaResourceProvider} from './utils/contexts';

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
import Register from './pages/Register';
import Home from './pages/Home';
import Login from './pages/Login';
import Colony from './pages/Colony';
import Logout from './pages/Logout';
import Faction from './pages/Faction';
import Shop from './pages/Shop';

setupIonicReact();
function ping(): Promise<boolean> {
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

type userDetails = {
  colony_name:string,
  currency:number,
  faction_name:string,
  faction_resource:number,
  ucr:number,
  username:string
}
function pull(): Promise<userDetails|null> {
  return new Promise( async (resolve) => {
    
    const { value } = await Preferences.get({ key: 'tokens' });
    if(value){
      const {access, refresh} = JSON.parse(value);
    try {
      const details = await fetch(`${import.meta.env.VITE_SERVER_URL}/user`,{
        method:"POST",
          headers: {
            "x-access-token":access,
            "x-refresh-token":refresh
          }
      })
      const result = await details.json();
      console.log("Pull Result:", result)
      resolve(result)
    }catch (err){
      resolve(null)
    }
  }
  })
}
const App: React.FC = () => {

  const [online, setOnline] = useState<boolean>(false);

  useEffect( () => {
    async function act() {
      const isOnline = await ping();
      setOnline(isOnline)
    }
    act();
  }, [setOnline, ping])

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
          setVerified(false);
          await Preferences.remove({ key: "tokens"}).catch(console.log);
          await Preferences.remove({ key: "userdata"}).catch(console.log);
        }
        
      }else{
        const { value } = await Preferences.get({ key: 'userdata' });
        if(value) await Preferences.remove({ key: "userdata"}).catch(console.log);
        setVerified(false);
      }
    }
    checkVerified();
  },[setVerified])

  return (
    <IonApp>
      <IonReactRouter>
        { !verified &&
        <IonRouterOutlet id="main"><Switch>
        <Route path="/Register" exact={true}>
          <Register setVerified={setVerified} />
        </Route>
        <Route path="/" exact={true}>
          <Login setVerified={setVerified}/>
        </Route>
        <Route path="*">
          <Redirect to="/"/>
        </Route></Switch>
      </IonRouterOutlet>
        }
        {verified && <LunaResourceProvider update={pull}><LunaProvider state={online} updater={setOnline} ping={ping} pull={pull} post={pull}><IonSplitPane contentId="main"> 
          <Menu /> 
          <IonRouterOutlet id="main">
            <Route path="/Home" exact={true}>
              <Home/>
            </Route>
            <Route path="/Colony" exact={true}>
              <Colony/>
            </Route>
            <Route path="/Faction" exact={true}>
              <Faction/>
            </Route>
            <Route path="/Shop" exact={true}>
              <Shop/>
            </Route>
            <Route path="/Logout" exact={true}>
              <Logout update={setVerified}/>
            </Route>
            <Route path="/" exact={true}>
              <Home/>
            </Route>
          </IonRouterOutlet>
        </IonSplitPane></LunaProvider></LunaResourceProvider> }
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
