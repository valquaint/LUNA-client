import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonItem, IonCheckbox, useIonActionSheet, IonProgressBar, IonSegment, IonItemDivider, IonRange, IonNote, IonLabel, IonCardSubtitle, IonCard, IonCardTitle, IonCardContent, IonList, IonAccordionGroup, IonAccordion, IonToast, IonThumbnail } from "@ionic/react";
import { useState, useRef, useContext, useEffect } from "react";
import styled from "styled-components";
import { LunaOfflineContext, LunaOnlineContext, LunaResourceContext } from "../utils/contexts";
import { AlertPanel } from "./AlertPanel";
import { Preferences } from "@capacitor/preferences";

interface IExpeditionProps<T> {
    trigger: string
}

type expedition = {
    description: string,
    options: Array<options>,
    requirements?: null | values
}

type values = {
    ucr?: number,
    crew?: number,
    resources?: number,
    time?: number,
    currency?: number,
    max_currency?: number,
    max_ucr?: number,
    max_crew?: number,
    max_resources?: number,
    max_time?: number
}

type options = {
    button: string,
    description: string,
    changes: values,
    requirements?: null | values,
    randomness?: boolean
}
function shuffle(array: Array<any>) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
const Description = styled.p`
    text-indent: 1.5rem; 
`

type ExpeditionI<T = any> = React.FC<IExpeditionProps<T>>

