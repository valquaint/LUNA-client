import { IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonList, IonMenuButton, IonNote, IonPage, IonThumbnail, IonTitle, IonToolbar } from '@ionic/react';
import { useParams } from 'react-router';
import './Page.css';
import Resources from '../components/Resources';
import PageHeader from '../components/PageHeader';
import { useContext, useEffect, useState } from 'react';
import { LunaOfflineContext, LunaOnlineContext } from '../utils/contexts';
import { Preferences } from '@capacitor/preferences';
import { AlertPanel } from '../components/AlertPanel';

interface IFactionProps<T> {

}

type FactionI<T = any> = React.FC<IFactionProps<T>>

const Faction: FactionI = () => {

    const online = useContext(LunaOnlineContext);
    const dataStore = useContext(LunaOfflineContext);
    const [faction, setFaction] = useState("");
    const [factionData, setFactionData] = useState<any>()
    const [factionResource, setFactionResource] = useState(0);
    const [factionCurrency, setFactionCurrency] = useState(0);


    useEffect(() => {
        console.log("Faction")
        online.pull().then((result: any) => {
            console.log("========>", result)
            console.log(result);
            if (result.faction_name) setFaction(result.faction_name)
        });
        const loadFaction = async () => {
            if (factionData) {
                console.log(factionData)
                const { value } = await Preferences.get({ key: 'tokens' });
                if (value) {
                    const { access, refresh } = JSON.parse(value);
                    const isValidated = await fetch(`${import.meta.env.VITE_SERVER_URL}/factions`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "x-access-token": access,
                            "x-refresh-token": refresh
                        },
                        body: JSON.stringify({ "faction_id": factionData.faction_id })
                    })
                    const fac_totals = (await isValidated.json()).msg as Array<any>;
                    console.log(fac_totals)
                    const fac_res = fac_totals.reduce((total, current) => total + current.faction_resource, 0);
                    const fac_currency = fac_totals.reduce((total, current) => total + current.currency, 0);
                    setFactionResource(fac_res);
                    setFactionCurrency(fac_currency);
                }
            }

        }

        if (typeof dataStore.state?.find === "function") {
            const newData = (dataStore.state as Array<any>).find(findfaction => findfaction.faction_name === faction);
            setFactionData(newData);
            loadFaction();
        }
    });
    // useEffect(() => {

    // }, [factionData, setFaction, online])

    // useEffect(() => {

    // }, [factionData])

    return (online.state ? <>
        {factionData && <IonPage><PageHeader title={faction} />
            <IonContent>
                L.U.N.A is in early development.
                <AlertPanel header="Global Stats" title='Faction Global Wealth'>
                    <IonList>
                        <IonItem>

                            <IonThumbnail slot='start' >
                                <img alt={`Archon's Notes Image`} src={`https://reisama.net/assets/RESOURCE_currency.png`} />
                            </IonThumbnail>
                            <IonLabel className='alert-wide'>Archon Notes</IonLabel>
                            <IonNote slot='end'>
                                {factionCurrency || 0}
                            </IonNote>
                        </IonItem>
                        <IonItem>
                            <IonThumbnail slot='start' >
                                <img alt={`${faction} Unique Resource Image`} src={`https://reisama.net/assets/RESOURCE_${faction}.png`} />
                            </IonThumbnail>
                            <IonLabel>
                                {factionData.resource_name}
                            </IonLabel>
                            <IonNote slot='end'>
                                {factionResource || 0}
                            </IonNote>
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

export default Faction;
