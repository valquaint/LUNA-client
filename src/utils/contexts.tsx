import { Preferences } from '@capacitor/preferences';
import { ReactNode, createContext, useState, useEffect } from 'react';
type OnlineContext = {
    state: boolean,
    updater: Function,
    ping: Function,
    pull: Function,
    post: Function
}
export const LunaOnlineContext = createContext<OnlineContext>({ state: false, updater: () => { }, ping: () => { }, pull: () => { }, post: () => { } });

export function LunaProvider({ children, state, updater, ping, pull, post }: { children: ReactNode, state: boolean, updater: Function, ping: Function, pull: Function, post: Function }) {
    const context = { state, updater, ping, pull, post };
    return (<LunaOnlineContext.Provider value={context}>{children}</LunaOnlineContext.Provider>)
}

type OfflineContext = {
    state:any,
    pull: Function
}
export const LunaOfflineContext = createContext<OfflineContext>({state: {}, pull: () => { } });

export function OfflineProvider({ children, pull }: { children: ReactNode, pull: Function }) {

    const [dataStore, setDataStore] = useState<any>({});
    const context = { state: dataStore, pull };
    console.log("Loading datastore to memory..")
    useEffect(() => {
        const doPull = async () => {
            await pull(true);
            const { value } = await Preferences.get({ key: 'datastore' });
            if (value) {
                const stored = JSON.parse(value);
                setDataStore(stored);
            }
        }
        doPull();
    }, [setDataStore, pull])
    return (<LunaOfflineContext.Provider value={context}>{children}</LunaOfflineContext.Provider>)
}