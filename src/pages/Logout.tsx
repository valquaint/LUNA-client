import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { Redirect, useParams } from 'react-router';
import './Page.css';
import Resources from '../components/Resources';
import PageHeader from '../components/PageHeader';
import { useEffect, useState } from 'react';
import { Preferences } from '@capacitor/preferences';

interface ILogoutProps<T> {
    update: Function
}

type LogoutI<T = any> = React.FC<ILogoutProps<T>>

const Logout: LogoutI = ({update}) => {
    const [loggedOut, setLoggedOut] = useState(false);
    useEffect(() => {
        const doLogout = async () => {
            await Preferences.remove({ key: "tokens" }).catch(console.log);
            await Preferences.remove({ key: "userdata" }).catch(console.log);
            setLoggedOut(true);
            console.log("User is now logged out.")
            update();

        }
        doLogout();
    })

    return (loggedOut && <Redirect to="/" />);
};

export default Logout;
