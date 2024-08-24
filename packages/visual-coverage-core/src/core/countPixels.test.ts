import { getReadableBitmap } from '../bitmap/getReadableBitmap';
import { createRect } from '../rect/rectProperties';
import { ChildData, WeightByComponentName } from '../types';
import { createLogger } from '../utils/createLogger';

import { defaultPixelByPixelType } from './constants';
import { countPixels } from './countPixels';

const loggerStub = createLogger(false);

const weightByComponentName: WeightByComponentName = {
    emptyPixel: 0,

    nonDsComponent: 1,
    unknownDsComponent: 1,
    // DS components
    Avatar: 1,
    Badge: 1,
    Box: 1,
    Button: 1,
    Chip: 1,
    FieldAdditionalText: 1,
    FieldButton: 1,
    FieldLayout: 1,
    Heading: 1,
    Icon: 1,
    IconButton: 1,
    LayoutFlex: 1,
    LayoutFlexItem: 1,
    LayoutGrid: 1,
    LayoutGridItem: 1,
    Link: 1,
    Loader: 1,
    NumberField: 1,
    PasswordField: 1,
    PreplyLogo: 1,
    SelectField: 1,
    Text: 1,
    TextareaField: 1,
    TextField: 1,
    TextHighlighted: 1,
    TextInline: 1,
    // Rebrand components
    RebrandAccordion: 1,
    RebrandAlert: 1,
    RebrandBubble: 1,
    RebrandBubbleOnIcon: 1,
    RebrandCheckbox: 1,
    RebrandChip: 1,
    RebrandChoiceTile: 1,
    RebrandDivider: 1,
    RebrandDropdown: 1,
    RebrandFlag: 1,
    RebrandListItem: 1,
    RebrandListMenu: 1,
    RebrandModal: 1,
    RebrandPopover: 1,
    RebrandProgressBar: 1,
    RebrandRadioButton: 1,
    RebrandRadioGroup: 1,
    RebrandRange: 1,
    RebrandRating: 1,
    RebrandSegmentedButtons: 1,
    RebrandSegmentedControls: 1,
    RebrandSelect: 1,
    RebrandSlider: 1,
    RebrandStackedImage: 1,
    RebrandSwitch: 1,
    RebrandTabs: 1,
    RebrandToast: 1,
    RebrandTooltip: 1,
    // DS candidates
    DsCandidateAlert: 1,
    DsCandidateAvatar: 1,
    DsCandidateAvatarWithStatus: 1,
    DsCandidateBadge: 1,
    DsCandidateBox: 1,
    DsCandidateBubble: 1,
    DsCandidateCheckbox: 1,
    DsCandidateChip: 1,
    DsCandidateChoiceTile: 1,
    DsCandidateCollapsibleList: 1,
    DsCandidateCollapsibleItem: 1,
    DsCandidateDivider: 1,
    DsCandidateFlag: 1,
    DsCandidateFullScreenLayoutAccent: 1,
    DsCandidateIcon: 1,
    DsCandidateIconFlat: 1,
    DsCandidateIconFlatWithStyle: 1,
    DsCandidateIconButton: 1,
    DsCandidateLink: 1,
    DsCandidateListItem: 1,
    DsCandidateProgressBar: 1,
    DsCandidateRadio: 1,
    DsCandidateRating: 1,
    DsCandidateRatingStar: 1,
    DsCandidateSegmentedControlActiveOption: 1,
    DsCandidateSegmentedControl: 1,
    DsCandidateSlider: 1,
    DsCandidateStackedButton: 1,
    DsCandidateSwitch: 1,
    DsCandidateTab: 1,
    DsCandidateTabs: 1,
    DsCandidateTextArea: 1,
    DsCandidateTextField: 1,
    DsCandidateTooltip: 1,
};

