import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonItem, IonCheckbox, useIonActionSheet, IonProgressBar, IonSegment, IonItemDivider, IonRange, IonNote, IonLabel, IonCardSubtitle } from "@ionic/react";
import { useState, useRef, useContext, useEffect } from "react";
import styled from "styled-components";
import { LunaOfflineContext, LunaOnlineContext } from "../utils/contexts";

interface IExpeditionProps<T> {
    trigger: string
}

const Description = styled.p`
    text-indent: 1.5rem; 
`

type ExpeditionI<T = any> = React.FC<IExpeditionProps<T>>

export const Expedition: ExpeditionI = ({ trigger }) => {
    const modal = useRef<HTMLIonModalElement>(null);
    const [canDismissOverride, setCanDismissOverride] = useState(false);
    const [closeTask] = useIonActionSheet();
    const [buffer, setBuffer] = useState(0.1);
    const [progress, setProgress] = useState(0);
    const [stage, setStage] = useState(0);
    const online = useContext(LunaOnlineContext);
    const dataStore = useContext(LunaOfflineContext);
    const [factionData, setFactionData] = useState<any>();
    const [faction, setFaction] = useState("");
    const [resource, setResource] = useState(0);
    const [sendResource, setSendResource] = useState(0);
    const [ucr, setUcr] = useState(0);
    const [sendUcr, setSendUcr] = useState(0);
    const [crew, setCrew] = useState(0);
    const [sendCrew, setSendCrew] = useState(0);

    const onWillPresent = () => {
        setCanDismissOverride(false);
    }

    useEffect(() => {
        online.ping().then(async () => {
            if (typeof dataStore.state?.find === "function") {
                const newData = (dataStore.state as Array<any>).find(findfaction => findfaction.faction_name === faction);
                setFactionData(newData);
                const result = await online.pull();
                setFaction(result.faction_name);
                setResource(result.faction_resource)
                setUcr(result.ucr);
                console.log(newData?.ucr_name || "error", result.ucr, "Archon's Notes", result.currency)
            }
        });
    })

    const canDismiss = async () => {
        if (canDismissOverride) {
            return true;
        }
        return new Promise<boolean>((resolve) => {
            closeTask({
                header: 'End current expedition and return home? All spent resources will be lost, and you will only receive 75% of your projected gains.',
                buttons: [
                    {
                        text: 'Yes',
                        role: 'confirm',
                    },
                    {
                        text: 'No',
                        role: 'cancel',
                    },
                ],
                onWillDismiss: (ev) => {
                    if (ev.detail.role === 'confirm') {
                        setTimeout(() => {
                            setStage(1);
                            setBuffer(0.1);
                            setProgress(0);
                        }, 300);
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                },
            });
        });
    }

    const dismiss = () => {
        modal.current?.dismiss();
    }

    const nextStage = () => {
        setBuffer(buffer + 0.1);
        setProgress(progress + 0.1);
        setStage(stage + 1);
    }

    return <IonModal
        ref={modal}
        trigger={trigger}
        canDismiss={canDismiss}
        initialBreakpoint={1}
        breakpoints={[0, 1]}
        onWillPresent={onWillPresent}
    >
        <IonHeader>
            <IonToolbar>
                <IonTitle>Expedition</IonTitle>
                <IonButtons slot="end">
                    <IonButton onClick={() => dismiss()}>Return Home</IonButton>
                </IonButtons>
            </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
            <IonProgressBar buffer={buffer} value={progress} />
            {stage > 0 && <IonSegment>
                {stage === 1 && <>
                    <IonItemDivider>
                        <IonTitle color={"primary"}>
                            Begin an Expedition.
                        </IonTitle>
                    </IonItemDivider>
                    <Description>
                        You are about to begin an expedition. Your colonists will provide assistance, and you can take some
                        resources with you. Your success will depend on your supplies and choices along the way.
                    </Description>
                    <Description>
                        Your encounters will be random. The longer your expedition, the greater your rewards. However, you will
                        also increase your risk. Keep in mind that you will receive more rewards for completing your main objective.
                    </Description>
                    <Description>
                        Your expedition will fail if you run out of crew, resources, or if your ship becomes unable to support life.
                        You can end your expedition at anytime, forfeiting any supplied resources (but keeping your remaining crew),
                        and returning with 75% of anything already obtained on your current expedition.
                    </Description>
                </>}
                {stage === 2 && <>
                    <IonItemDivider>
                        <IonTitle color={"primary"}>
                            Supplies and Crew
                        </IonTitle>
                    </IonItemDivider>
                    <Description>
                        Decide the amount of resources to bring on your expedition, and how much crew. The effects of each resource will impact
                        your expedition differently, while having a larger crew will have different effects on your expedition.
                    </Description>
                    <Description>

                    </Description>
                        <IonRange 
                        labelPlacement="start" 
                        label={factionData.resource_name} 
                        ticks={true} 
                        min={0} 
                        snaps={true}
                        step={10}
                        pin={true}
                        max={resource > 100 ? 100 : resource || 1}
                        onIonChange={({target}) => setSendResource(target.value as number)}
                        ><IonNote slot="end">{sendResource}</IonNote></IonRange>
                        <IonCardSubtitle>
                            The more {factionData.resource_name} you bring, the more likely you will be able to repair your
                            ship, complete rescue missions, or overcome similar obstacles. You can opt to not bring any, however
                            if your ship takes too much damage, you will be forced to end your expedition early.
                        </IonCardSubtitle>
                        <IonRange 
                        labelPlacement="start" 
                        label={factionData.ucr_name} 
                        ticks={true} 
                        min={0} 
                        snaps={true}
                        step={10}
                        pin={true}
                        max={ucr > 100 ? 100 : ucr || 1}
                        onIonChange={({target}) => setSendUcr(target.value as number)}
                        ><IonNote slot="end">{sendUcr}</IonNote></IonRange>
                        <IonCardSubtitle>
                            The more {factionData.ucr_name} you bring, the easier it will be to buy supplies during your expedition,
                            however the chances of your envoy being ambushed by pirates increases. Pirates have a high chance
                            of dealing significant damage to your ship, but if your crew is strong, or if luck is on your side,
                            you may be able to best them for some valuable resources, or even treasure!
                        </IonCardSubtitle>
                        <IonRange 
                        labelPlacement="start" 
                        label="Crew" 
                        ticks={true} 
                        min={1} 
                        snaps={true}
                        step={1}
                        pin={true}
                        max={crew > 10 ? 10 : crew || 1}
                        onIonChange={({target}) => setSendUcr(target.value as number)}
                        ><IonNote slot="end">{sendCrew}</IonNote></IonRange>
                        <IonCardSubtitle>
                            Your crew determines the capabilities of your expedition. You always have at least one crew (yourself),
                            however if you have the capabilities of training additional crew at your colony, then you can
                            bring along specialists to aid in various aspects of your expedition.
                        </IonCardSubtitle>

                </>}
                <IonButton color={"warning"} onClick={nextStage}>Continue</IonButton></IonSegment>}
        </IonContent>
    </IonModal>
}