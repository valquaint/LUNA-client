import { IonAvatar, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonItem, IonLabel, IonList, IonMenuButton, IonNote, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useParams } from 'react-router';
import './Page.css';
import Resources from '../components/Resources';
import PageHeader from '../components/PageHeader';
import { useContext, useEffect, useState } from 'react';
import { LunaOfflineContext, LunaOnlineContext } from '../utils/contexts';
import { Preferences } from '@capacitor/preferences';

interface IGlobalProps<T> {

}

type GlobalI<T = any> = React.FC<IGlobalProps<T>>

const Global: GlobalI = () => {

    const online = useContext(LunaOnlineContext);

    const dataStore = useContext(LunaOfflineContext);

    const [factions, setFactions] = useState<Array<any>>([]);

    useEffect(() => {

        const loadFaction = async () => {
            const { value } = await Preferences.get({ key: 'tokens' });
            if (value) {
                const { access, refresh } = JSON.parse(value);
                const isValidated = await fetch(`${import.meta.env.VITE_SERVER_URL}/factions`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-access-token": access,
                        "x-refresh-token": refresh
                    }
                })
                const fac_totals = (await isValidated.json()).msg as Array<any>;
                console.log(fac_totals)
                const totals = [
                    { name: dataStore.state[0].faction_name, faction_resource: 0, currency: 0 },
                    { name: dataStore.state[1].faction_name, faction_resource: 0, currency: 0 },
                    { name: dataStore.state[2].faction_name, faction_resource: 0, currency: 0 }]
                for (const fac of fac_totals) {
                    console.log(totals);
                    console.log(fac);
                    totals[fac.faction_id - 1].faction_resource += fac.faction_resource;
                    totals[fac.faction_id - 1].currency += fac.currency;
                }
                setFactions(totals);
            }
        }

        loadFaction();
    }, [setFactions])

    return (online.state ? <>
        <IonPage><PageHeader title={"Global Stats"} />
            <IonContent>
                L.U.N.A is in early development.

                {factions.length && factions.map((faction, id) => {
                    return <IonList>
                        <IonCard>
                            <IonItem>
                                <IonAvatar>
                                    <img src={`${import.meta.env.VITE_SERVER_URL}/assets/${faction.name}_logo.png`} alt={`${faction.name} Faction Image`} />
                                </IonAvatar>
                                <IonCardHeader>
                                    <IonTitle>
                                        {faction.name}
                                    </IonTitle>
                                </IonCardHeader>
                            </IonItem>
                            <IonItem>
                                <IonList>
                                    <IonItem>
                                        <IonAvatar>
                                            <img src={`${import.meta.env.VITE_SERVER_URL}/assets/RESOURCE_${faction.name}.png`} alt={`${faction.name} Unique Resource Image`} />
                                        </IonAvatar>
                                        <IonLabel>{dataStore.state[id].resource_name}</IonLabel>
                                        <IonNote slot='end'>
                                            {faction.faction_resource}
                                        </IonNote>
                                    </IonItem>

                                    <IonItem>
                                        <IonAvatar>
                                            <img src={`${import.meta.env.VITE_SERVER_URL}/assets/RESOURCE_currency.png`} alt={`Archon Notes Image`} />
                                        </IonAvatar>
                                        <IonLabel>Archon Notes</IonLabel>
                                        <IonNote slot='end'>
                                            {faction.currency}
                                        </IonNote>
                                    </IonItem>
                                </IonList>
                            </IonItem>
                        </IonCard>
                    </IonList>
                })}
            </IonContent>
        </IonPage></>
        :
        <div>
            You must be online to use this.
        </div>
    );
};

export default Global;
