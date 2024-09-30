import { dsComponentTestIdSeparator } from '../hooks/useDsComponentTestId';

export function parseDsComponentAccessibilityIdentifier(
    accessibilityIdentifier: string,
): string | null {
    return accessibilityIdentifier.split(dsComponentTestIdSeparator)[1] ?? null;
}
