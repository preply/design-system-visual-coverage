import type { CoverageContainer } from '@preply/ds-visual-coverage-core';

interface PlainObject {
    hasOwnProperty<K extends string>(key: K): this is Record<K, unknown>;

    // Object.hasOwn() is intended as a replacement for Object.hasOwnProperty(). See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn
    hasOwn<K extends string>(key: K): this is Record<K, unknown>;
}
function isPlainObject(value: unknown): value is PlainObject {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}

/**
 * @see https://dev.to/noriste/keeping-typescript-type-guards-safe-and-up-to-date-a-simpler-solution-ja3
 */
export function isCoverageContainer(value: unknown): value is CoverageContainer {
    if (!isPlainObject(value)) return false;

    // Required fields

    // Disabling ESLint rule Otherwise TS inference does not work
    // eslint-disable-next-line no-prototype-builtins
    if (!value.hasOwnProperty('team')) return false;
    // eslint-disable-next-line no-prototype-builtins
    if (!value.hasOwnProperty('component')) return false;

    const { team, component } = value;

    if (typeof team !== 'string') return false;
    if (typeof component !== 'string') return false;

    // Optional Fields fields
    // Every optional field must be mapped to a local variable only when it exists

    let ignore: boolean | undefined;

    // Disabling ESLint rule Otherwise TS inference does not work
    // eslint-disable-next-line no-prototype-builtins
    if (value.hasOwnProperty('ignore')) {
        if (typeof value.ignore !== 'boolean') return false;
        ignore = value.ignore;
    }

    const obj = { team, component, ignore };
    // @ts-expect-error TS can't infer that if ignore is undefined the function returns earlier
    const isValid: CoverageContainer = obj;
    const noNewOptionalProps: Omit<Required<CoverageContainer>, keyof typeof obj> = {};

    return !!isValid && !!noNewOptionalProps;
}
