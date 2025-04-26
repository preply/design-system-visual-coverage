# `@preply/ds-visual-coverage-core`

All the DS visual coverage utilities the platform-specific packages share.

Also, it includes the simplest implementation of the `countPixels` function, the core of the DS visual coverage, that transforms the log containing the UI tree data into a bitmap.

See [@preply/ds-visual-coverage-web](../../packages/visual-coverage-web/README.md) and [@preply/ds-visual-coverage-rn](../../packages/visual-coverage-rn/README.md) for platform-specific tools.

**tl;dr:**

Provide all the utils to count the Design System visual coverage.

As a reminder, the general idea is to

1. Collect DOM elements coordinates and size (not part of this package).
2. Convert the coordinates and size into a virtual representation of the DOM tree, and count the DS component pixels with a bitmap (see `countPixels`).
3. Count the pixels and calculate a coverage % (not part of this package).
4. All the above can be done "per page" or the page can be split into different coverage containers (think of micro frontends where the same page can contain areas that belong to different teams).

## Fictional but visual example

A page made up of the following elements:

1. A non-DS header
2. A non-DS container that contains
   1. A DS heading
   2. Two DS buttons
3. A DS box

Could be represented by the following list of children data

```json
[
  {
    "rect": [
      0, // <-- top
      0, // <-- left
      20, // <-- width
      16 // <-- height
    ],
    "dsComponentName": null,
    "weight": 1 // <-- component weight, used for the border size in the bitmap
  }
  [
  { "rect": [0, 0, 20, 3], "dsComponentName": "Heading", "weight": 1 },
  { "rect": [8, 0, 20, 4], "dsComponentName": "Text", "weight": 1 },
  { "rect": [16, 3, 8, 4], "dsComponentName": "null", "weight": 1 }
  { "rect": [16, 12, 8, 4], "dsComponentName": "Button", "weight": 2, "weight": 1 },
]
]
```

is transformed by `countPixels` to a bitmap like the following

```js
[
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  -,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,
  0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,
  0,-,1,-,-,-,-,-,-,-,-,-,-,-,-,-,-,1,-,0,
  0,-,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,-,0,
  0,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,0,
  0,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,0,
  0,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,0,
  0,-,-,-,-,-,-,2,2,2,2,2,-,2,2,2,2,2,-,0,
  0,-,-,-,-,-,-,2,-,-,-,2,-,2,-,-,-,2,-,0,
  0,-,-,-,-,-,-,2,2,2,2,2,-,2,2,2,2,2,-,0,
  0,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
  3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
  3,3,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,3,3,
  3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
  3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
  1,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,1,
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
  0,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,0,
  2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,
  2,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,2,
  2,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,2,
  2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,
  0,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,0,
  0,-,-,-,0,0,0,0,0,0,0,-,3,3,3,3,3,3,3,3,
  0,-,-,-,0,-,-,-,-,-,0,-,3,3,3,3,3,3,3,3,
  0,-,-,-,0,-,-,-,-,-,0,-,3,3,-,-,-,-,3,3,
  0,-,-,-,0,-,-,-,-,-,0,-,3,3,3,3,3,3,3,3,
  0,-,-,-,0,0,0,0,0,0,0,-,3,3,3,3,3,3,3,3,
  0,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
]
```

which, for the sake of understanding it, can be visualized this way

```
🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩
🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩
🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩
🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
🟥⬛️⬛️⬛️🟥🟥🟥🟥🟥🟥🟥⬛️🟩🟩🟩🟩🟩🟩🟩🟩
🟥⬛️⬛️⬛️🟥⬛️⬛️⬛️⬛️⬛️🟥⬛️🟩🟩🟩🟩🟩🟩🟩🟩
🟥⬛️⬛️⬛️🟥⬛️⬛️⬛️⬛️⬛️🟥⬛️🟩🟩⬛️⬛️⬛️⬛️🟩🟩
🟥⬛️⬛️⬛️🟥⬛️⬛️⬛️⬛️⬛️🟥⬛️🟩🟩🟩🟩🟩🟩🟩🟩
🟥⬛️⬛️⬛️🟥🟥🟥🟥🟥🟥🟥⬛️🟩🟩🟩🟩🟩🟩🟩🟩
🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
```

## CSS Stacking contexts

The Visual Coverage algorithm cares of the DOM elements' overlapping when converting the DOM structure to a bitmap, but replicating the CSS stacking context is hard. When implementing the Visual Coverage perspective, we chose a tradeoffs: from a Visual Coverage perspective, the subsequent DOM elements are closer to the user.

We explain in the platform-specific libraries, how to deal with floating elements (like dialogs).
