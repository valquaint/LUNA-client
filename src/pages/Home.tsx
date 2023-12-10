import { IonAvatar, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonChip, IonContent, IonFabButton, IonHeader, IonItem, IonItemDivider, IonLabel, IonList, IonMenuButton, IonPage, IonTitle, IonToolbar, useIonActionSheet } from '@ionic/react';
import './Page.css';
import Resources from '../components/Resources';
import PageHeader from '../components/PageHeader';
import { LunaOnlineContext } from '../utils/contexts';
import { useContext, useEffect, useState } from 'react';
import { AlertPanel } from '../components/AlertPanel';
import { Expedition } from '../components/Expedition';

interface IPageProps<T> {
}

type PageI<T = any> = React.FC<IPageProps<T>>

const Home: PageI = () => {
    const online = useContext(LunaOnlineContext);
    const [facResource, setFacResource] = useState(0)
    const [colonyName, setColonyName] = useState("");
    const [faction, setFaction] = useState("");


    
    console.log(online.state);
    useEffect(() => {
        console.log("Home")
        online.pull().then((result: any) => {
            console.log(result);
            setFacResource(result.faction_resource);
            setColonyName(result.colony_name);
            setFaction(result.faction_name);
            console.log("Faction set to", faction)
        });
    })
    
    return (online.state ? <>
        <IonPage><PageHeader title={"Home"} />
            <IonContent>
                <Resources power={40} water={50} population={100} f_resource={facResource}/>
                L.U.N.A is in early development.
                <IonList id="register">
                    <AlertPanel header='At A Glance' title={colonyName} subtitle={"You must construct additional pylons..."}>Blah</AlertPanel>
                    <AlertPanel header='Expedition' title={"Envoy: Acquire Flxodine"} subtitle={"Our liaisons are ready..."}>
                        <IonButton id='start-task' expand='block'>Begin Expedition</IonButton>
                        <Expedition trigger='start-task'/>
                    </AlertPanel>
                </IonList>
            </IonContent>
        </IonPage></>
        :
        <div>
            You must be online to use this.
        </div>
    );
};

export default Home;
