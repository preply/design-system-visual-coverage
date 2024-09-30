import type { ChildData } from '@preply/ds-visual-coverage-core';
import { getRectCoordinates } from '@preply/ds-visual-coverage-core';

type ChildDataComparison =
    | 'unknown'
    | 'bIsInsideA'
    | 'bIsAtTheTopOfA'
    | 'bIsAtTheLeftOfA'
    | 'bIsAtTheRightOfA'
    | 'bIsAtTheBottomOfA'
    | 'bAndAAreEqualDsComponents'
    | 'bStartsInsideAAndOverflowsA'
    | 'bAndAAreEqualNonDsComponents'
    | 'bAndAAreDifferentDsComponents'
    | 'bIsEqualToAButBIsDsComponentAndAIsNot'
    | 'bIsEqualToAButBIsNotDsComponentAndAIs'
    | 'bIsEqualToAButBIsDsUiComponentAndAIsLayoutComponent';

/**
 * Originally, this function was used to sort a flat list of components. This was needed with the
 * first implementation of the app coverage, where it was not possible to extract a hierarchy of
 * components but only a flat list of them.
 */
export function compareTwoChildren(a: ChildData, b: ChildData): ChildDataComparison {
    const { top: aTop, left: aLeft, width: aWidth, height: aHeight } = getRectCoordinates(a.rect);
    const { top: bTop, left: bLeft, width: bWidth, height: bHeight } = getRectCoordinates(b.rect);

    const bIsEqualToA =
        aTop === bTop && aLeft === bLeft && aWidth === bWidth && aHeight === bHeight;
    if (bIsEqualToA) {
        const aIsPreplyDsComponent = !!a.dsComponentName;
        const bIsPreplyDsComponent = !!b.dsComponentName;

        // Hypothesis: App has more intermediate components than Web. On App, the nested
        // React Native views do not impact that the user sees. That's why DS components
        // are put after (meaning more closer to the user from a visual perspective) the non
        // DS one.
        // On Web, instead, a flex-display'ed div nested inside a DS LayoutFlex breaks
        // LayoutFlex's ability to control padding. Hence on Web it's negative.
        if (bIsPreplyDsComponent && !aIsPreplyDsComponent) {
            return 'bIsEqualToAButBIsDsComponentAndAIsNot';
        }
        if (!bIsPreplyDsComponent && aIsPreplyDsComponent) {
            return 'bIsEqualToAButBIsNotDsComponentAndAIs';
        }

        if (bIsPreplyDsComponent && aIsPreplyDsComponent) {
            if (
                b.dsComponentType === 'uiDsComponent' &&
                a.dsComponentType === 'layoutDsComponent'
            ) {
                // Theoretically, ui components should be inside layout components, not the opposite
                return 'bIsEqualToAButBIsDsUiComponentAndAIsLayoutComponent';
            }

            if (b.dsComponentType === a.dsComponentType) {
                return 'bAndAAreEqualDsComponents';
            }

            return 'bAndAAreDifferentDsComponents';
        }

        return 'bAndAAreEqualNonDsComponents';
    }

    const bIsAtTheTopOfA = bTop < aTop;
    if (bIsAtTheTopOfA) return 'bIsAtTheTopOfA';

    const bIsAtTheBottomOfA =
        bTop > aTop + aHeight - 1 || (bTop === aTop + aHeight - 1 && bHeight > 0);
    if (bIsAtTheBottomOfA) return 'bIsAtTheBottomOfA';

    const bIsAtTheLeftOfA = bLeft < aLeft;
    if (bIsAtTheLeftOfA) return 'bIsAtTheLeftOfA';

    const bIsAtTheRightOfA =
        bLeft > aLeft + aWidth - 1 || (bLeft === aLeft + aWidth - 1 && bWidth > 0);
    if (bIsAtTheRightOfA) return 'bIsAtTheRightOfA';

    // At this point, the two components are not equal. So the "equal" part of the comparisons (bTop >= aTop)
    // allow putting a lot of possible combinations under the same condition, without getting
    // crazy checking that
    // - B starts at the same coordinates of A but is shorter
    // - B starts at the same coordinates of A but is narrower
    // - B starts after A and it ends before A
    // etc.

    const bIsInsideA =
        bTop >= aTop &&
        bLeft >= aLeft &&
        bTop + bHeight <= aTop + aHeight &&
        bLeft + bWidth <= aLeft + aWidth;

    if (bIsInsideA) {
        return 'bIsInsideA';
    }

    const bStartsInsideA =
        bTop >= aTop &&
        bTop + bHeight < aTop + aHeight &&
        bLeft >= aLeft &&
        bLeft + bWidth < aLeft + aWidth;

    const bOverflowsA =
        bStartsInsideA && (bTop + bHeight >= aTop + aHeight || bLeft + bWidth >= aLeft + aWidth);

    if (bOverflowsA) return 'bStartsInsideAAndOverflowsA';

    // This point should never been reached
    return 'unknown';
}
