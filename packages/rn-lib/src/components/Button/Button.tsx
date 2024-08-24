import React, { type FC } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useDsComponentTestId } from '@preply/ds-visual-coverage-rn';
import { appComponentNames } from '@preply/ds-visual-coverage-component-names';

export const Button: FC = ({ testID }: { testID?: string }) => {
    const dsComponentTestId = useDsComponentTestId({ componentName: appComponentNames.Button });

    return (
        <View testID={dsComponentTestId}>
            <Pressable testID={testID}>
                <Text>React Native button</Text>
            </Pressable>
        </View>
    );
};
