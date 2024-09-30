import type { DsVisualCoverageDeNormalizedResult } from '@preply/ds-visual-coverage-core';
import { DsVisualCoverageError } from '@preply/ds-visual-coverage-web';
import type { PreplyGitHubTeam } from '../platform/constants';
import { getPixelCountByComponentType } from './getPixelCountByComponentType';

export enum DWHEventType {
    EVENT_TYPE_CUSTOM = 13
}

export type DWHEvent = {
    event_type?: DWHEventType;
    event_name: string;
    json_data?: string;
};

type Milliseconds = number;
type Version = 'ds_coverage_v1';
/** @deprecated use UnsetTeam instead */
type UnknownTeam = 'unknown';
type UnsetTeam = 'unset';
export type TeamName = PreplyGitHubTeam | UnknownTeam | UnsetTeam;
export type UserType = 'student' | 'tutor' | 'anonymous';
type CountType =
    // The number of closed components
    | 'leaf'
    // The flex/grid/box components
    | 'layout'
    // The util components which do not have a visual representation
    | 'util'
    // The outdate DS components
    | 'outdated'
    // The Rebrand Components. They are pure tech debt until we move them to the DS and rename them
    | 'rebrand'
    // Ds components not managed by getDsComponentType
    | 'unknown'
    // Everything else
    | 'nonDs';

export type DsCoverageSingleContainerRuntimeInfo = {
    event_name: 'ds_coverage_single_container_runtime_info';
    event_type: 13;
    json_data: {
        team: TeamName;
        component: string;
        duration: {
            totalDuration: Milliseconds;
            blockingDuration: Milliseconds;
            nonBlockingDuration: Milliseconds;
            countPixelsDuration: Milliseconds;
            loopOverDomChildrenDuration: Milliseconds;
        };
    };
};

export type DsCoverageAllContainersRuntimeInfo = {
    event_name: 'ds_coverage_all_containers_runtime_info';
    event_type: 13;
    json_data: {
        duration: {
            totalDuration: Milliseconds;
        };
    };
};

export type DsCoverageCount = {
    event_name: Version;
    event_type: 13;
    param1: 'write_disable';
    json_data: {
        team: TeamName;
        pixels: number;
        platform: 'web';
        type: CountType;
        component: string;
        userType: UserType;
    };
};

export type DsCoverageError = {
    event_name: 'ds_coverage_runtime_error';
    event_type: 13;
    json_data: {
        error: string;
        platform: 'web';
        handled: boolean;
        userType: UserType;
        team: TeamName | 'unknownTeam';
        component: string | 'unknownComponent';
        stopReason: DsVisualCoverageError['stopReason'] | 'unhandledError';
    };
};

export type DsCoverageWarning = {
    event_name: 'ds_coverage_runtime_warning';
    event_type: 13;
    json_data: {
        team: TeamName;
        platform: 'web';
        warnings: string;
        component: string;
        userType: UserType;
    };
};
type DWHDsCoverageWarningEvent = {
    event_name: 'ds_coverage_runtime_warning';
    event_type: 13;
    json_data: string;
};
/**
 * Even if it's an array, it represents a single event.
 */
type EventData = [
    DsCoverageSingleContainerRuntimeInfo,

    // One count object for every count type
    DsCoverageCount,
    DsCoverageCount,
    DsCoverageCount,
    DsCoverageCount,
    DsCoverageCount,
    DsCoverageCount,
    DsCoverageCount,
];

