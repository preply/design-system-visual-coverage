import { appComponentNames, webComponentNames } from './componentNames';

type WebComponentNamesRecord = typeof webComponentNames;
export type WebComponentNames = WebComponentNamesRecord[keyof WebComponentNamesRecord];

type AppComponentNamesRecord = typeof appComponentNames;
export type AppComponentNames = AppComponentNamesRecord[keyof AppComponentNamesRecord];

export type ComponentNames = WebComponentNames | AppComponentNames;
