import { IonAvatar, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonChip, IonContent, IonFabButton, IonHeader, IonItem, IonItemDivider, IonLabel, IonList, IonMenuButton, IonPage, IonTitle, IonToolbar, useIonActionSheet } from '@ionic/react';
import './Page.css';
import Resources from '../components/Resources';
import PageHeader from '../components/PageHeader';
import { LunaOnlineContext, LunaResourceContext } from '../utils/contexts';
import { useContext, useEffect, useState } from 'react';
import { AlertPanel } from '../components/AlertPanel';
import { Expedition } from '../components/Expedition';

interface IPageProps<T> {
}

type PageI<T = any> = React.FC<IPageProps<T>>

const Home: PageI = () => {
    const online = useContext(LunaOnlineContext);
    const [colonyName, setColonyName] = useState("");
    const [faction, setFaction] = useState("");

    const MyResources = useContext(LunaResourceContext);

    
    console.log(online.state);
    useEffect(() => {
        console.log("Home")
        online.pull().then((result: any) => {
            console.log(result);
            setColonyName(result.colony_name);
            setFaction(result.faction_name);
            console.log("Faction set to", faction)
            MyResources.update().then(() => {
                console.log("Resources update.");
            })
        });
    })
    
    return (online.state ? <>
        <IonPage><PageHeader title={"Home"} />
            <IonContent>
                <Resources power={MyResources.power || 0} water={MyResources.water || 0} population={MyResources.population || 0} f_resource={MyResources.fac_res || 0}/>
                L.U.N.A is in early development.
                <IonList id="register">
                    <AlertPanel header='At A Glance' title={colonyName} subtitle={"You must construct additional pylons..."}>Blah</AlertPanel>
                    <AlertPanel header='Activities' title={"Expeditions: Begin an Expedition"} subtitle={"The stars await..."}>
                        <IonButton id='start-task' expand='block'>Begin Setup</IonButton>
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
