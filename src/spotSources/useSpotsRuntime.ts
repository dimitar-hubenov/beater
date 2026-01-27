// src/spotSources/useSpotsRuntime.ts

import { useContext } from "react";
import { SpotsRuntimeContext } from "./SpotsRuntimeProvider";

export function useSpotsRuntime() {
    const ctx = useContext(SpotsRuntimeContext);
    if (!ctx) {
        throw new Error('useSpotsRuntime must be used inside SpotsRuntimeProvider');
    }
    return ctx;
}
