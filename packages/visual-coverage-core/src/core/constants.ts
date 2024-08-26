import {
    appComponentNames,
    webComponentNames,
} from '../../../visual-coverage-component-names/dist';
import type {
    ColorByPixelType,
    EmptyPixel,
    HighestNumber,
    Pixel,
    PixelByPixelType,
    PixelType,
    ReadableCharByPixel,
    WeightByComponentName,
} from '../types';

export const pixelCountsLength: HighestNumber = 4;

export const companyName = 'preply';

/**
 * The attribute that allow to distinguish the DS components from the rest of the DOM elements.
 *
 * ATTENTION: SVGs have it hardcoded!
 */
export const dsComponentsDataAttribute = `data-${companyName}-ds-component`;

/**
 * The attribute that mark an element as a candidate for the DS visual coverage.
 */
export const coverageContainerDomAttributeName = `data-${companyName}-ds-coverage`;

// TODO: is it right to have it inside visual-coverage-core?
export const svgRendererAttributeName = `${coverageContainerDomAttributeName}-renderer`;

/**
 * Useful to print out the array with monospaced fonts
 */
export const emptyPixel: EmptyPixel = 0; // The value Uint8Array returns for unset items

export const defaultPixelByPixelType: PixelByPixelType = {
    emptyPixel: 0,
    nonDsComponent: 1,

    uiDsComponent: 2,
    layoutDsComponent: 3,
    unknownDsComponent: 4,
};

export const defaultColorByPixelType: ColorByPixelType = {
    emptyPixel: '#000000', // unused, it's here only for TypeScript purposes
    nonDsComponent: '#FF0000',

    uiDsComponent: '#00FF00',
    layoutDsComponent: '#00FF00',
    unknownDsComponent: '#00FF00',
};

export const defaultReadableCharByPixelType: ReadableCharByPixel = {
    0: '⬛️',
    1: '🟥',

    2: '🟩',
    3: '🟩',
    4: '🟩',
};

export const pixelTypeByPixel: Record<Pixel, PixelType> = {
    0: 'emptyPixel',
    1: 'nonDsComponent',

    2: 'uiDsComponent',
    3: 'layoutDsComponent',
    4: 'unknownDsComponent',
};

export const defaultWeightByComponentName: WeightByComponentName = {
    emptyPixel: 0,
    nonDsComponent: 1,
    unknownDsComponent: 0,

    // Web components
    [webComponentNames.Button]: 21,
    [webComponentNames.Checkbox]: 22,
    [webComponentNames.LayoutFlex]: 0,

    // App components
    [appComponentNames.Button]: 21,
    [appComponentNames.LayoutFlex]: 0,
    [appComponentNames.Loader]: 10,
};
