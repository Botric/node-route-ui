# node-route-ui

A small JavaScript route timeline.

It shows a list of linked locations with a start marker, end marker and connecting line.

## Demo

Open this file directly:

```txt
demo/node-route-ui-demo.html
```

The demo has all CSS and JavaScript built into the page, so it works by double-clicking the HTML file.

## Install

```bash
npm install node-route-ui
```

## Basic use

```html
<link rel="stylesheet" href="./node_modules/node-route-ui/src/style.css">

<div id="route"></div>

<script type="module">
  import NodeRouteUI from "./node_modules/node-route-ui/src/index.js";

  const route = new NodeRouteUI({
    target: "#route",
    startColor: "#00c853",
    endColor: "#d50000",
    cardGap: 18
  });

  route.addBlank();
</script>
```

## Options

```js
const route = new NodeRouteUI({
  target: "#route",
  startColor: "#00c853",
  endColor: "#d50000",
  middleColor: "#ffffff",
  lineColor: "#000000",
  cardBackground: "#f7f7f7",
  cardBorderColor: "#222222",
  cardGap: 18,
  width: "850px",
  editable: true,
  removable: true,
  sortable: true,
  emptyText: "No locations added yet"
});
```

## Useful methods

```js
route.addBlank();
route.addItem({ house: "Station Approach", street: "Manchester", postcode: "M1 1AA", order: "1" });
route.removeItem(0);
route.moveItem(0, 2);
route.clear();
route.getItems();
```
