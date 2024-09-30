import type { CoverageContainer } from '@preply/ds-visual-coverage-core';

import { parseCoverageContainerDomAttribute } from './getCoverageContainerAttributes';

describe('parseCoverageContainerDomAttribute', () => {
    it('should validate when all properties are provided correctly', () => {
        const validData: CoverageContainer = {
            ignore: true,
            team: 'teamA',
            component: 'some-component',
        };

        expect(() => {
            parseCoverageContainerDomAttribute(validData);
        }).not.toThrow();
    });

    it('should throw an error when "team" property is missing', () => {
        // @ts-expect-error Invalid data is provided on purpose for testing
        const invalidData: CoverageContainer = {
            ignore: true,
            component: 'some-component',
        };

        expect(() => {
            parseCoverageContainerDomAttribute(invalidData);
        }).toThrow(Error);
    });

    it('should throw an error when "component" property is missing', () => {
        // @ts-expect-error Invalid data is provided on purpose for testing
        const invalidData: CoverageContainer = {
            ignore: true,
            team: 'teamA',
        };

        expect(() => {
            parseCoverageContainerDomAttribute(invalidData);
        }).toThrow(Error);
    });
});
