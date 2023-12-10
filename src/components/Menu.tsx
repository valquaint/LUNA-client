import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
} from '@ionic/react';

import { Link, useHistory, useLocation } from 'react-router-dom';
import { archiveOutline, archiveSharp, bookmarkOutline, heartOutline, heartSharp, homeOutline, homeSharp, mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, trailSign, trailSignSharp, trashOutline, trashSharp, warningOutline, warningSharp } from 'ionicons/icons';
import './Menu.css';
import { useContext, useEffect, useState } from 'react';
import { Preferences } from '@capacitor/preferences';
import { LunaOnlineContext } from '../utils/contexts';

interface AppPage {
  url: string;
  iosIcon: string;
  mdIcon: string;
  title: string;
}

const appPages: AppPage[] = [
  {
    title: 'Home',
    url: '/Home',
    iosIcon: homeOutline,
    mdIcon: homeSharp
  },
  {
    title: 'My Colony',
    url: '/Colony',
    iosIcon: paperPlaneOutline,
    mdIcon: paperPlaneSharp
  },
  {
    title: 'Faction',
    url: '/Faction',
    iosIcon: heartOutline,
    mdIcon: heartSharp
  },
  {
    title: 'Global Stats',
    url: '/GlobalStats',
    iosIcon: archiveOutline,
    mdIcon: archiveSharp
  },
  {
    title: 'Settings',
    url: '/Settings',
    iosIcon: trashOutline,
    mdIcon: trashSharp
  },
  {
    title: 'Logout',
    url: '/Logout',
    iosIcon: warningOutline,
    mdIcon: warningSharp
  }
];

const Menu: React.FC = () => {
  const location = useLocation();
  const [username, setUsername] = useState("Loading");
  const [colony_name, setColony_name] = useState("Loading");
  const [faction, setFaction] = useState("Loading");
  const [superuser, setSuperuser] = useState(false);
  const history = useHistory();

  const online = useContext(LunaOnlineContext);

  useEffect(() => {
    const loadUserData = async () => {
      const { value } = await Preferences.get({ key: 'userdata' });
      console.log(value);
      if (value) {
        const result = JSON.parse(value);
        setUsername(result.username);
        setFaction(result.faction_name);
        setColony_name(result.colony_name);
      }

    }
    loadUserData();
  })

  useEffect(() => {
    console.log("Will ping");
    online.ping().then(async () => {
      console.log("Pong.")
      const result = await online.pull();
      console.log(result.superuser)
      setSuperuser(result.superuser);
    });
  })

  const downloadUpdate = async (e:any) => {
    const { value } = await Preferences.get({ key: 'tokens' });
    if (value) {
      const { access, refresh } = JSON.parse(value);
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/update`, {
        headers: {
          "x-access-token": access,
          "x-refresh-token": refresh
        }
      })
      const blob = await response.blob();
      const downloadURL = window.URL.createObjectURL(new Blob([blob]));
    }
  }

  return (
    <IonMenu contentId="main" type="overlay">
      <IonContent>
        <IonList id="nav-list">
          <IonListHeader>Colony: {colony_name}</IonListHeader>
          <IonNote>{username} of the {faction}</IonNote>
          {appPages.map((appPage, index) => {
            return (
              <IonMenuToggle key={index} autoHide={false}><Link to={appPage.url} >
                <IonItem className={location.pathname === appPage.url ? 'selected' : ''} lines="none" detail={false}>
                  <IonIcon aria-hidden="true" slot="start" ios={appPage.iosIcon} md={appPage.mdIcon} />
                  {appPage.title}
                </IonItem></Link>
              </IonMenuToggle>
            );
          })}
          {superuser && <IonList><IonListHeader>
            Super User
                </IonListHeader>
            <IonItem>
            <IonLabel>
              Get Latest Version
              </IonLabel>
              <IonButton onClick={downloadUpdate}>
                Download
                </IonButton>
                </IonItem ></IonList>
                }
          </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
