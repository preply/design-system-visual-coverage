import React, { createContext, useContext, useMemo } from 'react';
import type { ReactElement, ReactNode } from 'react';

type CoverageSetupProviderContext = {
    // The coverage is not meant to be used in production, but in a dedicated CI job!
    enabled: boolean;
};

const defaultCoverageSetup: CoverageSetupProviderContext = {
    enabled: false,
};

const Context = createContext(defaultCoverageSetup);

export function useCoverageSetup(): CoverageSetupProviderContext {
    return useContext(Context);
}
export function useIsCoverageEnabled(): boolean {
    return useContext(Context).enabled;
}

interface Props extends CoverageSetupProviderContext {
    children: ReactNode;
}

/**
 * Top-level provider to setup and enable the Design System visual coverage in React Native.
 * Typically, the coverage is enabled in specific cases and NOT in production.
 */
export function CoverageSetupProvider({
    children,

    enabled,
}: Props): ReactElement {
    const value = useMemo(() => {
        return { enabled };
    }, [enabled]);

    return <Context.Provider value={value}>{children}</Context.Provider>;
}
