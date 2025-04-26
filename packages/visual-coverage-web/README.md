# `@preply/ds-visual-coverage-web`

Please read [`@preply/ds-visual-coverage-core`'s README first](../visual-coverage-core/README.md).

All the Web-specific utilities to calculate the Design System visual coverage.

The calculation uses `requestIdleCallback`, Web Workers, and typed arrays to be run in production without affecting the users' UX. You can read more about the performance optimizations on [Preply's Engineering blog: The Implementation Details of Preply’s Design System Visual Coverage (part II)](https://medium.com/preply-engineering/the-implementation-details-of-preplys-design-system-visual-coverage-86b4a78ad2bb).

---

## Why, what, and how

The tutorial that follows allows you to play with the Visual Coverage in less than an hour, and to go from zero to hero in less than a day (compared to the months Preply dedicated to refine this project, battle-test it in production, etc.) when it comes to measure the impact of the Design System on your Product.

If you're new to the project, we suggest you reading the two extensive articles we published on Preply's engineering blog that explain the why, what and how of the project: [Visual coverage: Why and How Preply Measures the Impact of the Design System (part I)](https://medium.com/preply-engineering/visual-coverage-why-and-how-preply-measures-the-impact-of-the-design-system-1057115f4aff), and [The Implementation Details of Preply’s Design System Visual Coverage (part II)](https://medium.com/preply-engineering/the-implementation-details-of-preplys-design-system-visual-coverage-86b4a78ad2bb).

## Tutorial

## Step 1: Exposing `createCalculateDsVisualCoverages` for quick iterations

We are going to expose `createCalculateDsVisualCoverages` on the `window` object so we can then invoke it straight from the browser's devtools.

### Hacky way

The Design System Visual Coverage library is available on NPM. The easiest way to try it out on your website is

1. Copy the following code

```js
import('https://cdn.skypack.dev/@preply/ds-visual-coverage-web').then(dsCoverageLibrary => {
  globalThis.createCalculateDsVisualCoverages = dsCoverageLibrary.createCalculateDsVisualCoverages;
  globalThis.visualizeCoverage = dsCoverageLibrary.visualizeCoverage;
  console.log('You can now play with the DS Visual Coverage, have fun! 📈');
});
```

1. Paste it into the browser console (right click on the page > click "inspect" > go to "Console").
2. Press enter to execute the code.
3. If you see the above success message, the preliminary setup is complete! If the browser throws an error like

```
Refused to load the script 'https://cdn.skypack.dev/@preply/ds-visual-coverage-web' because it violates the following Content Security Policy directive: "script-src 'self'
```

then, go to the next step.

> [!NOTE]
> Please note: you must copy/paste it every time you navigate to a page! Or just press the arrow up in the browser's console to retrieve the last executed snippet.

### Proper way

A developer must add the following code to the website:

1. Install `@preply/ds-visual-coverage-web` from NPM.
2. Insert the following code into your website:

```ts
import { createCalculateDsVisualCoverages } from '@preply/ds-visual-coverage-web';

globalThis.createCalculateDsVisualCoverages = createCalculateDsVisualCoverages;
globalThis.visualizeCoverage = visualizeCoverage;
```

1. Deploy it somewhere (for example, the staging website, or even the production one)
2. To test that everything works, just copy/paste the following code in the browser's console `globalThis.createCalculateDsVisualCoverages` and press enter. If you see `undefined`, it means the `createCalculateDsVisualCoverages` is not exposed globally.

## Step 2: Playing with `createCalculateDsVisualCoverages`

### Calculating and visualizing the Visual Coverage

Now that you can invoke `globalThis.createCalculateDsVisualCoverages` from the browser's devtools, copy/paste the following code and press enter.

```js
globalThis
  .createCalculateDsVisualCoverages({
    log: true,
    getComponentData: () => {
      return {
        result: 'countComponent',
        weight: 1,
        dsComponentName: null, // `null` marks the DOM elements as a non-design system one
        debugInfo: '',
        debugColor: 'yellow',
      };
    },
  })
  .run({
    onError: console.error,
    onComplete: result => {
      console.info(result);
      globalThis.visualizeCoverage({ result, svgRendererAttributeName: 'dsVisualCoverage' });
    },
  });
```

You should see a log similar to

```
Found 1 coverage containers
🎬 Calculation start
🏁 Calculation end
DS Visual Coverage  Container: <body> - Coverage: 0.00 %
```

and this is how the page (I used a simple demo app) looks like (please note the yellow borders around the DOM elements)

![the screenshot of the website load in the browser, and what's visible in the console after a successful run](./assets/first-coverage-run.png)

### Identifying the DS components

The next step is to identify which are the DOM elements generated by DS components and which aren't. For example

- [Preply](https://preply.com/)'s Design System components use a dedicated `data-preply-ds-component` HTML attribute to expose the component name.
- [WorkWave](https://www.workwave.com/)'s Design System components use a dedicated `data-tidal` HTML attribute, or they use the Material UI classnames to get the component name (ex., they extract `MuiBox` from `MuiBox-root css-qhv8ek`).

Returning to my minimal app:

1. If I add a `data-ds-component` attribute to the button
2. And I modify the body of `getComponentData` this way

```diff
globalThis
  .createCalculateDsVisualCoverages({
    log: true,
-   getComponentData: () => {
+   getComponentData: ({ component }) => { // <-- It will be called for each DOM element in the page
+     const dsComponentsAttribute = component.getAttribute('data-ds-component');
+
+     if (dsComponentsAttribute) {
+       return {
+         result: 'countComponent',
+         weight: 10, // <-- makes it more visible
+         dsComponentName: dsComponentsAttribute, // <-- the name of the DS component
+         debugInfo: '',
+         debugColor: 'green',
+       };
+     }
      return {
        result: 'countComponent',
        weight: 1,
        dsComponentName: null,
        debugInfo: '',
        debugColor: 'red',
      };
    },
  })
  .run({
    onError: console.error,
    onComplete: result => {
      console.info(result);
      globalThis.visualizeCoverage({ result, svgRendererAttributeName: 'dsVisualCoverage' });
    },
  });
```

The result is the following. Please look at the button's green border, and the coverage that's now ~25%.

![the screenshot of the website load in the browser, and what's visible in the console after a successful run](./assets/identify-ds-components.png)

We set `10` as the button's weight, but let's dig into the component weights and why they matter.

### The component weight

The Design System Visual Coverage counts the DOM element's borders. Most of the times, the Design System components are small to medium sized (like the button in the previous example).

If we use `green` for the DS components, and `red` for the other ones, the DS coverage formula (which is `green pixels / (green pixels + red pixels) * 100`) would give more importance to the layout/container DOM elements, which are larger. The component weight solves this problem by allowing the smaller components to weight more, hence being more important than the layout components.

Please note that the component weight is heavily subjective! It should reflect the importance of your DS components and/or the usage you want to incentivize/penalize. Here's how you can identify your components' weights:

1. Clone [the following Google Spreadsheet template](https://docs.google.com/spreadsheets/d/16wy5g2vYsMODTUf2RoZ1GkPweQ_I2rQJnnSrwnuG0OE/edit?gid=0#gid=0).
2. Follow the instructions in the spreadsheet. The goal is to find the components' weight relative to each other, not the absolute weight.
3. When you are done, use the components' weights in the `getComponentData` function. Here's an example

```diff
globalThis
  .createCalculateDsVisualCoverages({
    log: true,
    getComponentData: ({ component }) => {
      const dsComponentsAttribute = component.getAttribute('data-ds-component');

-     if (dsComponentsAttribute) {
+     if (dsComponentsAttribute === 'Button') {
        return {
          result: 'countComponent',
-         weight: 10, // <-- makes it more visible
+         weight: 18,
-         dsComponentName: dsComponentsAttribute,
+         dsComponentName: 'Button',
          debugInfo: 'Button',
          debugColor: 'green',
        };
      }
+     if (dsComponentsAttribute === 'Badge') {
+       return {
+         result: 'countComponent',
+         weight: 5,
+         dsComponentName: 'Badge',
+         debugInfo: 'Badge',
+         debugColor: 'green',
+       };
+     }
+     // And so on and so forth
      return {
        result: 'countComponent',
        weight: 1,
        dsComponentName: null,
        debugInfo: '',
        debugColor: 'red',
      };
    },
  })
  .run({
    onError: console.error,
    onComplete: result => {
      console.info(result);
      globalThis.visualizeCoverage({ result, svgRendererAttributeName: 'dsVisualCoverage' });
    },
  });
```

4. Run the Visual Coverage in your pages (I suggest trying out multiple pages, with different contents), and look at the result.
5. Is the Visual Coverage result aligned with the (completely subjective) usage of the Design System in the page? If no, multiply the component's weight

### Splitting the page into containers

In a lot of companies, the pages' ownership is assigned to different teams, and each page could also host components owned by other teams (imagine a page owner by the "martech" team where a payment modal is owned by the "payops" team).

You can assign each page and component's ownership by leveraging the Visual Coverage Containers. What you need to do is

1. Assign a new HTML attribute to the page's container (Preply uses `data-ds-coverage-container`)
2. Store information about the team in the attribute (Preply uses `data-ds-coverage-container='{"team":"martech","component":"home"}'`)
3. Pass some new options to `createCalculateDsVisualCoverages`: namely `coverageContainersDataAttribute` and `getContainerData`. Here is the new code

```diff
globalThis
  .createCalculateDsVisualCoverages({
    log: true,
+   coverageContainersDataAttribute: 'data-ds-coverage-container',
+   getContainerData: ({ component }) => {
+     const coverageContainerValue = component.getAttribute('data-ds-coverage-container')
+
+     if (!coverageContainerValue) {
+       return { result: 'isNotCoverageContainer' }
+     }
+
+     return { result: 'isCoverageContainer', coverageContainer: coverageContainerValue }
+   },
    getComponentData: ({ component }) => {
      const dsComponentsAttribute = component.getAttribute('data-ds-component');

      if (dsComponentsAttribute === 'Button') {
        return {
          result: 'countComponent',
          weight: 18,
          dsComponentName: 'Button',
          debugInfo: 'Button',
          debugColor: 'green',
        };
      }
      if (dsComponentsAttribute === 'Badge') {
        return {
          result: 'countComponent',
          weight: 5,
          dsComponentName: 'Badge',
          debugInfo: 'Badge',
          debugColor: 'green',
        };
      }
      // And so on and so forth
      return {
        result: 'countComponent',
        weight: 1,
        dsComponentName: null,
        debugInfo: '',
        debugColor: 'red',
      };
    },
  })
  .run({
    onError: console.error,
    onComplete: result => {
      console.info(result);
      globalThis.visualizeCoverage({ result, svgRendererAttributeName: 'dsVisualCoverage' });
    },
  });
```

Please note:

1. You can have as many containers you want in a page.
2. When it comes to calculate the Visual Coverage, the inner containers are "removed" (from a calculation perspective) from the parent. It's like the parent has nothing in the area of the inner container.
3. Containers must have a size (extracted through `getBoundingRect`. FYI: `display:"contents";` elements have no size)
4. The containers' children don't leave the containers' boundaries. For example: only the visible items of a scrollable list are counted for the Visual Coverage.
5. `getContainerData` is called for each DOM element in the page, not only for the ones that have the `coverageContainersDataAttribute`.

## Advanced

### How to deal with elements that are no more part of the page

Due to the asynchronous nature of the Visual Coverage library (that never impacts the UX), the page is scanned over multiple idle frames. As a result, it could happen that some DOM elements are removed from the DOM during the initial DOM scan phase.

To deal with this, you can add the following code at the top of `getContainerData`:

```js
// Because of the asynchronous nature of the algorithm, DOM elements can be removed
// while the algorithm is running. The final count could be less precise, but cancelling the
// calculation would mean tracking no events for pages with frequent changes. And given
// the fact that less calculation events will make the page less important in the final
// coverage averages, it's better to have an imprecise result compared to no result at all.
if (!globalThis.document.contains(component))
  return {
    result: 'ignoreComponent',
  };
```

### How to deal with fLoating elements

Please read [`@preply/ds-visual-coverage-core`'s README first](../visual-coverage-core/README.md) to know more about the tradeoffs we adopted to deal with CSS stacking contexts.

When it comes to deal with floating elements (like dialogs, tooltips, etc.) we suggest to set them as containers, otherwise it's hard to visualize them in the pages.

### How to deal with scrolling elements

The same suggestion for floating elements is valid for scrolling ones: make them containers to ensure only the visible part is counted for the Visual Coverage calculation.

### How to ignore invisible elements

At the top of `getContainerData`, you can add:

```js
const computedStyle = globalThis.getComputedStyle(component);
const isInvisible =
  computedStyle.display === 'none' ||
  computedStyle.opacity === '0' ||
  computedStyle.visibility === 'hidden';

if (isInvisible)
  return {
    result: 'ignoreComponent',
  };
```

### How to count the DOM elements generated by DS components

When it comes to count Design System components, marking their top DOM element is not enough. All the DOM elements generates by the DS components must be considered as part of the DS, otherwise they are considered non-DS elements from a Visual Coverage perspective.

Here is an example of how you can deal with this into `getContainerData`, which scans all the parent elements of the current one:

```js
getComponentData: ({ component }) => {
  // ...
  // ... The code that returns the DS component name and weight...
  // ...

  // ... But before considering a DOM element as a non-DS component, we can check if the DOM element has been generated by a DS component!
  let { parentElement } = component;
  while (parentElement) {
    const parentDsComponentName = parentElement.getAttribute('data-ds-component');

    if (parentDsComponentName) {
      return {
        result: 'countComponent',
        weight: 1,
        dsComponentName: 'childOfUiDsComponent',
        debugInfo: '',
        debugColor: 'green',
      };
    }
    parentElement = parentElement.parentElement;
  }

  // Ok, it's definitely not something generated by a DS component
  return {
    result: 'countComponent',
    weight: 1,
    dsComponentName: null,
    debugInfo: '',
    debugColor: 'red',
  };
};
```

### How to implement a slot mechanism

Similarly to the previous example, you could scan all the parents of the scanned DOM element to find specific attributes that mark the opening element of a DS component, and the closing one.

### How to debug the Visual Coverage

Until a devtool is available, we suggest filling up the `debugInfo` property returned by `getComponentData`. It will be added to all the colored SVGd that `visualizeCoverage` adds to the page.

For example, Preply fills it with the opening tag of the received elements.

```js
// Extracts the opening HTML tag to to ease associating the colored debugging rectangles to the original DOM element later on.
let startTagWithAttributes = 'unableToParseTag';
const splitHtml = component.outerHTML.split('>');
if (splitHtml.length > 0) startTagWithAttributes = component.outerHTML.split('>')[0] + '>';
const debugInfo = startTagWithAttributes;
```

<!-- ask justine for a review
also matte, also the PM who got inspired and made it for her company
ask the ones who spoke wwith at the jsday + marco liberati -->
