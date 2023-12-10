import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useParams } from 'react-router';
import './Page.css';
import Resources from '../components/Resources';
import PageHeader from '../components/PageHeader';
import { useContext } from 'react';
import { LunaOnlineContext } from '../utils/contexts';

interface IPageProps<T> {

}

type PageI<T = any> = React.FC<IPageProps<T>>

const Page: PageI = () => {

  const online = useContext(LunaOnlineContext);

  return (online.state ? <>
    <IonPage><PageHeader title={"My Colony"} />
      <IonContent>
        L.U.N.A is in early development.
      </IonContent>
    </IonPage></>
    :
    <div>
      You must be online to use this.
    </div>
  );
};

export default Page;
