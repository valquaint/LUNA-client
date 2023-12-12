import { IonAccordion, IonAccordionGroup, IonAvatar, IonButton, IonButtons, IonChip, IonContent, IonHeader, IonItem, IonLabel, IonList, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import './Page.css';
import PageHeader from '../components/PageHeader';
import { useContext, useEffect, useState } from 'react';
import { LunaOfflineContext, LunaOnlineContext } from '../utils/contexts';
import { Preferences } from '@capacitor/preferences';
import { useHistory } from 'react-router-dom';

interface IShopProps<T> {

}
type product = {
    id: number,
    faction: number, // Owning Faction
    type: number, // Product Type
    ucr: number, // Cost of Unique Resource
    power: number, // Power Cost in Upkeep
    gain: number, // Gain per Day
    water: number, // Water Cost in Upkeep
    name: string, // Product Name
    description: string // Product Description
}
type ShopI<T = any> = React.FC<IShopProps<T>>

const TYPES = [null, "power", "water", "population"]

const Shop: ShopI = () => {


    const [resource, setResource] = useState(0);
    const [ucr, setUcr] = useState(0);

    const online = useContext(LunaOnlineContext);
    const dataStore = useContext(LunaOfflineContext);
    const [factionData, setFactionData] = useState<any>();
    const [faction, setFaction] = useState("");
    const [sale, setSale] = useState<Array<product>>([]);
    const [hasProducts, setHasProducts] = useState(false);
    const history = useHistory();

    useEffect( () => {
        if (typeof dataStore.state?.find === "function") {
            console.log("FIRST")
            if(!faction){
                online.pull().then(async (result: any) => {
                    console.log("========>", result)
                    console.log(result);
                    if (result.faction_name) setFaction(result.faction_name)
                });
            }
            const newData = (dataStore.state as Array<any>).find(findfaction => findfaction.faction_name === faction);
            setFactionData(newData);
        }else{
            console.log("SHOP")
            online.pull().then(async (result: any) => {
                console.log("========>", result)
                console.log(result);
                if (result.faction_name) setFaction(result.faction_name)
            });
        }
    }, [setFactionData, dataStore, faction, setFaction])

    useEffect(() => {
        
        const loadShop = async () => {
            if (factionData) {
                console.log(factionData)
                console.log("========= SHOP ==========")
                const { value } = await Preferences.get({ key: 'tokens' });
                if (value) {
                    console.log(factionData.faction_id)
                    const { access, refresh } = JSON.parse(value);
                    const products = await fetch(`${import.meta.env.VITE_SERVER_URL}/shop`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "x-access-token": access,
                            "x-refresh-token": refresh
                        },
                        body: JSON.stringify({ "faction_id": factionData.faction_id })
                    })
                    const forSale = (await products.json()).msg as Array<product>;
                    console.log(forSale);
                    setSale(forSale);
                    setHasProducts(true);
                }
            }
        }
        
        loadShop();
    },[setSale, factionData, setHasProducts]);

    const buy = async (item:product) => {
        const { value } = await Preferences.get({ key: 'tokens' });
                if (value) {
                    console.log(factionData.faction_id)
                    const { access, refresh } = JSON.parse(value);
                    const products = await fetch(`${import.meta.env.VITE_SERVER_URL}/buy`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "x-access-token": access,
                            "x-refresh-token": refresh
                        },
                        body: JSON.stringify({ "product": item.id })
                    })
                    if(products.status === 200){
                        console.log("===============", "Purchase Successful");
                    }else{
                        console.log("==============", "Error with purchase")
                    }
                }
    }

    return (online.state ? <>
        <IonPage><PageHeader title={"Or-Bitz"} />
            <IonContent>
                L.U.N.A is in early development.
                <IonList><IonAccordionGroup>
                    {hasProducts && sale.map(item => <IonAccordion key={item.id}>
                        <IonItem slot="header">
                            <IonLabel>{item.name}</IonLabel>
                        </IonItem>
                        <div className="ion-padding" slot="content">
                            {item.description}
                        </div>
                        <div className="ion-padding" slot="content">
                            <IonLabel>Costs/Upkeep</IonLabel>
                            <IonChip>
                                <IonAvatar>
                                    <img alt="Resource Image" src={`${import.meta.env.VITE_SERVER_URL}/assets/UCR_${faction}.png`} />
                                </IonAvatar>
                                <IonLabel>{item.ucr}</IonLabel>
                            </IonChip>
                            <IonChip>
                                <IonAvatar>
                                    <img alt="Water Image" src={`${import.meta.env.VITE_SERVER_URL}/assets/RESOURCE_water.png`} />
                                </IonAvatar>
                                <IonLabel>{item.water}</IonLabel>
                            </IonChip>
                            <IonChip>
                                <IonAvatar>
                                    <img alt="Power Image" src={`${import.meta.env.VITE_SERVER_URL}/assets/RESOURCE_power.png`} />
                                </IonAvatar>
                                <IonLabel>{item.power}</IonLabel>
                            </IonChip>
                        </div>
                        
                        <div className="ion-padding" slot="content">
                            <IonLabel>Produces</IonLabel>
                            <IonChip>
                                <IonAvatar>
                                    <img alt="Resource Image" src={`${import.meta.env.VITE_SERVER_URL}/assets/RESOURCE_${TYPES[item.type]}.png`} />
                                </IonAvatar>
                                <IonLabel>{item.gain}</IonLabel>
                            </IonChip>
                        </div>
                        <div className="ion-padding" slot="content"><IonButton color={"tertiary"} onClick={async () => await buy(item)}>Buy</IonButton></div>
                        
                    </IonAccordion>)}</IonAccordionGroup>
                </IonList>
            </IonContent>
        </IonPage></>
        :
        <div>
            You must be online to use this.
        </div>
    );
};

export default Shop;
