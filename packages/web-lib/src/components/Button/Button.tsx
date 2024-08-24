import React, { FC } from 'react';
import { webComponentNames } from '@preply/ds-visual-coverage-component-names';
import { coverageContainerDomAttributeName } from '@preply/ds-visual-coverage-core';

export const Button: FC = () => {
    return (
        <button {...{ [coverageContainerDomAttributeName]: webComponentNames.Button }}>
            React Button
        </button>
    );
};
