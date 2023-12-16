import { IonButtons, IonCard, IonCardContent, IonCardHeader, IonContent, IonHeader, IonItem, IonList, IonMenuButton, IonNote, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useParams } from 'react-router';
import './Page.css';
import Resources from '../components/Resources';
import PageHeader from '../components/PageHeader';
import { useContext, useEffect, useState } from 'react';
import { LunaOnlineContext } from '../utils/contexts';
import { Device } from '@capacitor/device';


interface ISettingsProps<T> {

}

type SettingsI<T = any> = React.FC<ISettingsProps<T>>

const Settings: SettingsI = () => {

    const online = useContext(LunaOnlineContext);
    const [devInfo, setDevInfo] = useState<any>(null)

    useEffect(() => {
        const loadInfo = async () => {
            if (Device) {
                const info = await Device.getInfo();
                console.log(info);
                setDevInfo(info);
            }
        }
        loadInfo();
    }, [Device])

    return (online.state ? <>
        <IonPage><PageHeader title={"Settings"} />
            { devInfo && <IonContent>
                L.U.N.A is in early development.
                <IonCard>
                    <IonCardHeader>
                        L.U.N.A. Version {import.meta.env.VITE_APP_VERSION}
                    <IonNote>
                        Rev. {import.meta.env.VITE_APP_REVISION}
                    </IonNote>
                    </IonCardHeader>
                    <IonCardContent>
                        Device Information:
                        <IonList>
                            <IonItem>
                                Operating System: {devInfo.operatingSystem}
                            </IonItem>
                            <IonItem>
                                Platform: {devInfo.platform}
                            </IonItem>
                            <IonItem>
                                OS Version: {devInfo.osVersion}
                            </IonItem>
                        </IonList>
                    </IonCardContent> 
                </IonCard>
            </IonContent>}
        </IonPage></>
        :
        <div>
            You must be online to use this.
        </div>
    );
};

export default Settings;
