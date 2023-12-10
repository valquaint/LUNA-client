import { IonHeader, IonToolbar, IonButtons, IonMenuButton, IonContent, IonTitle } from "@ionic/react"
import Resources from "./Resources"

interface IHeaderProps<T> {
    title: string
}

type HeaderI<T = any> = React.FC<IHeaderProps<T>>

const PageHeader: HeaderI = ({ title }) => {
    return <IonHeader>
        <IonToolbar>
            <IonButtons slot="start">
                <IonMenuButton />
            </IonButtons>
            <Resources currency={100} ucr={200} inline={true} header={title} />
        </IonToolbar>
    </IonHeader>
}

export default PageHeader;