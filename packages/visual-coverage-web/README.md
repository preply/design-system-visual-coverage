# `@preply/ds-visual-coverage-web`

> Web utils useful to count the Design System visual coverage.

Depends only on [@preply/ds-visual-coverage-core](../../packages/visual-coverage-core/README.md).

**tl;dr:**

As a prerequisite, the web app must already have set the coverage container HTML attribute somewhere in tha page. Ideally, the HTML attributes are set to the top container, and eventually also for the components that belong to different teams.

For instance:

```tsx
const App: FC = () => {
  return (
    <div {...getCoverageContainerAttributes({ component: 'App', team: 'design_system' })}>
      {/* ... */}
    </div>
  );
};
```

this is

Then, to create and start a new visual coverage process

```js
calculateDsVisualCoveragesProcess = createCalculateDsVisualCoverages({
  log: false,
  printAsciiArt: false,
  drawAndAppendSvg: false,
  userType: params.userType,
});

calculateDsVisualCoveragesProcess.run({
  onError: console.error,
  onComplete: console.log,
});
```

## Development

You probably want to execute `yarn dev` in the root, as per instructions in [@preply/ds-workspace](../../README.md).

For quicker - and more focused - feedback, you can also directly use the scripts in this package directory, but make sure you have first executed `yarn build` in root, or that you have the root `yarn dev` script running in the background.

## Learning

Install [CodeTour](https://marketplace.visualstudio.com/items?itemName=vsls-contrib.codetour) and follow the "Web visual coverage walkthrough" CodeTour.
