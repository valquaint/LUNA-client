import { IonButtons, IonButton, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonInput, IonList, IonItem, IonToast, IonLabel, IonItemDivider, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonNote, IonText, IonAvatar, IonBadge, IonAccordionGroup, IonAccordion, IonImg, IonChip } from '@ionic/react';
import { useHistory, useParams } from 'react-router';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import './Page.css';
import { Preferences } from '@capacitor/preferences';
import { Link } from 'react-router-dom';

interface IPageProps<T> {
    setVerified: Function
}

type PageI<T = any> = React.FC<IPageProps<T>>

const FactionImg = styled.img`
    width: 99vw;
    height:auto;
`

const Register: PageI = ({ setVerified }) => {

    const { name } = useParams<{ name: string; }>();

    const [toast, setToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("null");
    const [faction, setFaction] = useState<any>(null);
    const [factions, setFactions] = useState<Array<any>>([]);
    const [isMemberLocked, setIsMemberLocked] = useState(false);
    const [totalPlayers, setTotalPlayers] = useState(0);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [username, setUsername] = useState("");
    const [colony, setColony] = useState("");
    const [passwordConfirmed, setPasswordConfirmed] = useState(false);

    const history = useHistory();

    const register = async (e: any) => {
        e.preventDefault();
        const colony_name = colony;
        const faction_id = faction?.faction_id;
        if (email && password && username && colony_name && faction && passwordConfirmed) {
            if (email.match(/^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/)) {
                const doRegister = await fetch(`${import.meta.env.VITE_SERVER_URL}/register`,
                    {
                        method: "POST",
                        body: JSON.stringify({
                            email: email,
                            password: password,
                            username,
                            colony_name,
                            faction_id
                        }),
                        headers: {
                            "Content-Type": "application/json",
                            "l-app-version": import.meta.env.VITE_APP_VERSION
                        }
                    });
                const { token, refresh, result, msg } = await doRegister.json();
                if (result && result === "FAIL") {
                    console.log(result)
                    setToastMessage(msg);
                    setToast(true);
                }
                else {
                    const tokens = {
                        access: token,
                        refresh: refresh
                    }
                    await Preferences.set({
                        key: 'tokens',
                        value: JSON.stringify(tokens),
                    });
                    await Preferences.set({
                        key: 'userdata',
                        value: JSON.stringify({ faction_name: faction.faction_name, colony_name, username }),
                    });
                    history.push("/");
                }
            } else {
                setToastMessage("Please provide a valid email address.");
                setToast(true);
            }
        }
    }

    const handleFaction = (e: any) => {
        e.preventDefault();
        if (e.target) {
            const node = (e.target as HTMLIonButtonElement);
            if (node && node.parentNode) {
                const newFaction = node.innerHTML;
                for (const fac of node.parentNode.children) {
                    (fac as HTMLIonButtonElement).color = "";
                }
                node.color = "success";
                const result = factions.find((fac: any) => fac && fac.faction_name === newFaction)
                const mostPop = factions.toSorted((a, b) => b.members - a.members)
                if ((result.faction_name === mostPop[0].faction_name) && (mostPop[0].members / mostPop[1].members) >= 1.05) setIsMemberLocked(true);
                else setIsMemberLocked(false);
                setFaction(result);
            }
        }
    }

    const handleEmail = (e: any) => {
        const value = (e.target as HTMLInputElement)?.value;
        setEmail(value);
    }

    const handleUsername = (e: any) => {
        const value = (e.target as HTMLInputElement)?.value;
        setUsername(value);
    }

    const handlePassword = (e: any) => {
        const value = (e.target as HTMLInputElement)?.value;
        setPassword(value);
    }

    const handleConfirmPassword = (e: any) => {
        const value = (e.target as HTMLInputElement)?.value;
        setConfirmPassword(value);
        if (password === value) {
            setPasswordConfirmed(true);
        } else {
            setToastMessage("Passwords do not match.");
            setToast(true);
        }
    }

    const handleColony = (e: any) => {
        const value = (e.target as HTMLInputElement)?.value;
        setColony(value);
    }

    useEffect(() => {
        const checkLoggedIn = async () => {
            const { value } = await Preferences.get({ key: 'tokens' });
            if (value) {
                setVerified(true);
            }
        }
        const loadFactions = async () => {
            const result = await (await fetch(`${import.meta.env.VITE_SERVER_URL}/factions`, {
                method: "POST"
            })).json();
            const loadedFactions: Array<any> = [];
            let memberCount = 0;

            for (const fac of result.msg.factions) {
                const locate = (result.msg.users as Array<any>).find((element) => element.faction_name === fac.faction_name)
                console.log(locate);
                if (locate) {
                    fac.members = locate.count;
                    memberCount += locate.count;
                }
                else fac.members = 0;
                loadedFactions.push(fac);
            }
            console.log(loadedFactions);
            setTotalPlayers(memberCount);
            setFactions(loadedFactions);
        }
        checkLoggedIn();
        loadFactions();
    }, [setFactions, setVerified, setTotalPlayers])

    return <IonPage>
        <IonHeader>
            <IonToolbar>
                <IonButtons slot="start">
                    <IonMenuButton />
                </IonButtons>
                <IonTitle>Regstier for L.U.N.A.</IonTitle>
            </IonToolbar>
        </IonHeader>

        <IonContent fullscreen>
            <IonHeader collapse="condense">
                <IonToolbar>
                    <IonTitle size="large">{name}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonList id="register">

                <IonItemDivider sticky={true}>
                    <IonLabel>Login Details</IonLabel>
                </IonItemDivider>
                <IonItem>
                    <IonInput
                        label="Email Address"
                        labelPlacement="stacked"
                        placeholder="Email"
                        value={email}
                        type="email"
                        onBlur={handleEmail}
                    ></IonInput>
                </IonItem>
                <IonItem>
                    <IonInput
                        label="Password"
                        labelPlacement="stacked"
                        placeholder="Password"
                        value={password}
                        type="password"
                        onBlur={handlePassword}
                    ></IonInput>
                </IonItem>
                <IonItem>
                    <IonInput
                        label="Confirm Password"
                        labelPlacement="stacked"
                        placeholder="Password"
                        value={confirmPassword}
                        type="password"
                        onIonBlur={handleConfirmPassword}
                    ></IonInput>
                </IonItem>
                <IonItemDivider sticky={true}>
                    <IonLabel>Player Details</IonLabel>
                </IonItemDivider>
                <IonItem>
                    <IonInput
                        label="Username"
                        labelPlacement="stacked"
                        placeholder="Username"
                        value={username}
                        onBlur={handleUsername}
                    ></IonInput>
                </IonItem>
                <IonItem>
                    <IonInput
                        label="Colony Name"
                        labelPlacement="stacked"
                        placeholder="Colony Name"
                        value={colony}
                        onBlur={handleColony}
                    ></IonInput>
                </IonItem>
                <IonItemDivider sticky={true}>
                    <IonLabel>Faction Selection</IonLabel>
                </IonItemDivider>
                <IonCard>
                    {faction && <FactionImg alt="Faction Logo" src={`${import.meta.env.VITE_SERVER_URL}/assets/${faction.faction_name}.png`} />}
                    <IonCardHeader>
                        <IonCardTitle>{faction ? <IonChip className="faction-chip">
                            <IonAvatar>
                                <img src={`${import.meta.env.VITE_SERVER_URL}/assets/${faction.faction_name}_logo.png`} alt={``} />
                            </IonAvatar>
                            <IonLabel className="register-faction">{faction.faction_name}</IonLabel>
                        </IonChip>
                            : "Select a faction"}
                        </IonCardTitle>
                        {faction && <IonCardSubtitle color={"secondary"} className='faction-short'>{faction ? faction.faction_short : ""}</IonCardSubtitle>}
                    </IonCardHeader>
                    {faction && <IonCardContent>
                        <IonList>
                            <IonItem>
                                <IonBadge slot="end" color={isMemberLocked ? "danger" : ""}>{faction.members}</IonBadge>
                                <IonLabel>Members</IonLabel>

                            </IonItem>
                            {isMemberLocked && <IonItem><IonNote color="light">
                                This faction currently has the highest population. You will not be able to join this faction.
                            </IonNote></IonItem>}
                            <IonAccordionGroup>
                                <IonAccordion>
                                    <IonItem slot="header" color="light">
                                        <IonLabel>Faction Bio</IonLabel>
                                    </IonItem>
                                    <div className="ion-padding" slot="content">{faction.faction_description}</div>
                                </IonAccordion>
                                <IonAccordion value='skills'>
                                    <IonItem slot="header">
                                        <IonLabel>Faction Skills</IonLabel>
                                    </IonItem>
                                    <div slot="content">
                                        <IonAccordionGroup>
                                            <IonAccordion value="first">
                                                <IonItem slot="header" color="primary">
                                                    <IonLabel>First Skill</IonLabel>
                                                </IonItem>
                                                <div className="ion-padding" slot="content">
                                                    Description TBD
                                                </div>
                                            </IonAccordion>
                                            <IonAccordion value="second">
                                                <IonItem slot="header" color="primary">
                                                    <IonLabel>Second Skill</IonLabel>
                                                </IonItem>
                                                <div className="ion-padding" slot="content">
                                                    Description TBD
                                                </div>
                                            </IonAccordion>
                                            <IonAccordion value="third">
                                                <IonItem slot="header" color="primary">
                                                    <IonLabel>Third Skill</IonLabel>
                                                </IonItem>
                                                <div className="ion-padding" slot="content">
                                                    Description TBD
                                                </div>
                                            </IonAccordion>
                                        </IonAccordionGroup>
                                    </div>

                                </IonAccordion>

                            </IonAccordionGroup>
                        </IonList>
                    </IonCardContent>}
                    <>
                        <IonButton fill="clear" id="Aerun" onClick={handleFaction}>Aerun</IonButton>
                        <IonButton fill="clear" id="Enlightened" onClick={handleFaction}>Enlightened</IonButton>
                        <IonButton fill="clear" id="Regents" onClick={handleFaction}>Regents</IonButton>
                    </>
                </IonCard>
                <IonButton onClick={register}>Register</IonButton>
                <Link to="/">Back to Login</Link>
                <IonToast
                    isOpen={toast}
                    message={toastMessage}
                    onDidDismiss={() => setToast(false)}
                    duration={5000}
                ></IonToast>
            </IonList>
        </IonContent>
    </IonPage>
};

export default Register;
