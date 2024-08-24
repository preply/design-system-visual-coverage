import {
    appComponentNames,
    dsCandidateComponentNames,
    rebrandComponentNames,
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

export const pixelCountsLength: HighestNumber = 8;

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
    utilDsComponent: 8,
    rebrandComponent: 4,
    layoutDsComponent: 5,
    unknownDsComponent: 6,
    outdatedDsComponent: 7,
    dsCandidateComponent: 4,
};

export const defaultColorByPixelType: ColorByPixelType = {
    emptyPixel: '#000000', // unused, it's here only for TypeScript purposes

    nonDsComponent: '#FF0000',
    uiDsComponent: '#00FF00',
    utilDsComponent: '#00FF00',
    rebrandComponent: '#FF00FF',
    layoutDsComponent: '#00FF00',
    unknownDsComponent: '#00FF00',
    outdatedDsComponent: '#00FF00',
    dsCandidateComponent: '#FF00FF',
};

export const defaultReadableCharByPixelType: ReadableCharByPixel = {
    0: '⬛️',
    1: '🟥',
    2: '🟩',

    // DS components
    3: '🟩',
    4: '🟪',
    5: '🟩',
    6: '🟩',
    7: '🟩',
    8: '🟪',
};

export const pixelTypeByPixel: Record<Pixel, PixelType> = {
    0: 'emptyPixel',
    1: 'nonDsComponent',
    2: 'uiDsComponent',
    3: 'utilDsComponent',
    4: 'rebrandComponent',
    5: 'layoutDsComponent',
    6: 'unknownDsComponent',
    7: 'outdatedDsComponent',
    8: 'dsCandidateComponent',
};

const unknownDsComponentWeight = 1; // used for unknown DS components but also for children of ui components
const layoutComponentsWeight = 0;
const dsCandidateComponentsScore = 0; // the DS team is not maintaining them at the moment
const dsIconScore = 10;

