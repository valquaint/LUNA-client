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

type ResourceContext = {
    currency: number,
    ucr: number,
    fac_res: number,
    population: number,
    water: number,
    power: number,
    powerOut: number,
    waterOut: number,
    update: Function,
}
export const LunaResourceContext = createContext<ResourceContext>({ currency: 0 , ucr: 0, fac_res: 0, population: 0, water: 0, power: 0, powerOut: 0, waterOut: 0, update: () => {} });

export function LunaResourceProvider({ children, update }: { children:ReactNode, update: Function }) {
    const [currency, setCurrency] = useState(0);
    const [ucr, setUcr] = useState(0);
    const [fac_res, setFac_res] = useState(0);
    const [population, setPopulation] = useState(0);
    const [water, setWater] = useState(0);
    const [power, setPower] = useState(0);
    const [powerOut, setPowerOut] = useState(0);
    const [waterOut, setWaterOut] = useState(0);
    const updater = async () => {
        const result = await update();
        setCurrency(result.currency);
        setUcr(result.ucr);
        setFac_res(result.faction_resource);
        setWater(result.water);
        setPower(result.power);
        setPowerOut(result.cost.power);
        setWaterOut(result.cost.water);
        setPopulation(result.population);
        return true;
    }
    const context = { currency, ucr, fac_res, population, water, power, powerOut, waterOut, update: updater };
    return (<LunaResourceContext.Provider value={context}>{children}</LunaResourceContext.Provider>)
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