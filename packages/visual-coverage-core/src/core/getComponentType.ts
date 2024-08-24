import {
    appComponentNames,
    dsCandidateComponentNames,
    rebrandComponentNames,
    webComponentNames,
} from '@preply/ds-visual-coverage-component-names';
import type { ComponentNames } from '@preply/ds-visual-coverage-component-names';

import type { ComponentType } from '../types';

// see https://x.com/mattpocockuk/status/1823380970147369171
type LooseAutocomplete<T extends string> = T | (string & {});

export function getComponentType(
    componentName: LooseAutocomplete<ComponentNames> | null,
): ComponentType {
    if (componentName === null) return 'nonDsComponent';

    if (componentName.startsWith('Rebrand')) {
        return 'rebrandComponent';
    }

    if (componentName.startsWith('DsCandidate')) {
        return 'dsCandidateComponent';
    }
    switch (componentName) {
        case webComponentNames.Box:
        case webComponentNames.LayoutFlex:
        case webComponentNames.LayoutFlexItem:
        case webComponentNames.LayoutGrid:
        case webComponentNames.LayoutGridItem:
        case appComponentNames.LayoutFlex:
        case appComponentNames.LayoutFlexItem:
            return 'layoutDsComponent';

        case webComponentNames.ObserverIntersection:
            return 'utilDsComponent';

        case webComponentNames.Panel:
        case webComponentNames.PanelBody:
        case webComponentNames.PanelFooter:
        case webComponentNames.PanelHeader:
        case webComponentNames.PanelSection:
        case rebrandComponentNames.RebrandChip:
            return 'outdatedDsComponent';

        case webComponentNames.AvatarWithStatus:
        case webComponentNames.Avatar:
        case webComponentNames.Badge:
        case webComponentNames.Button:
        case webComponentNames.Chip:
        case webComponentNames.FieldButton:
        case webComponentNames.FieldLayout:
        case webComponentNames.Heading:
        case webComponentNames.IconButton:
        case webComponentNames.Icon:
        case webComponentNames.Link:
        case webComponentNames.Loader:
        case webComponentNames.NumberField:
        case webComponentNames.PasswordField:
        case webComponentNames.PreplyLogo:
        case webComponentNames.SelectField:
        case webComponentNames.TextField:
        case webComponentNames.TextHighlighted:
        case webComponentNames.TextInline:
        case webComponentNames.Text:
        case webComponentNames.TextareaField:
        case webComponentNames.Textarea:
        case appComponentNames.Button:
        case appComponentNames.Heading:
        case appComponentNames.Text:
        case appComponentNames.TextInline:
        case appComponentNames.Loader:
            return 'uiDsComponent';

        case webComponentNames.Checkbox:
        case webComponentNames.InputDate:
        case webComponentNames.InputNumber:
        case webComponentNames.InputPassword:
        case webComponentNames.InputText:
        case webComponentNames.InputTime:
        case webComponentNames.Radio:
        case webComponentNames.Select:
        case webComponentNames.SelectFieldLayout:
            return 'uiDsComponent';

        case rebrandComponentNames.RebrandModal:
            return 'layoutDsComponent';

        case rebrandComponentNames.RebrandAccordion:
        case rebrandComponentNames.RebrandAlert:
        case rebrandComponentNames.RebrandBubble:
        case rebrandComponentNames.RebrandBubbleOnIcon:
        case rebrandComponentNames.RebrandCheckbox:
        case rebrandComponentNames.RebrandChoiceTile:
        case rebrandComponentNames.RebrandDivider:
        case rebrandComponentNames.RebrandDropdown:
        case rebrandComponentNames.RebrandFlag:
        case rebrandComponentNames.RebrandListItem:
        case rebrandComponentNames.RebrandListMenu:
        case rebrandComponentNames.RebrandPopover:
        case rebrandComponentNames.RebrandProgressBar:
        case rebrandComponentNames.RebrandRadioButton:
        case rebrandComponentNames.RebrandRadioGroup:
        case rebrandComponentNames.RebrandRange:
        case rebrandComponentNames.RebrandRating:
        case rebrandComponentNames.RebrandSegmentedButtons:
        case rebrandComponentNames.RebrandSegmentedControls:
        case rebrandComponentNames.RebrandSelect:
        case rebrandComponentNames.RebrandSlider:
        case rebrandComponentNames.RebrandStackedImage:
        case rebrandComponentNames.RebrandSwitch:
        case rebrandComponentNames.RebrandTabs:
        case rebrandComponentNames.RebrandToast:
        case rebrandComponentNames.RebrandTooltip:
            return 'uiDsComponent';

        case dsCandidateComponentNames.DsCandidateBox:
        case dsCandidateComponentNames.DsCandidateFullScreenLayoutAccent:
            return 'layoutDsComponent';

        case dsCandidateComponentNames.DsCandidateAlert:
        case dsCandidateComponentNames.DsCandidateAvatar:
        case dsCandidateComponentNames.DsCandidateAvatarWithStatus:
        case dsCandidateComponentNames.DsCandidateBadge:
        case dsCandidateComponentNames.DsCandidateBubble:
        case dsCandidateComponentNames.DsCandidateCheckbox:
        case dsCandidateComponentNames.DsCandidateChip:
        case dsCandidateComponentNames.DsCandidateChoiceTile:
        case dsCandidateComponentNames.DsCandidateCollapsibleList:
        case dsCandidateComponentNames.DsCandidateCollapsibleItem:
        case dsCandidateComponentNames.DsCandidateDivider:
        case dsCandidateComponentNames.DsCandidateFlag:
        case dsCandidateComponentNames.DsCandidateIcon:
        case dsCandidateComponentNames.DsCandidateIconFlat:
        case dsCandidateComponentNames.DsCandidateIconFlatWithStyle:
        case dsCandidateComponentNames.DsCandidateIconButton:
        case dsCandidateComponentNames.DsCandidateLink:
        case dsCandidateComponentNames.DsCandidateListItem:
        case dsCandidateComponentNames.DsCandidateProgressBar:
        case dsCandidateComponentNames.DsCandidateRadio:
        case dsCandidateComponentNames.DsCandidateRating:
        case dsCandidateComponentNames.DsCandidateRatingStar:
        case dsCandidateComponentNames.DsCandidateSegmentedControlActiveOption:
        case dsCandidateComponentNames.DsCandidateSegmentedControl:
        case dsCandidateComponentNames.DsCandidateSlider:
        case dsCandidateComponentNames.DsCandidateStackedButton:
        case dsCandidateComponentNames.DsCandidateSwitch:
        case dsCandidateComponentNames.DsCandidateTab:
        case dsCandidateComponentNames.DsCandidateTabs:
        case dsCandidateComponentNames.DsCandidateTextArea:
        case dsCandidateComponentNames.DsCandidateTextField:
        case dsCandidateComponentNames.DsCandidateTooltip:
            return 'uiDsComponent';

        case webComponentNames.SvgIcon:
        case webComponentNames.SvgTokyoUIIcon:
        case appComponentNames.SvgIcon:
        case appComponentNames.SvgTokyoUIIcon:
        case webComponentNames.SvgTokyoUIIllustration:
        case appComponentNames.SvgTokyoUIIllustration:
            return 'uiDsComponent';

        default:
            return 'unknownDsComponent';
    }
}
