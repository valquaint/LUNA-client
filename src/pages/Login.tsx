import { IonButtons, IonButton, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonInput, IonList, IonItem, IonToast } from '@ionic/react';
import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import './Page.css';
import { Preferences } from '@capacitor/preferences';

interface IPageProps<T> {
    setVerified:Function
}

type PageI<T = any> = React.FC<IPageProps<T>>

const Login: PageI = ({setVerified}) => {

    const { name } = useParams<{ name: string; }>();

    const [toast, setToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("null");

    const login = async () => {
        const form = document.querySelector("#login");
        const email = (form?.children[0].children[0] as HTMLInputElement).value;
        const password = (form?.children[1].children[0] as HTMLInputElement).value;
        console.log(email, password)
        if (email && password) {
            if (email.match(/^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/)) {
                const doLogin = await fetch(`${import.meta.env.VITE_SERVER_URL}/login`,
                    {
                        method: "POST",
                        body: JSON.stringify({
                            email: email,
                            password: password
                        }),
                        headers: {
                            "Content-Type": "application/json",
                            "l-app-version": import.meta.env.VITE_APP_VERSION
                        }
                    });
                const { token, refresh, result, msg, colony_name, username, faction_name } = await doLogin.json();
                if (result && result === "FAIL") {
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
                        value: JSON.stringify({ faction_name: faction_name, colony_name, username }),
                    });
                    setVerified(true);
                }
            } else {
                setToastMessage("Please provide a valid email address.");
                setToast(true);
            }
        }
    }
    useEffect(() => {
        const checkLoggedIn = async () => {
            const { value } = await Preferences.get({ key: 'tokens' });
            if (value) {
                setVerified(true);
            }
        }
        checkLoggedIn();
    })

    return <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>Login to L.U.N.A.</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">{name}</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonList id="login">
                    <IonItem>
                        <IonInput
                            label="Email Address"
                            labelPlacement="stacked"
                            placeholder="Email"
                            value=""
                            type="email"
                        ></IonInput>
                    </IonItem>
                    <IonItem>
                        <IonInput
                            label="Password"
                            labelPlacement="stacked"
                            clearInput={true}
                            placeholder="Password"
                            value=""
                            type="password"
                            onKeyDown={(e) => { if (e.key === "Enter") login() }}
                        ></IonInput>
                    </IonItem>
                    <IonButton onClick={login}>Login</IonButton>
                    <IonButton routerLink="/Register">Register</IonButton>
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

export default Login;
