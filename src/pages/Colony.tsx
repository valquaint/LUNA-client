import { IonAvatar, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonList, IonMenuButton, IonNote, IonPage, IonProgressBar, IonThumbnail, IonTitle, IonToolbar } from '@ionic/react';
import './Page.css';
import Resources from '../components/Resources';
import PageHeader from '../components/PageHeader';
import { useContext, useEffect, useState } from 'react';
import { LunaOfflineContext, LunaOnlineContext } from '../utils/contexts';
import { AlertPanel } from '../components/AlertPanel';

interface IPageProps<T> {
}

type PageI<T = any> = React.FC<IPageProps<T>>

const Colony: PageI = () => {
    const online = useContext(LunaOnlineContext);
    const [currency, setCurrency] = useState(0);
    const dataStore = useContext(LunaOfflineContext);
    const [factionData, setFactionData] = useState<any>();
    const [faction, setFaction] = useState("");


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
            setCurrency(result.currency)
            setFaction(result.faction_name)
        });
    })
    return (online.state ? <>
        <IonPage><PageHeader title={"My Colony"} />
            <IonContent>
                L.U.N.A is in early development. -- Colony
                <AlertPanel header="Power" title='Power Production and Usage'>
                    <IonItem>
                        <IonNote slot="start">0</IonNote>
                        <IonLabel>
                            <IonProgressBar value={0.5} buffer={1} className='resource-bar' ></IonProgressBar>
                        </IonLabel>
                        <IonNote slot="end">0</IonNote>
                    </IonItem>
                    <IonLabel>
                        Power Consumers: 0
                    </IonLabel>
                </AlertPanel>
                <AlertPanel header="Water" title='Water Production and Usage'>
                    <IonList>
                        <IonLabel>
                            <IonProgressBar value={0.5} buffer={1} className='resource-bar' />
                        </IonLabel>
                        <IonLabel>
                            Water Consumers: 0
                        </IonLabel>
                    </IonList>
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
                                Archon's Notes: {currency || 0}
                            </IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonThumbnail slot='start' >
                                <img alt={`${faction} Currency Image`} src="https://reisama.net/assets/RESOURCE_currency.png" />
                            </IonThumbnail>
                            <IonLabel>
                                {faction}'s Currency: {currency || 0}
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