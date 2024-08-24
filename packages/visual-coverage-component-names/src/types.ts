import {
    appComponentNames,
    dsCandidateComponentNames,
    rebrandComponentNames,
    webComponentNames,
} from './componentNames';

type WebComponentNamesRecord = typeof webComponentNames;
export type WebComponentNames = WebComponentNamesRecord[keyof WebComponentNamesRecord];

type AppComponentNamesRecord = typeof appComponentNames;
export type AppComponentNames = AppComponentNamesRecord[keyof AppComponentNamesRecord];

type RebrandComponentNamesRecord = typeof rebrandComponentNames;
export type RebrandComponentNames = RebrandComponentNamesRecord[keyof RebrandComponentNamesRecord];

type DsCandidateComponentNamesRecord = typeof dsCandidateComponentNames;
export type DsCandidateComponentNames =
    DsCandidateComponentNamesRecord[keyof DsCandidateComponentNamesRecord];

export type ComponentNames =
    | WebComponentNames
    | AppComponentNames
    | RebrandComponentNames
    | DsCandidateComponentNames;
