import React from 'react';
import { getCoverageContainerAttributes } from '@preply/ds-visual-coverage-web';
import type { PreplyGitHubTeam } from '../../platform/constants';

export const updateElementWithDsCoverageAttributes = ({
    viewName,
    teamName,
    element,
}: {
    viewName: string;
    teamName: PreplyGitHubTeam | 'unset';
    element: HTMLElement;
}) => {
    const attrs = getCoverageContainerAttributes({
        team: teamName,
        component: viewName,
    });

    Object.entries(attrs).forEach(([key, value]: [string, string]) => {
        element.setAttribute(key, value);
    });
};

export const DsCoverageContext = React.createContext<string | null>(null);

export const PageDsCoverage = ({
    viewName,
    teamName,
    children,
}: {
    viewName: string;
    teamName: PreplyGitHubTeam;
    children: React.ReactNode;
}) => {
    const rootElementId = React.useContext(DsCoverageContext);
    React.useEffect(() => {
        const element = rootElementId ? document.getElementById(rootElementId) : null;
        if (element) {
            updateElementWithDsCoverageAttributes({ viewName, teamName, element });
            return () => {
                updateElementWithDsCoverageAttributes({
                    viewName: 'root',
                    teamName: 'unset',
                    element,
                });
            };
        }
        return () => {};
    }, [rootElementId, teamName, viewName]);
    return <>{children}</>;
};
