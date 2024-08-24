# `@preply/ds-visual-coverage-core`

> Generic utils useful to count the Design System visual coverage.

See [@preply/ds-visual-coverage-web](../../packages/visual-coverage-web/README.md) and [@preply/ds-visual-coverage-rn](../../packages/visual-coverage-rn/README.md) for platform-specific tools.

**tl;dr:**

Provide all the utils to count the Design System visual coverage.

As a reminder, the general idea is to

1. Collect components coordinates and size
2. Convert the coordinates and size into a virtual representation of the UI tree
3. Count the pixels and calculate a coverage %

To visualize it: think of a page like the following, where we highlight outline the components (green = DS components, red = non-DS components)

```
🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️
🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
🟥⬛️🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩⬛️🟥
🟥⬛️🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️🟥
🟥⬛️🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩⬛️🟥
🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️⬛️⬛️🟩⬛️🟩⬛️⬛️⬛️🟩⬛️🟥
🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩
🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩
🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩
🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
```

the visual coverage utils convert them to an array like

```js
[
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  -,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,0,
  0,-,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,-,0,
  0,-,1,-,-,-,-,-,-,-,-,-,-,-,-,-,-,1,-,0,
  0,-,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,-,0,
  0,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,0,
  0,-,-,-,-,-,-,1,1,1,1,1,-,1,1,1,1,1,-,0,
  0,-,-,-,-,-,-,1,-,-,-,1,-,1,-,-,-,1,-,0,
  0,-,-,-,-,-,-,1,1,1,1,1,-,1,1,1,1,1,-,0,
  0,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
  1,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,1,
  1,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,1,
  1,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,1,
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
]
```

and then counts the coverage %.

## Development

You probably want to execute `yarn dev` in the root, as per instructions in [@preply/ds-workspace](../../README.md).

For quicker - and more focused - feedback, you can also directly use the scripts in this package directory, but make sure you have first executed `yarn build` in root, or that you have the root `yarn dev` script running in the background.

## Learning

Install [CodeTour](https://marketplace.visualstudio.com/items?itemName=vsls-contrib.codetour) and follow the platform-specific "visual coverage walkthrough" CodeTours.
