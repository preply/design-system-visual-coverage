import { webComponentNames, appComponentNames } from '@preply/ds-visual-coverage-component-names';
import type { ComponentNames } from '@preply/ds-visual-coverage-component-names';

import type { ComponentType } from '../types';

// see https://x.com/mattpocockuk/status/1823380970147369171
type LooseAutocomplete<T extends string> = T | (string & {});

export function getComponentType(
    componentName: LooseAutocomplete<ComponentNames> | null,
): ComponentType {
    if (componentName === null) return 'nonDsComponent';

    switch (componentName) {
        case webComponentNames.LayoutFlex:
            return 'layoutDsComponent';

        case webComponentNames.Button:
        case webComponentNames.Checkbox:
        case appComponentNames.Loader:
            return 'uiDsComponent';

        default:
            return 'unknownDsComponent';
    }
}