describe('countPixels', () => {
    describe('Given a basic container', () => {
        describe('and the simplest possible component weights', () => {
            it('should create the correct bitmap', () => {
                // Arrange
                const coverageContainerRect = createRect({
                    top: 0,
                    left: 0,
                    width: 20,
                    height: 20,
                });

                // Artificially creating a layout like this:
                // 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                // 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                // ⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️
                // 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                // 🟥⬛️🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩⬛️🟥
                // 🟥⬛️🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️🟥
                // 🟥⬛️🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️⬛️⬛️🟩⬛️🟩⬛️⬛️⬛️🟩⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                // 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                // 🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
                // 🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩
                // 🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩
                // 🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩
                // 🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩

                const productHeader: ChildData = {
                    dsComponentName: null,
                    dsComponentType: 'nonDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 0, left: 0, width: 20, height: 3 }),
                    componentData: '',
                };
                const productBox: ChildData = {
                    dsComponentName: null,
                    dsComponentType: 'nonDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 4, left: 0, width: 20, height: 11 }),
                    componentData: '',
                };
                const dsHeading: ChildData = {
                    dsComponentName: 'Heading',
                    dsComponentType: 'uiDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 6, left: 2, width: 16, height: 3 }),
                    componentData: '',
                };
                const dsButton1: ChildData = {
                    dsComponentName: 'Button',
                    dsComponentType: 'uiDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 10, left: 7, width: 5, height: 3 }),
                    componentData: '',
                };
                const dsButton2: ChildData = {
                    dsComponentName: 'Button',
                    dsComponentType: 'uiDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 10, left: 13, width: 5, height: 3 }),
                    componentData: '',
                };
                const dsBox: ChildData = {
                    dsComponentName: 'Box',
                    dsComponentType: 'layoutDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 15, left: 0, width: 20, height: 5 }),
                    componentData: '',
                };

                const childrenData: ChildData[] = [
                    productHeader,
                    productBox,
                    dsHeading,
                    dsButton1,
                    dsButton2,
                    dsBox,
                ];

                const result = countPixels({
                    logger: loggerStub,
                    elementRect: coverageContainerRect,
                    childrenData,
                    printAsciiArt: false,
                    pixelByPixelType: defaultPixelByPixelType,
                    weightByComponentName,
                    offset: { top: 0, left: 0 },
                });
                expect(getReadableBitmap({ width: 20, bitmap: result.bitmap }))
                    .toMatchInlineSnapshot(`
                                            "
                                            🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                                            🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                                            🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                                            ⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️
                                            🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                                            🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                                            🟥⬛️🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩⬛️🟥
                                            🟥⬛️🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️🟥
                                            🟥⬛️🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩⬛️🟥
                                            🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                                            🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
                                            🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️⬛️⬛️🟩⬛️🟩⬛️⬛️⬛️🟩⬛️🟥
                                            🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
                                            🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                                            🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                                            🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
                                            🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩
                                            🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩
                                            🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩
                                            🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩"
                                    `);
            });
        });

        describe('and more complex component weights', () => {
            it('should create the correct bitmap', () => {
                // Arrange
                const coverageContainerRect = createRect({
                    top: 0,
                    left: 0,
                    width: 20,
                    height: 20,
                });

                // Artificially creating a layout like this:
                // 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                // 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                // ⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️
                // 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                // 🟥⬛️🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩⬛️🟥
                // 🟥⬛️🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️🟥
                // 🟥⬛️🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️⬛️⬛️🟩⬛️🟩⬛️⬛️⬛️🟩⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                // 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                // 🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
                // 🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩
                // 🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩
                // 🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩
                // 🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩

                const productHeader: ChildData = {
                    dsComponentName: null,
                    dsComponentType: 'nonDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 0, left: 0, width: 20, height: 3 }),
                    componentData: '',
                };
                const productBox: ChildData = {
                    dsComponentName: null,
                    dsComponentType: 'nonDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 4, left: 0, width: 20, height: 11 }),
                    componentData: '',
                };
                const dsHeading: ChildData = {
                    dsComponentName: 'Heading',
                    dsComponentType: 'uiDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 6, left: 2, width: 16, height: 3 }),
                    componentData: '',
                };
                const dsButton1: ChildData = {
                    dsComponentName: 'Button',
                    dsComponentType: 'uiDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 10, left: 7, width: 5, height: 3 }),
                    componentData: '',
                };
                const dsButton2: ChildData = {
                    dsComponentName: 'Button',
                    dsComponentType: 'uiDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 10, left: 13, width: 5, height: 3 }),
                    componentData: '',
                };
                const dsBox: ChildData = {
                    dsComponentName: 'Box',
                    dsComponentType: 'layoutDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 15, left: 0, width: 20, height: 5 }),
                    componentData: '',
                };

                const childrenData: ChildData[] = [
                    productHeader,
                    productBox,
                    dsHeading,
                    dsButton1,
                    dsButton2,
                    dsBox,
                ];

                const result = countPixels({
                    logger: loggerStub,
                    elementRect: coverageContainerRect,
                    childrenData,
                    printAsciiArt: false,
                    pixelByPixelType: defaultPixelByPixelType,
                    weightByComponentName: {
                        ...weightByComponentName,
                        // Tweaking just some of the ones used by the test
                        nonDsComponent: 2,
                        Button: 2,
                        Heading: 2,
                    },
                    offset: { top: 0, left: 0 },
                });
                expect(getReadableBitmap({ width: 20, bitmap: result.bitmap }))
                    .toMatchInlineSnapshot(`
                                            "
                                            🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                                            🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                                            🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                                            ⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️
                                            🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                                            🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                                            🟥🟥🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟥🟥
                                            🟥🟥🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟥🟥
                                            🟥🟥🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟥🟥
                                            🟥🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥🟥
                                            🟥🟥⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩🟥🟥
                                            🟥🟥⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩🟥🟥
                                            🟥🟥⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩🟥🟥
                                            🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                                            🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                                            🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
                                            🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩
                                            🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩
                                            🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩
                                            🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩"
                                    `);
            });
        });
    });

    describe('Given some overlapping components', () => {
        describe('and the simplest possible component weights', () => {
            it(`should create a bitmap`, () => {
                // Arrange
                const coverageContainerRect = createRect({
                    top: 0,
                    left: 0,
                    width: 20,
                    height: 15,
                });

                // Artificially creating a layout like this:
                // 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                // 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                // ⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️
                // 🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟥🟥🟥🟥
                // 🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️⬛️⬛️🟥
                // 🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩⬛️⬛️⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️⬛️⬛️🟩⬛️🟩⬛️⬛️⬛️🟩⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                // 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥

                const productHeader: ChildData = {
                    dsComponentName: null,
                    dsComponentType: 'nonDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 0, left: 0, width: 20, height: 3 }),
                    componentData: '',
                };
                const productBox: ChildData = {
                    dsComponentName: null,
                    dsComponentType: 'nonDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 4, left: 0, width: 20, height: 11 }),
                    componentData: '',
                };
                const dsHeading: ChildData = {
                    dsComponentName: 'Heading',
                    dsComponentType: 'uiDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 4, left: 0, width: 16, height: 3 }),
                    componentData: '',
                };
                const dsButton1: ChildData = {
                    dsComponentName: 'Button',
                    dsComponentType: 'uiDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 10, left: 7, width: 5, height: 3 }),
                    componentData: '',
                };
                const dsButton2: ChildData = {
                    dsComponentName: 'Button',
                    dsComponentType: 'uiDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 10, left: 13, width: 5, height: 3 }),
                    componentData: '',
                };

                const childrenData: ChildData[] = [
                    productHeader,
                    productBox,
                    dsHeading,
                    dsButton1,
                    dsButton2,
                ];

                const result = countPixels({
                    logger: loggerStub,
                    elementRect: coverageContainerRect,
                    childrenData,
                    printAsciiArt: false,
                    pixelByPixelType: defaultPixelByPixelType,
                    weightByComponentName,
                    offset: { top: 0, left: 0 },
                });
                expect(getReadableBitmap({ width: 20, bitmap: result.bitmap }))
                    .toMatchInlineSnapshot(`
                                    "
                                    🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                                    🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                                    🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                                    ⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️
                                    🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟥🟥🟥🟥
                                    🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️⬛️⬛️🟥
                                    🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩⬛️⬛️⬛️🟥
                                    🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                                    🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                                    🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                                    🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
                                    🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️⬛️⬛️🟩⬛️🟩⬛️⬛️⬛️🟩⬛️🟥
                                    🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
                                    🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                                    🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥"
                            `);
            });
        });

        describe('and more component weights that are higher than the component weight', () => {
            it(`should create the correct bitmap where the pixels don't exit the component area`, () => {
                // Arrange
                const coverageContainerRect = createRect({
                    top: 0,
                    left: 0,
                    width: 20,
                    height: 15,
                });

                // Artificially creating a layout like this:
                // 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                // 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                // ⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️
                // 🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟥🟥🟥🟥
                // 🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️⬛️⬛️🟥
                // 🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️⬛️⬛️🟥
                // 🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️⬛️⬛️🟥
                // 🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️⬛️⬛️🟥
                // 🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩⬛️⬛️⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️⬛️⬛️🟩⬛️🟩⬛️⬛️⬛️🟩⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                // 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥

                const productHeader: ChildData = {
                    dsComponentName: null,
                    dsComponentType: 'nonDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 0, left: 0, width: 20, height: 3 }),
                    componentData: '',
                };
                const productBox: ChildData = {
                    dsComponentName: null,
                    dsComponentType: 'nonDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 4, left: 0, width: 20, height: 11 }),
                    componentData: '',
                };
                const dsHeading: ChildData = {
                    dsComponentName: 'Heading',
                    dsComponentType: 'uiDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 4, left: 0, width: 16, height: 3 }),
                    componentData: '',
                };
                const dsButton1: ChildData = {
                    dsComponentName: 'Button',
                    dsComponentType: 'uiDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 10, left: 7, width: 5, height: 3 }),
                    componentData: '',
                };
                const dsButton2: ChildData = {
                    dsComponentName: 'Button',
                    dsComponentType: 'uiDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 10, left: 13, width: 5, height: 3 }),
                    componentData: '',
                };

                const childrenData: ChildData[] = [
                    productHeader,
                    productBox,
                    dsHeading,
                    dsButton1,
                    dsButton2,
                ];

                const result = countPixels({
                    logger: loggerStub,
                    elementRect: coverageContainerRect,
                    childrenData,
                    printAsciiArt: false,
                    pixelByPixelType: defaultPixelByPixelType,
                    weightByComponentName: {
                        ...weightByComponentName,
                        // Tweaking just some of the ones used by the test
                        Heading: 3,
                        Button: 2,
                    },
                    offset: { top: 0, left: 0 },
                });
                expect(getReadableBitmap({ width: 20, bitmap: result.bitmap }))
                    .toMatchInlineSnapshot(`
                        "
                        🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                        🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                        🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                        ⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️
                        🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟥🟥🟥🟥
                        🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩⬛️⬛️⬛️🟥
                        🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩⬛️⬛️⬛️🟥
                        🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                        🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                        🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                        🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
                        🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
                        🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
                        🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                        🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥"
                    `);
            });
        });
    });
});
