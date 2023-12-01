import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useParams } from 'react-router';
import ExploreContainer from '../components/ExploreContainer';
import './Page.css';

interface IPageProps<T> {
  isOnline: Boolean
}

type PageI<T = any> = React.FC<IPageProps<T>>

const Page: PageI = ({isOnline}) => {

  const { name } = useParams<{ name: string; }>();

  return ( isOnline ? 
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>{name}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{name}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer name={name} />
      </IonContent>
    </IonPage>
    :
    <div>
      You must be online to use this.
    </div>
  );
};

export default Page;
