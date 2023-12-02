import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
} from '@ionic/react';

import { useLocation } from 'react-router-dom';
import { archiveOutline, archiveSharp, bookmarkOutline, heartOutline, heartSharp, homeOutline, homeSharp, mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, trailSign, trailSignSharp, trashOutline, trashSharp, warningOutline, warningSharp } from 'ionicons/icons';
import './Menu.css';
import { useEffect, useState } from 'react';
import { Preferences } from '@capacitor/preferences';

interface AppPage {
  url: string;
  iosIcon: string;
  mdIcon: string;
  title: string;
}

const appPages: AppPage[] = [
  {
    title: 'Home',
    url: '/folder/Home',
    iosIcon: homeOutline,
    mdIcon: homeSharp
  },
  {
    title: 'Outbox',
    url: '/folder/Outbox',
    iosIcon: paperPlaneOutline,
    mdIcon: paperPlaneSharp
  },
  {
    title: 'Favorites',
    url: '/folder/Favorites',
    iosIcon: heartOutline,
    mdIcon: heartSharp
  },
  {
    title: 'Archived',
    url: '/folder/Archived',
    iosIcon: archiveOutline,
    mdIcon: archiveSharp
  },
  {
    title: 'Trash',
    url: '/folder/Trash',
    iosIcon: trashOutline,
    mdIcon: trashSharp
  },
  {
    title: 'Spam',
    url: '/folder/Spam',
    iosIcon: warningOutline,
    mdIcon: warningSharp
  }
];

const Menu: React.FC = () => {
  const location = useLocation();
  const [username, setUsername] = useState("Loading");
  const [colony_name, setColony_name] = useState("Loading");
  const [faction, setFaction] = useState("Loading");

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

  return (
    <IonMenu contentId="main" type="overlay">
      <IonContent>
        <IonList id="nav-list">
          <IonListHeader>Colony: {colony_name}</IonListHeader>
          <IonNote>{username} of the {faction}</IonNote>
          {appPages.map((appPage, index) => {
            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem className={location.pathname === appPage.url ? 'selected' : ''} routerLink={appPage.url} routerDirection="none" lines="none" detail={false}>
                  <IonIcon aria-hidden="true" slot="start" ios={appPage.iosIcon} md={appPage.mdIcon} />
                  <IonLabel>{appPage.title}</IonLabel>
                </IonItem>
              </IonMenuToggle>
            );
          })}
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
