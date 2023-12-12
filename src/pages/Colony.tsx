import { IonAvatar, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonList, IonMenuButton, IonNote, IonPage, IonProgressBar, IonThumbnail, IonTitle, IonToolbar } from '@ionic/react';
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
        <IonPage><PageHeader title={"My Colony"} />
            <IonContent>
                L.U.N.A is in early development. -- Colony
                <AlertPanel header="Power" title='Power Production and Usage'>
                    <IonItem className='resource-progress-bar'>
                        <IonNote slot="start">{MyResources.power}</IonNote>
                        <IonLabel>
                            <IonProgressBar value={MyResources.power / (MyResources.powerOut * 2)} buffer={1}></IonProgressBar>
                        </IonLabel>
                        <IonNote slot="end">{MyResources.powerOut}</IonNote>
                    </IonItem>
                    <IonLabel>
                        Power Efficiency: {((MyResources.power / (MyResources.powerOut))* 100).toFixed(2)}%
                    </IonLabel>
                </AlertPanel>
                <AlertPanel header="Water" title='Water Production and Usage'>
                    <IonItem className='resource-progress-bar'>
                        <IonNote slot="start">{MyResources.water}</IonNote>
                        <IonLabel>
                            <IonProgressBar value={MyResources.water / (MyResources.waterOut * 2)} buffer={1}></IonProgressBar>
                        </IonLabel>
                        <IonNote slot="end">{MyResources.waterOut}</IonNote>
                    </IonItem>
                    <IonLabel>
                        Water Efficiency: {((MyResources.water / (MyResources.waterOut))* 100).toFixed(2)}%
                    </IonLabel>
                </AlertPanel>
                <AlertPanel header="Colonists" title='Population'>
                    <IonList>
                        <IonLabel>
                            Housing Provided: 0
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
                            <IonLabel>
                                Archon's Notes: {MyResources.currency || 0}
                            </IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonThumbnail slot='start' >
                                <img alt={`${faction} Resource Image`} src={`https://reisama.net/assets/UCR_${faction}.png`} />
                            </IonThumbnail>
                            <IonLabel>
                                {factionData.ucr_name}: {MyResources.ucr || 0}
                            </IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonThumbnail slot='start' >
                                <img alt={`${faction} Construction Resource Image`} src={`https://reisama.net/assets/RESOURCE_${faction}.png`} />
                            </IonThumbnail>
                            <IonLabel>
                                {factionData.resource_name}: {MyResources.fac_res || 0}
                            </IonLabel>
                        </IonItem>
                    </IonList>
                </AlertPanel>
            </IonContent>
        </IonPage></>
        :
        <div>
            You must be online to use this.
        </div>
    );
};

export default Colony;