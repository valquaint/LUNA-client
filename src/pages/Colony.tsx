import { IonAvatar, IonButtons, IonCardSubtitle, IonContent, IonHeader, IonItem, IonLabel, IonList, IonMenuButton, IonNote, IonPage, IonProgressBar, IonThumbnail, IonTitle, IonToolbar } from '@ionic/react';
import './Page.css';
import Resources from '../components/Resources';
import PageHeader from '../components/PageHeader';
import { useContext, useEffect, useState } from 'react';
import { LunaOfflineContext, LunaOnlineContext, LunaResourceContext } from '../utils/contexts';
import { AlertPanel } from '../components/AlertPanel';

interface IPageProps<T> {
}

type PageI<T = any> = React.FC<IPageProps<T>>

const Colony: PageI = () => {
    const online = useContext(LunaOnlineContext);
    const dataStore = useContext(LunaOfflineContext);
    const [factionData, setFactionData] = useState<any>();
    const [faction, setFaction] = useState("");

    const MyResources = useContext(LunaResourceContext);

    useEffect(() => {
        if (typeof dataStore.state?.find === "function") {
            const newData = (dataStore.state as Array<any>).find(findfaction => findfaction.faction_name === faction);
            setFactionData(newData);
        }
    });
    useEffect(() => {
        console.log("Colony")
        online.pull().then((result: any) => {
            console.log(result);
            setFaction(result.faction_name)
        });
        
        MyResources.update().then(() => {
            console.log("Resources update.");
        })
    })
    return (online.state ? <>
        {factionData && <IonPage><PageHeader title={"My Colony"} />
            <IonContent>
                L.U.N.A is in early development. -- Colony
                <AlertPanel header="Power" title='Power Production and Usage'>
                    <IonItem className='resource-progress-bar'>
                        <IonNote slot="start">{MyResources.power || 0}</IonNote>
                        <IonLabel>
                            <IonProgressBar value={(MyResources.power || 0) / ((MyResources.powerOut || 1) * 2)} buffer={1}></IonProgressBar>
                        </IonLabel>
                        <IonNote slot="end">{MyResources.powerOut || 0}</IonNote>
                    </IonItem>
                    <IonLabel>
                        Power Efficiency: {(((MyResources.power || 0) / (MyResources.powerOut || 1))* 100).toFixed(2)}%
                    </IonLabel>
                </AlertPanel>
                <AlertPanel header="Water" title='Water Production and Usage'>
                    <IonItem className='resource-progress-bar'>
                        <IonNote slot="start">{MyResources.water || 0}</IonNote>
                        <IonLabel>
                            <IonProgressBar value={(MyResources.water || 0)  / ((MyResources.waterOut || 1) * 2)} buffer={1}></IonProgressBar>
                        </IonLabel>
                        <IonNote slot="end">{MyResources.waterOut || 0}</IonNote>
                    </IonItem>
                    <IonLabel>
                        Water Efficiency: {(((MyResources.water || 0) / (MyResources.waterOut || 1))* 100).toFixed(2)}%
                    </IonLabel>
                </AlertPanel>
                <AlertPanel header="Colonists" title='Population'>
                    <IonList>
                        <IonLabel>
                            Housing Provided: {MyResources.population || 0}
                        </IonLabel>
                        <IonLabel>
                            Housing Used: 0
                        </IonLabel>
                    </IonList>
                </AlertPanel>

                <AlertPanel header="Finances" title='Income and Expences'>
                    <IonList>
                        <IonItem>

                            <IonThumbnail slot='start' >
                                <img alt={`Archon's Notes Image`} src="https://reisama.net/assets/RESOURCE_currency.png" />
                            </IonThumbnail>
                            <IonCardSubtitle>
                                Archon's Notes
                            </IonCardSubtitle>
                            <IonNote slot='end'>{MyResources.currency || 0}</IonNote>
                        </IonItem>
                        <IonItem>
                            <IonThumbnail slot='start' >
                                <img alt={`${faction} Resource Image`} src={`https://reisama.net/assets/UCR_${faction}.png`} />
                            </IonThumbnail>
                            <IonCardSubtitle>
                                {factionData.ucr_name}
                            </IonCardSubtitle>
                            <IonNote slot='end'>{MyResources.ucr || 0}</IonNote>
                        </IonItem>
                        <IonItem>
                            <IonThumbnail slot='start' >
                                <img alt={`${faction} Construction Resource Image`} src={`https://reisama.net/assets/RESOURCE_${faction}.png`} />
                            </IonThumbnail>
                            <IonCardSubtitle>
                                {factionData.resource_name}
                            </IonCardSubtitle>
                            <IonNote slot='end'>{MyResources.fac_res || 0}</IonNote>
                        </IonItem>
                    </IonList>
                </AlertPanel>
            </IonContent>
        </IonPage>}</>
        :
        <div>
            You must be online to use this.
        </div>
    );
};

export default Colony;