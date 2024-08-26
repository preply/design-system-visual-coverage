<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/logo-inverted.svg">
  <source media="(prefers-color-scheme: light)" srcset="./assets/logo.svg">
  <img width="450px" alt="Blade Design System Logo" src="./assets/blade-original.min.svg">
</picture>
</p>

# Preply Design System Visual Coverage

This repository contains the implementation of Preply's design system Visual Coverage (React and React Native), that's how Preply measure the impact of the Design System from the customers' perspective. If you haven't done it before, please read the [TODO:](TODO:) article about the topic to know the why's behind it, and the [TODO:](TODO:) to dig into the implementation details.

## Why are we sharing it?

Measuring the impact of a design system is something all the companies that have one struggle with. By sharing the visual coverage's implementation our implementation, we aim to to provide a quick way to test our solution on other companies' context, then collecting feedback and improving it.

This monorepo comes from Preply's design system, and we removed everything apart fro the visual coverage code.

## I want to try it out, what should I do?

Although Preply's design system visual coverage code is available on NPM, it's set to work with Preply's design system components and is not meant for general use.

In the next steps, we drive you through how to personalize the code, build it, and use it on your product.

Despite the repository contains some [CodeTours](https://marketplace.visualstudio.com/items?itemName=vsls-contrib.codetour), we suggest reading the [TODO:](TODO:) articles thoroughly to understand how the code contained in this repository works.

Please note: only some relevant functions are tested, but the code has been battle tested on Preply.com since we calculate the visual coverage there thousands of times a day.

### Web apps walkthrough

#### Step 1: the component names

List all the names of your components in [webComponentNames](packages/visual-coverage-component-names/src/componentNames.ts).

#### Step 2: the component weights

When the algorithm draws the bitmap starting from the components' boundaries, every component has a different weight. `defaultWeightByComponentName`, in the [constants](.packages/visual-coverage-core/src/core/constants.ts), contains all the component weights.

Once you are done, run `$ yarn build` to ensure there are no TypeScript errors (you can also run `$ yarn dev` to get TS errors as soon as you save files).

#### Step 3: the components' data attribute

All the components that come from the design system must render a `data-preply-ds-component` attribute in page, which value is aligned with the component names set at the step 1. Replace `preply` with your company name in.

Here is a dumb example of a Button component rendering the attribute.

```jsx
import React, { FC } from 'react';
import { webComponentNames } from '@preply/ds-visual-coverage-component-names';
import { coverageContainerDomAttributeName } from '@preply/ds-visual-coverage-core';

export const Button: FC = () => {
    return (
        <button {...{ [coverageContainerDomAttributeName]: webComponentNames.Button }}>
            I'm a Button
        </button>
    );
};
```

#### Step 4: the containers' data attribute

To create a visual coverage container (you can nest multiple ones), leverage `getCoverageContainerAttributes`. We suggest you adding the attributes at every page's `body`, and isolating other components based on if they belong to different teams, or if you need to overcome some limitations of the current implementation (more about this later on). We also suggest using a unique name per page/component.

Please note: despite looks practical, do not add a `<div style="display:contents;">` to the pages just to add the coverage container attributes on it. Display contents' elements do not have boundaries, and this would hurt the visual coverage calculation.

#### Step 5: build the code

The easiest way to play with the visual coverage after you have changed the files, is to build a portable version of it.

Just run `$ npx esbuild packages/visual-coverage-web/src/debug/exposeGlobalDsVisualCoverageObject.ts --bundle --target=es2015 --outfile=portable-visual-coverage.js`.

#### Step 6: enjoy!

1. Copy the code contained in `portable-visual-coverage.js`
2. Go to your website where you have design system components and the page's body render the above mentioned HTML attributes
3. Open the browser's console
4. Paste the code and press enter
5. Type `globalThis.__PREPLY_DS_COVERAGE.runAndVisualize()` and press enter

#### Step 7: scale it

In the `production-code/web` directory, you can look at all the functions we use to enable the visual coverage in prod and how we send data to our Data Warehouse which, in turn, sends the visual coverage events to DataDog. We are sharing it just to show how we use it, we don't expect you to copy/paste it in your website.

The code we run in our web app is the following

```js
if (isDsVisualCoverageSupported() === 'yes' && this.props.appFlags) {
  initDsVisualCoverageInProd({
    userType,
    log: false,
    checkInterval: 500,
  }).start();
}
```

#### Step 8: DataDog dashboard

If you also use DataDog, look at [datadog-dashboard.json](./production-code/datadog-dashboard.json) to create the same dashboard of ours in seconds. Please note it's the dashboard we have at the moment of writing, we will improve it since it's not 100% done but maybe we will not keep the JSON file aligned.

### React Native

At the moment of writing, the React Native implementation is not as portable as the Web one. In the repository, you can "get inspired" by some of our code:

1. `useDsComponentTestId` that tweaks the React Native's components `testID` to recognize them when parsing the whole views hierarchy.
2. `useCoverageContainerTestId` that tweaks the React Native's components `testID` to recognize visual coverage containers.
3. `CoverageSetupProvider` to enable the just-mentioned hooks.
4. [ToolkitManager.swift](./production-code/app/ToolkitManager.swift) that contains the code to retrieve all the views' data.
5. [test-utils.tsx](./production-code/app/test-utils.tsx) which contains our custom [Detox's by.id](https://github.com/wix/Detox) function we use in the E2E tests.

## Get in touch

We'd like to head your feedback, you can contact us at design-system@preply.com.
