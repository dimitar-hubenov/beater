import { createContext, useContext, useState, ReactNode } from 'react';
import { useUserSettings } from '../settings/useUserSettings';
import { useSpotsData } from '../hooks/useSpotsData';
import type { Spot } from '../types/spot'; 

type SpotsRuntimeContextValue= {
    spots: Spot[];
    loading: boolean;
    error: Error | null;

    pause(): void;
    resume(): void;
};

export const SpotsRuntimeContext = createContext<SpotsRuntimeContextValue | null>(null);

export function SpotsRuntimeProvider({ children }: { children: ReactNode }) {
    const { settings } = useUserSettings();
    const [paused, setPaused] = useState(false);

    const { spots, loading, error } = useSpotsData();

    return (
        <SpotsRuntimeContext.Provider
            value={{
                spots,
                loading,
                error,
                pause: () => setPaused(true),
                resume: () => setPaused(false),
            }}
        >
            {children}
        </SpotsRuntimeContext.Provider>
    );
}