export const Expedition: ExpeditionI = ({ trigger }) => {
    const modal = useRef<HTMLIonModalElement>(null);
    const [canDismissOverride, setCanDismissOverride] = useState(false);
    const [closeTask] = useIonActionSheet();
    const [buffer, setBuffer] = useState(0.33);
    const [progress, setProgress] = useState(0);
    const [stage, setStage] = useState(1);
    const [resource, setResource] = useState(0);
    const [crew, setCrew] = useState(1);

    const [sendResource, setSendResource] = useState(0);
    const [sendUcr, setSendUcr] = useState(0);
    const [sendCrew, setSendCrew] = useState(0);

    const [expeditionLength, setExpeditionLength] = useState(5);
    const [day, setDay] = useState(1);
    const [step, setStep] = useState(0.2);

    const [currentResource, setCurrentResource] = useState(0);
    const [currentUcr, setCurrentUcr] = useState(0);
    const [currentCrew, setCurrentCrew] = useState(0);
    const [gainResource, setGainResource] = useState(0);
    const [gainUcr, setGainUcr] = useState(0);
    const [gainCrew, setGainCrew] = useState(0);
    const [gainCurrency, setGainCurrency] = useState(0);

    const online = useContext(LunaOnlineContext);
    const dataStore = useContext(LunaOfflineContext);
    const [factionData, setFactionData] = useState<any>();
    const [faction, setFaction] = useState("");

    const [expeditions, setExpeditions] = useState<Array<expedition>>([])
    const [currentEvent, setCurrentEvent] = useState<expedition>();
    const [optionTwo, setOptionTwo] = useState<options>();
    const [optionOne, setOptionOne] = useState<options>();


    const [toast, setToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("null");

    const MyResources = useContext(LunaResourceContext);

    useEffect(() => {
        console.log("Home")
        MyResources.update().then(() => {
            console.log("Resources update.");
        })
    })

    useEffect(() => {
        online.ping().then(async () => {
            if (typeof dataStore.state?.find === "function") {
                const newData = (dataStore.state as Array<any>).find(findfaction => findfaction.faction_name === faction);
                setFactionData(newData);
                const result = await online.pull();
                setFaction(result.faction_name);
                setResource(result.faction_resource)
                console.log(newData?.ucr_name || "error", result.ucr, "Archon's Notes", result.currency)
            }
            if (!expeditions.length) {
                const { value } = await Preferences.get({ key: 'tokens' });
                if (value) {
                    const { access, refresh } = JSON.parse(value);
                    const load = await fetch(`${import.meta.env.VITE_SERVER_URL}/expeditions`, {
                        method: "POST",
                        headers: {
                            "x-access-token": access,
                            "x-refresh-token": refresh
                        }
                    })
                    if (load.status === 200) {
                        const loaded = await load.json();
                        const newExpeditions: expedition[] = [
                        ]
                        for (const expedition of loaded.msg) {
                            const newExp: expedition = {
                                description: expedition.event,
                                requirements: JSON.parse(expedition.requirements),
                                options: JSON.parse(expedition.responses)
                            }
                            newExpeditions.push(newExp);
                        }
                        setExpeditions(newExpeditions);
                        console.log(newExpeditions);
                    }
                }
            }
        });
    })
    const onWillPresent = () => {
        setStage(1);
        setBuffer(0.33);
        setProgress(0);
        setCanDismissOverride(false);
    }
    const canDismiss = async () => {
        if (canDismissOverride) {
            return true;
        }
        return new Promise<boolean>((resolve) => {
            closeTask({
                header: 'End current expedition and return home? All spent resources will be lost, and you will only receive 75% of collected cargo.',
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

    const pickExpedition = () => {
        const EV = Math.floor(Math.random() * expeditions.length);
        console.log("Picked expedition", EV, expeditions[EV]);
        setCurrentEvent(expeditions[EV]);
        let opts: options[] = [];
        for (const option of expeditions[EV].options) {
            if (option.requirements) {
                if ((option.requirements.crew && option.requirements.crew < currentCrew)
                    && (option.requirements.resources && option.requirements.resources < currentResource)
                    && (option.requirements.ucr && option.requirements.ucr < currentUcr)) {
                    opts.push(option);
                }
            } else {
                opts.push(option);
            }
        }
        shuffle(opts);
        console.log(opts);
        setOptionOne(opts.shift())
        setOptionTwo(opts.shift())
    }

    const continueExpedition = (option: options) => {
        const gain: values = {
            ucr: 0,
            resources: 0,
            crew: 0,
            time: 0
        }
        if (option.randomness) {
            if (option.changes.max_ucr) {
                gain.ucr = Math.floor(Math.random() * (option.changes.max_ucr - (option.changes.ucr || 0)) + (option.changes.ucr || 0));
            }
            if (option.changes.max_resources) {
                gain.resources = Math.floor(Math.random() * (option.changes.max_resources - (option.changes.resources || 0)) + (option.changes.resources || 0));
            }
            if (option.changes.max_crew) {
                gain.crew = Math.floor(Math.random() * (option.changes.max_crew - (option.changes.crew || 0)) + (option.changes.crew || 0));
            }
            if (option.changes.max_time) {
                gain.time = Math.floor(Math.random() * (option.changes.max_time - (option.changes.time || 0)) + (option.changes.time || 0));
            }
            if (option.changes.max_currency) {
                gain.currency = Math.floor(Math.random() * (option.changes.max_currency - (option.changes.currency || 0)) + (option.changes.currency || 0));
            }
        } else {
            if (option.changes.ucr) {
                gain.ucr = option.changes.ucr
            }
            if (option.changes.resources) {
                gain.resources = option.changes.resources
            }
            if (option.changes.crew) {
                gain.crew = option.changes.crew
            }
            if (option.changes.time) {
                gain.time = option.changes.time
            }
            if (option.changes.currency) {
                gain.currency = option.changes.currency
            }
        }
        if (gain.resources) {
            if (gain.resources < 0) {
                setCurrentResource(currentResource + gain.resources)
            } else {
                setGainResource(gainResource + (gain.resources || 0))
            }
        }
        if (gain.ucr) {
            if (gain.ucr < 0) {
                setCurrentUcr(currentUcr + gain.ucr)
            } else {
                setGainUcr(gainUcr + (gain.ucr || 0))
            }
        }
        if (gain.crew) {
            if (gain.crew < 0) {
                setCurrentCrew(currentCrew + gain.crew)
            } else {
                setGainCrew(gainCrew + (gain.crew || 0))
            }
        }
        if (gain.ucr) {
            if (gain.ucr < 0) {
                setCurrentUcr(currentUcr + gain.ucr)
            } else {
                setGainUcr(gainUcr + (gain.ucr || 0))
            }
        }
        if (gain.currency) {
            if (gain.currency > 0) {
                setGainCurrency(gainCurrency + (gain.currency || 0))
            }
        }
        console.log(factionData, gain)
        const message = [];
        if (gain.resources) message.push(`${gain.resources} ${factionData.resource_name}`);
        if (gain.currency) message.push(`${gain.currency} Archon Notes`);
        if (gain.ucr) message.push(`${gain.ucr} ${factionData.ucr_name}`)
        if (gain.crew) message.push(`${gain.crew} Crew`)
        if (gain.time) message.push(`${gain.time} Expedition Days`)
        // TODO: Have time losses/gains impact expedition time
        setToastMessage(message.join(", "));
        setToast(true)
        setBuffer(buffer + step);
        setProgress(progress + step);
        console.log("==========",buffer,"=======",progress, "===========",step)
        if (day === expeditionLength) {
            console.log("It has been the length of the expedition.")
            setStage(stage + 1);
            setDay(1);
            pickExpedition();
            setBuffer(step);
            setProgress(0);
        } else {
            setDay(day + 1);
            pickExpedition();
        }
    }

    const nextStage = () => {
        if (stage < 5) {
            setBuffer(buffer + 0.33);
            setProgress(progress + 0.33);
            setStage(stage + 1);
        }
        if (stage === 4) {
            setBuffer(step);
            setProgress(0);
            setCurrentCrew(sendCrew);
            setCurrentResource(sendResource);
            setCurrentUcr(sendUcr);
            console.log("PROG", step, buffer, progress)
            pickExpedition()
        }

    }

    const beginExpedition = () => {
        // TODO: Remove spent resources from user in db
    }

    const endExpedition = () => {
        // TODO: Add cargo to user in DB
        setCanDismissOverride(true);
        modal.current?.dismiss();
    }

    return <IonModal
        ref={modal}
        trigger={trigger}
        canDismiss={stage < 5 ? true : canDismiss}
        initialBreakpoint={1}
        breakpoints={[0, 1]}
        onWillPresent={onWillPresent}
    >
        <IonHeader>
            <IonToolbar>
                <IonTitle>Expedition</IonTitle>
                <IonButtons slot="end">
                    <IonButton onClick={() => dismiss()}>{stage < 5 ? "Cancel Preparation" : "Return Home"}</IonButton>
                </IonButtons>
            </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
            <IonSegment value={stage < 4 ? "Preparation" : "Expedition Progress"}>
                <IonLabel>{stage < 4 ? "Preparation" : "Expedition Progress"}</IonLabel>
                <IonProgressBar buffer={buffer} value={progress} />
            </IonSegment>
            {(stage > 0 && stage < 5) && <IonSegment>
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
                        onIonChange={({ target }) => setSendResource((target.value as number) || 1)}
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
                        max={MyResources.ucr > 100 ? 100 : MyResources.ucr || 1}
                        onIonChange={({ target }) => setSendUcr((target.value as number) || 1)}
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
                        step={1}
                        pin={true}
                        max={crew > 10 ? 10 : (typeof crew === "number" ? crew : 1)}
                        onIonChange={({ target }) => setSendCrew((target.value as number) || 1)}
                    ><IonNote slot="end">{sendCrew}</IonNote></IonRange>
                    <IonCardSubtitle>
                        Your crew determines the capabilities of your expedition. You always have at least one crew (yourself),
                        however if you have the capabilities of training additional crew at your colony, then you can
                        bring along specialists to aid in various aspects of your expedition.
                    </IonCardSubtitle>

                </>}
                {stage === 3 && <>
                    <IonItemDivider>
                        <IonTitle color={"primary"}>
                            Expedition Length
                        </IonTitle>
                    </IonItemDivider>
                    <Description>
                        Finally, decide the length of your expedition. The longer your expedition, the greater your rewards
                        at the end. However, the more encounters you will have, the higher the risk of running out of resources,
                        or being accosted by pirates. Be careful, as you will need to both make it to your destination, as
                        well as safely return home.
                    </Description>

                    <Description>
                        The maximum duration of your expedition is determined by the size of your crew.
                    </Description>
                    <Description>

                    </Description>
                    <IonRange
                        labelPlacement="start"
                        label={"Expedition Length"}
                        ticks={true}
                        min={5}
                        snaps={true}
                        step={5}
                        pin={true}
                        max={5 + (5 * sendCrew)}
                        onIonChange={({ target }) => {
                            const val = (target.value as number) || 1;
                            setExpeditionLength(val);
                            setStep(1 / val)
                        }}
                    ><IonNote slot="end">{expeditionLength}</IonNote></IonRange>
                </>}
                
                {stage === 4 && <>
                    <IonItemDivider>
                        <IonTitle color={"primary"}>
                            Expedition Details
                        </IonTitle>
                    </IonItemDivider>
                    <Description>
                        Your crew has been tasked with the following expedition:
                    </Description>

                    <Description>
                        (TBD)
                    </Description>
                    <Description>

                    </Description>
                    <Description>
                        The rewards will be as follows:
                    </Description>
                </>}
                <IonButton color={(stage < 3 ? "warning" : "danger")} onClick={nextStage}>{stage < 3 ? "Continue" : "Begin Expedition"}</IonButton>
                {stage === 4 &&
                    <IonCard>
                        <IonCardTitle color="danger">WARNING:</IonCardTitle>
                        <IonCardSubtitle color="warning">
                            You are about to begin your expedition. Continuing past this point will spend the resources you have previously selected. This cannot be undone!
                        </IonCardSubtitle>
                    </IonCard>}</IonSegment>}
            {(stage === 5 || stage === 6) &&
                <IonSegment><IonAccordionGroup>
                    <IonAccordion value="stats"><IonItem slot="header" color="light">
                        <IonLabel>Stats</IonLabel>
                    </IonItem><div slot="content">
                            <AlertPanel header="" title=''>
                                <IonItem className='expedition-status-bar'>
                                    <IonLabel>
                                        {factionData.ucr_name}: {currentUcr}
                                        <IonProgressBar value={(currentUcr / (sendUcr || 1))} buffer={1}></IonProgressBar>
                                    </IonLabel>
                                </IonItem>
                                <IonItem className='expedition-status-bar'>
                                    <IonLabel>
                                        {factionData.resource_name}: {currentResource}
                                        <IonProgressBar value={(currentResource / (sendResource || 1))} buffer={1}></IonProgressBar>
                                    </IonLabel>
                                </IonItem>
                                <IonItem className='expedition-status-bar'>
                                    <IonLabel>
                                        Remaining Crew: {currentCrew}
                                        <IonProgressBar value={(currentCrew / (sendCrew || 1))} buffer={1}></IonProgressBar>
                                    </IonLabel>
                                </IonItem>
                            </AlertPanel>
                        </div>
                    </IonAccordion>
                    <IonAccordion>
                        <IonItem slot="header" color="light">
                            <IonLabel>Cargo</IonLabel>
                        </IonItem>
                        <div slot="content">
                            <IonList>
                                <IonItem>
                                    <IonThumbnail slot="start">
                                        <img alt={`${faction} resource image`} src={`${import.meta.env.VITE_SERVER_URL}/assets/RESOURCE_${faction}.png`} />
                                    </IonThumbnail>
                                    <IonLabel>{factionData.resource_name}: {gainResource}</IonLabel>
                                </IonItem>
                                <IonItem>
                                    <IonThumbnail slot="start">
                                        <img alt={`${faction} construction resource image`} src={`${import.meta.env.VITE_SERVER_URL}/assets/UCR_${faction}.png`} />
                                    </IonThumbnail>
                                    <IonLabel>{factionData.ucr_name}: {gainUcr}</IonLabel>
                                </IonItem>
                                <IonItem>
                                    <IonThumbnail slot="start">
                                        <img alt={`Archon Note image`} src={`${import.meta.env.VITE_SERVER_URL}/assets/RESOURCE_currency.png`} />
                                    </IonThumbnail>
                                    <IonLabel>Archon Notes: {gainCurrency}</IonLabel>
                                </IonItem>
                            </IonList>
                        </div>
                    </IonAccordion>
                </IonAccordionGroup>

                    <IonItemDivider>
                        <IonTitle color={"primary"}>
                            Captain's Log, Day {day}
                        </IonTitle>
                    </IonItemDivider>
                    {stage === 6 && <IonItemDivider>
                        <IonCardSubtitle color={"tertiary"}>
                            Returning Home
                        </IonCardSubtitle>
                    </IonItemDivider>}
                    <IonItemDivider>
                        <IonCard>
                            <IonCardContent>
                                {currentEvent?.description}
                            </IonCardContent>
                            <IonItem>
                                <IonButton fill="clear" onClick={() => { continueExpedition(optionOne as options) }}>{optionOne?.button}</IonButton>
                            </IonItem>
                            <IonItem>
                                <IonCardSubtitle color={"secondary"}>{optionOne?.description}</IonCardSubtitle>
                            </IonItem>
                            <br />
                            <IonItem>
                                <IonButton fill="clear" onClick={() => { continueExpedition(optionTwo as options) }}>{optionTwo?.button}</IonButton>
                            </IonItem>
                            <IonItem>
                                <IonCardSubtitle color={"secondary"}>{optionTwo?.description}</IonCardSubtitle>
                            </IonItem>
                        </IonCard>
                    </IonItemDivider>

                </IonSegment>}
            {stage === 7 && <IonSegment>
                <IonItemDivider>
                    <IonTitle color={"primary"}>
                        Expedition Results
                    </IonTitle>
                </IonItemDivider>
                <Description>
                    You returned home from your expedition, your cargo safe and sound:
                </Description>
                <IonItemDivider>
                    <IonTitle color={"warning"}>
                        Spent Resources
                    </IonTitle>
                </IonItemDivider>
                <IonList>
                    <IonItem>
                        <IonThumbnail slot="start">
                            <img alt={`${faction} resource image`} src={`${import.meta.env.VITE_SERVER_URL}/assets/RESOURCE_${faction}.png`} />
                        </IonThumbnail>
                        <IonLabel>{factionData.resource_name}: {sendResource}</IonLabel>
                    </IonItem>
                    <IonItem>
                        <IonThumbnail slot="start">
                            <img alt={`${faction} construction resource image`} src={`${import.meta.env.VITE_SERVER_URL}/assets/UCR_${faction}.png`} />
                        </IonThumbnail>
                        <IonLabel>{factionData.ucr_name}: {sendUcr}</IonLabel>
                    </IonItem>
                </IonList>
                <IonItemDivider>
                    <IonTitle color={"success"}>
                        Retrieved Cargo:
                    </IonTitle>
                </IonItemDivider>
                <IonList>
                    <IonItem>
                        <IonThumbnail slot="start">
                            <img alt={`${faction} resource image`} src={`${import.meta.env.VITE_SERVER_URL}/assets/RESOURCE_${faction}.png`} />
                        </IonThumbnail>
                        <IonLabel>{factionData.resource_name}: {gainResource}</IonLabel>
                    </IonItem>
                    <IonItem>
                        <IonThumbnail slot="start">
                            <img alt={`${faction} construction resource image`} src={`${import.meta.env.VITE_SERVER_URL}/assets/UCR_${faction}.png`} />
                        </IonThumbnail>
                        <IonLabel>{factionData.ucr_name}: {gainUcr}</IonLabel>
                    </IonItem>
                    <IonItem>
                        <IonThumbnail slot="start">
                            <img alt={`Archon Note image`} src={`${import.meta.env.VITE_SERVER_URL}/assets/RESOURCE_currency.png`} />
                        </IonThumbnail>
                        <IonLabel>Archon Notes: {gainCurrency}</IonLabel>
                    </IonItem>
                </IonList>

                <IonButton color={"success"} onClick={endExpedition}>{"Complete"}</IonButton>
            </IonSegment>
            }
            <IonToast
                isOpen={toast}
                message={toastMessage}
                layout="stacked"
                onDidDismiss={() => setToast(false)}
                duration={5000}
            >Blorp</IonToast>
        </IonContent>
    </IonModal>
}