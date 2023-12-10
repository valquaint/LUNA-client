import { IonAvatar, IonChip, IonLabel, IonTitle } from "@ionic/react";
import styled from "styled-components";
import { LunaOnlineContext, LunaOfflineContext } from '../utils/contexts';
import { useContext, useEffect, useState } from "react";



const ResourceBar = styled.div`
    position: relative;
    display: flex;
    justify-content: space-evenly;
`

const InlineBar = styled.div`
    display: flex;
    justify-content: space-evenly;
`
interface IResourceProps<T> {
    power?: number,
    water?: number,
    population?: number,
    currency?: number,
    f_resource?: number,
    ucr?: number,
    inline?: boolean,
    header?: string
}
type ResourcesI<T = any> = React.FC<IResourceProps<T>>

const Resources: ResourcesI = ({ power, water, population, currency, f_resource, ucr, inline, header }) => {
    const online = useContext(LunaOnlineContext);
    const dataStore = useContext(LunaOfflineContext);
    const [factionData, setFactionData] = useState<any>();
    const [faction, setFaction] = useState("");


    useEffect(() => {
        if (typeof dataStore.state?.find === "function") {
            const newData = (dataStore.state as Array<any>).find(findfaction => findfaction.faction_name === faction);
            setFactionData(newData);
        }
    });
    
    console.log(online.state);
    useEffect(() => {
        console.log("Home")
        online.pull().then((result: any) => {
            console.log(result);
            setFaction(result.faction_name);
            console.log("Faction set to", faction)
        });
    })

    console.log(inline && "Resource bar is inline...")
    return inline ? <InlineBar className="resource-bar">
        <IonTitle>{header}</IonTitle>
        <IonChip>
            <IonAvatar>
                <img src={`${import.meta.env.VITE_SERVER_URL}/assets/RESOURCE_currency.png`} alt={``} />
            </IonAvatar>
            <IonLabel className="resource">{currency}</IonLabel>
        </IonChip>
        <IonChip>
            <IonAvatar>
                <img src={`${import.meta.env.VITE_SERVER_URL}/assets/UCR_${factionData && factionData.faction_name}.png`} alt={``} />
            </IonAvatar>
            <IonLabel className="resource">{ucr}</IonLabel>
        </IonChip>
    </InlineBar> : <ResourceBar className="resource-bar">
        <IonChip>
            <IonAvatar>
                <img src={`${import.meta.env.VITE_SERVER_URL}/assets/RESOURCE_power.png`} alt={``} />
            </IonAvatar>
            <IonLabel className="resource">{power}</IonLabel>
        </IonChip>
        <IonChip>
            <IonAvatar>
                <img src={`${import.meta.env.VITE_SERVER_URL}/assets/RESOURCE_water.png`} alt={``} />
            </IonAvatar>
            <IonLabel className="resource">{water}</IonLabel>
        </IonChip>
        <IonChip>
            <IonAvatar>
                <img src={`${import.meta.env.VITE_SERVER_URL}/assets/RESOURCE_population.png`} alt={``} />
            </IonAvatar>
            <IonLabel className="resource">{population}</IonLabel>
        </IonChip>
        <IonChip>
            <IonAvatar>
                <img src={`${import.meta.env.VITE_SERVER_URL}/assets/RESOURCE_${factionData && factionData.faction_name}.png`} alt={``} />
            </IonAvatar>
            <IonLabel className="resource">{f_resource}</IonLabel>
        </IonChip>
    </ResourceBar>
}

export default Resources;