export const defaultWeightByComponentName: WeightByComponentName = {
    emptyPixel: 0,
    nonDsComponent: 1,
    unknownDsComponent: unknownDsComponentWeight,

    // DS components
    [webComponentNames.Avatar]: 10,
    [webComponentNames.AvatarWithStatus]: 10,
    [webComponentNames.Badge]: 9,
    [webComponentNames.Box]: 9,
    [webComponentNames.Button]: 21,
    [appComponentNames.Button]: 21,
    [webComponentNames.Chip]: 36,
    [webComponentNames.Chips]: layoutComponentsWeight,
    [webComponentNames.FieldAdditionalText]: 9,
    [webComponentNames.FieldButton]: 21,
    [webComponentNames.FieldLayout]: 35,
    [webComponentNames.Heading]: 9,
    [appComponentNames.Heading]: 9,
    [webComponentNames.Icon]: dsIconScore,
    [webComponentNames.IconButton]: 21,
    [webComponentNames.LayoutFlex]: layoutComponentsWeight,
    [appComponentNames.LayoutFlex]: layoutComponentsWeight,
    [webComponentNames.LayoutFlexItem]: layoutComponentsWeight,
    [appComponentNames.LayoutFlexItem]: layoutComponentsWeight,
    [webComponentNames.LayoutGrid]: layoutComponentsWeight,
    [webComponentNames.LayoutGridItem]: layoutComponentsWeight,
    [webComponentNames.Link]: 12,
    [webComponentNames.Loader]: 10,
    [appComponentNames.Loader]: 10,
    [webComponentNames.NumberField]: 35,
    [webComponentNames.PasswordField]: 35,
    [webComponentNames.PreplyLogo]: 10,
    [webComponentNames.SelectField]: 21,
    [webComponentNames.SelectFieldOption]: 21,
    [webComponentNames.Text]: 9,
    [appComponentNames.Text]: 9,
    [webComponentNames.TextareaField]: 35,
    [webComponentNames.TextField]: 35,
    [webComponentNames.TextHighlighted]: 9,
    [webComponentNames.TextInline]: 9,
    [appComponentNames.TextInline]: 9,

    // DS components we forgot to evaluate because they were not added to the weight spreadsheet
    // see https://docs.google.com/spreadsheets/d/1-pdZbr3UPxWaztMKvxFAGeHmWZfFSOSPJg1GOvZznlg/edit?gid=0#gid=0
    [webComponentNames.Checkbox]: 22,
    [webComponentNames.InputDate]: 35,
    [webComponentNames.InputNumber]: 35,
    [webComponentNames.InputPassword]: 35,
    [webComponentNames.InputText]: 35,
    [webComponentNames.InputTime]: 35,
    [webComponentNames.ObserverIntersection]: 0,
    [webComponentNames.Panel]: 0,
    [webComponentNames.PanelBody]: 0,
    [webComponentNames.PanelFooter]: 0,
    [webComponentNames.PanelHeader]: 0,
    [webComponentNames.PanelSection]: 0,
    [webComponentNames.Radio]: 24,
    [webComponentNames.Select]: 60,
    [webComponentNames.SelectFieldLayout]: 60,
    [webComponentNames.Textarea]: 35,

    // Rebrand components
    [rebrandComponentNames.RebrandAccordion]: 34,
    [rebrandComponentNames.RebrandAlert]: 32,
    [rebrandComponentNames.RebrandBubble]: 9,
    [rebrandComponentNames.RebrandBubbleOnIcon]: 9,
    [rebrandComponentNames.RebrandCheckbox]: 22,
    [rebrandComponentNames.RebrandChip]: 0, // now DS has Chip
    [rebrandComponentNames.RebrandChoiceTile]: 32,
    [rebrandComponentNames.RebrandDivider]: 9,
    [rebrandComponentNames.RebrandDropdown]: 60,
    [rebrandComponentNames.RebrandFlag]: 10,
    [rebrandComponentNames.RebrandListItem]: 53,
    [rebrandComponentNames.RebrandListMenu]: 53,
    [rebrandComponentNames.RebrandModal]: 59,
    [rebrandComponentNames.RebrandPopover]: 46,
    [rebrandComponentNames.RebrandProgressBar]: 11,
    [rebrandComponentNames.RebrandRadioButton]: 24,
    [rebrandComponentNames.RebrandRadioGroup]: 24,
    [rebrandComponentNames.RebrandRange]: 38,
    [rebrandComponentNames.RebrandRating]: 34,
    [rebrandComponentNames.RebrandSegmentedButtons]: 33,
    [rebrandComponentNames.RebrandSegmentedControls]: 37,
    [rebrandComponentNames.RebrandSelect]: 60,
    [rebrandComponentNames.RebrandSlider]: 40,
    [rebrandComponentNames.RebrandStackedImage]: 34,
    [rebrandComponentNames.RebrandSwitch]: 24,
    [rebrandComponentNames.RebrandTabs]: 44,
    [rebrandComponentNames.RebrandToast]: 49,
    [rebrandComponentNames.RebrandTooltip]: 45,

    // DS candidates
    [dsCandidateComponentNames.DsCandidateAlert]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateAvatar]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateAvatarWithStatus]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateBadge]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateBox]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateBubble]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateCheckbox]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateChip]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateChoiceTile]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateCollapsibleItem]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateCollapsibleList]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateDivider]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateFlag]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateFullScreenLayoutAccent]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateIcon]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateIconButton]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateIconFlat]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateIconFlatWithStyle]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateLink]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateListItem]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateProgressBar]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateRadio]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateRadio]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateRating]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateRatingStar]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateSegmentedControl]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateSegmentedControl]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateSegmentedControlActiveOption]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateSlider]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateStackedButton]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateSwitch]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateTab]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateTabs]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateTextArea]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateTextField]: dsCandidateComponentsScore,
    [dsCandidateComponentNames.DsCandidateTooltip]: dsCandidateComponentsScore,

    // Static assets
    // Hard-coded in SVGs
    [webComponentNames.SvgIcon]: dsIconScore,
    [webComponentNames.SvgTokyoUIIcon]: dsIconScore,
    [appComponentNames.SvgIcon]: dsIconScore,
    [appComponentNames.SvgTokyoUIIcon]: dsIconScore,
    [webComponentNames.SvgTokyoUIIllustration]: dsIconScore,
    [appComponentNames.SvgTokyoUIIllustration]: dsIconScore,
};