export const convertDsCoverageToDwhEvent = (userType: UserType) => (
    result: DsVisualCoverageDeNormalizedResult,
): DWHEvent[] => {
    const { pixelCounts } = result;

    const events: EventData = [
        {
            event_name: 'ds_coverage_single_container_runtime_info',
            event_type: 13,
            json_data: {
                team: result.team,
                component: result.component,
                duration: {
                    totalDuration: result.totalDuration,
                    blockingDuration: result.duration.blockingDuration,
                    nonBlockingDuration: result.duration.nonBlockingDuration,
                    countPixelsDuration: result.duration.countPixelsDuration,
                    loopOverDomChildrenDuration: result.duration.loopOverDomChildrenDuration,
                },
            },
        },
        {
            event_name: 'ds_coverage_v1',
            event_type: 13,
            param1: 'write_disable',
            json_data: {
                platform: 'web',
                team: result.team,
                userType,
                component: result.component,
                type: 'leaf',
                pixels: getPixelCountByComponentType({
                    componentType: 'uiDsComponent',
                    pixelCounts,
                }),
            },
        },
        {
            event_name: 'ds_coverage_v1',
            event_type: 13,
            param1: 'write_disable',
            json_data: {
                platform: 'web',
                team: result.team,
                userType,
                component: result.component,
                type: 'layout',
                pixels: getPixelCountByComponentType({
                    componentType: 'layoutDsComponent',
                    pixelCounts,
                }),
            },
        },
        {
            event_name: 'ds_coverage_v1',
            event_type: 13,
            param1: 'write_disable',
            json_data: {
                platform: 'web',
                team: result.team,
                userType,
                component: result.component,
                type: 'util',
                pixels: getPixelCountByComponentType({
                    componentType: 'utilDsComponent',
                    pixelCounts,
                }),
            },
        },
        {
            event_name: 'ds_coverage_v1',
            event_type: 13,
            param1: 'write_disable',
            json_data: {
                platform: 'web',
                team: result.team,
                userType,
                component: result.component,
                type: 'outdated',
                pixels: getPixelCountByComponentType({
                    componentType: 'outdatedDsComponent',
                    pixelCounts,
                }),
            },
        },
        {
            event_name: 'ds_coverage_v1',
            event_type: 13,
            param1: 'write_disable',
            json_data: {
                platform: 'web',
                team: result.team,
                userType,
                component: result.component,
                type: 'rebrand',
                pixels: getPixelCountByComponentType({
                    componentType: 'rebrandComponent',
                    pixelCounts,
                }),
            },
        },
        {
            event_name: 'ds_coverage_v1',
            event_type: 13,
            param1: 'write_disable',
            json_data: {
                platform: 'web',
                team: result.team,
                userType,
                component: result.component,
                type: 'nonDs',
                pixels: getPixelCountByComponentType({
                    componentType: 'nonDsComponent',
                    pixelCounts,
                }),
            },
        },
        {
            event_name: 'ds_coverage_v1',
            event_type: 13,
            param1: 'write_disable',
            json_data: {
                platform: 'web',
                team: result.team,
                userType,
                component: result.component,
                type: 'unknown',
                pixels: getPixelCountByComponentType({
                    componentType: 'unknownDsComponent',
                    pixelCounts,
                }),
            },
        },
    ];

    return events.map<DWHEvent>(event => ({
        event_name: event.event_name,
        event_type: event.event_type,
        param1: 'param1' in event ? event.param1 : undefined,
        json_data: JSON.stringify(event.json_data),
    }));
};

export function generateDsCoverageAllContainersRuntimeInfo(totalDuration: Milliseconds): DWHEvent {
    const event: DsCoverageAllContainersRuntimeInfo = {
        event_name: 'ds_coverage_all_containers_runtime_info',
        event_type: 13,
        json_data: {
            duration: {
                totalDuration,
            },
        },
    };

    return {
        event_name: event.event_name,
        event_type: event.event_type,
        json_data: JSON.stringify(event.json_data),
    };
}

export function generateDsCoverageError({
    error,
    userType,
}: {
    userType: UserType;
    error: unknown;
}): DWHEvent {
    const errorString =
        error instanceof Error ? `${error.message}\n\nStack: ${error.stack}` : `${error}`;

    // @ts-expect-error The DS coverage APIs don't support the team types the proper way
    const team: TeamName = error instanceof DsVisualCoverageError ? error.team : 'unknownTeam';

    const jsonData: DsCoverageError['json_data'] =
        error instanceof DsVisualCoverageError
            ? {
                  team,
                  userType,
                  handled: true,
                  platform: 'web',
                  error: error.message,
                  component: error.component,
                  stopReason: error.stopReason,
              }
            : {
                  team,
                  userType,
                  handled: false,
                  platform: 'web',
                  error: errorString,
                  stopReason: 'unhandledError',
                  component: 'unknownComponent',
              };

    const event: DsCoverageError = {
        event_name: 'ds_coverage_runtime_error',
        event_type: 13,
        json_data: jsonData,
    };

    return {
        event_name: event.event_name,
        event_type: event.event_type,
        json_data: JSON.stringify(event.json_data),
    };
}

export function generateDsCoverageWarning({
    result,
    userType,
}: {
    userType: UserType;
    result: DsVisualCoverageDeNormalizedResult;
}): DWHDsCoverageWarningEvent {
    const { team } = result;

    const event: DsCoverageWarning = {
        event_name: 'ds_coverage_runtime_warning',
        event_type: 13,
        json_data: {
            // @ts-expect-error The DS coverage APIs don't support the team types the proper way
            team,
            userType,
            platform: 'web',
            component: result.component,
            warnings: result.warnings.join(','),
        },
    };

    return {
        event_name: event.event_name,
        event_type: event.event_type,
        json_data: JSON.stringify(event.json_data),
    };
}
