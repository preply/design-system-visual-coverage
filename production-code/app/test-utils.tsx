// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- The rule is ignored because file is brought from the React Native codebase, where the project configuration is different and makes it valid.
// @ts-nocheck

import { by } from 'detox';

export let _by: Detox.ByFacade & {
    rawDetoxId: typeof by.id;
};
try {
    _by = {
        // At the moment of writing, it's not clear to me why I can't just spread the `by` object
        text: by.text,
        label: by.label,
        type: by.type,
        traits: by.traits,
        web: by.web,
        system: by.system,

        rawDetoxId: by.id,

        /**
         * by.id will match an id that is given to the view via testID prop.
         * @example
         * // In a React Native component add testID like so:
         * <TouchableOpacity testID={'tap_me'}>
         * // Then match with by.id:
         * await element(by.id('tap_me'));
         * await element(by.id(/^tap_[a-z]+$/));
         *
         * *The above documentation has been copied from Detox's one*
         */
        id(id: string | RegExp) {
            if (id instanceof RegExp)
                throw new Error(
                    `Use rawDetoxId if you want regexp-based selectors. by.id takes the DS coverage suffix into account (look at the source code). The passed id is ${id.toString()}`,
                );

            // When the DS coverage is enabled, some components (the DS components and the DS coverage containers)
            // include some DS coverage-specific info in their testID. Hence, the normal by.id used everywhere
            // would not retrieve the elements when the E2E tests are launched (the the DS coverage is enabled during the E2E tests)
            //
            // For instance:
            // - the testID returned by `useDsComponentTestId({componentName: 'Button'})` is `'-dsCoverage:dsComponent:Button'`
            // - the testID returned by `useDsComponentTestId({componentName: 'Button', testID: 'Login'})` is `'Login-dsCoverage:dsComponent:Button'`
            // - the testID returned by `useCoverageContainerTestId({team: "subx",component: "Checkout"})` is `'-dsCoverage:coverageContainer:{"team":"subx","component":"Checkout"}'`
            // - the testID returned by `useCoverageContainerTestId({team: "subx",component: "Checkout", testID: "subscribe"})` is `'subscribe-dsCoverage:coverageContainer:{"team":"subx","component":"Checkout"}'`
            //
            // At the moment of writing, by.id is never passed with the regexp in the E2E tests.
            //
            // @todo The suffix should be imported by the DS
            const idAndDsCoverageSuffixMaybe = new RegExp('^' + id + '(-dsCoverage:(.*)?)?$');

            return by.id(idAndDsCoverageSuffixMaybe);
        },
    };
} catch (e) {
    // The following error
    // > DetoxRuntimeError: Detox worker instance has not been installed in this context (DetoxPrimaryContext).
    // > HINT: If you are using Detox with Jest according to the latest guide, please report this issue on our GitHub tracker:
    // > https://github.com/wix/Detox/issues
    // > Otherwise, make sure you call detox.installWorker() beforehand.
    // is thrown by Jest when the `by` object is extended with the new method.
    const isExpectedError =
        e instanceof Error &&
        e.message.includes(
            'Detox worker instance has not been installed in this context (DetoxPrimaryContext).',
        );

    if (isExpectedError)
        console.error('Detox thrown an expected error the DS team has intentionally turned off');
    else throw e;
}
