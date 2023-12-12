import { IonHeader, IonToolbar, IonButtons, IonMenuButton, IonContent, IonTitle } from "@ionic/react"
import Resources from "./Resources"
import { useContext, useEffect } from "react"
import { LunaResourceContext } from "../utils/contexts"

interface IHeaderProps<T> {
    title: string
}

type HeaderI<T = any> = React.FC<IHeaderProps<T>>

const PageHeader: HeaderI = ({ title }) => {

    const MyResources = useContext(LunaResourceContext);

    useEffect(() => {
        console.log("Home")
        MyResources.update().then(() => {
            console.log("Resources update.");
        })
    })

    return <IonHeader>
        <IonToolbar>
            <IonButtons slot="start">
                <IonMenuButton />
            </IonButtons>
            <Resources currency={MyResources.currency} ucr={MyResources.ucr} inline={true} header={title} />
        </IonToolbar>
    </IonHeader>
}

export default PageHeader;