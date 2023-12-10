import { IonItemDivider, IonLabel, IonItem, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent } from "@ionic/react"
import { ReactNode } from "react"

interface IAlertProps<T> {
    header?: string,
    title: string,
    subtitle?: string,
    children?: string | ReactNode
}
type AlertI<T = any> = React.FC<IAlertProps<T>>

export const AlertPanel: AlertI = ({ header, title, subtitle, children }) => {

    return (
        <>
            {header && <IonItemDivider sticky={true}>
                <IonLabel>{header}</IonLabel>
            </IonItemDivider>}
            <IonItem>
                <IonCardHeader>
                    <IonCardTitle>
                        {title}
                    </IonCardTitle>
                    {subtitle && <IonCardSubtitle color={"secondary"} >
                        {subtitle}
                    </IonCardSubtitle> }
                    <IonCardContent>{children}</IonCardContent>
                </IonCardHeader>
            </IonItem>
        </>
    )
}