import "@arcgis/core/assets/esri/themes/dark/main.css";
import "./style.css";

import { defineCustomElements as defineMapElements } from "@arcgis/map-components/dist/loader";
import { defineCustomElements as defineCalciteElements } from "@esri/calcite-components/dist/loader";
import { defineCustomElements as defineChartsElements } from "@arcgis/charts-components/dist/loader";

/**
 * Define and lazy load the component package using the CDN hosted assets
 */
defineMapElements(window, {
  resourcesUrl: "https://js.arcgis.com/map-components/4.29/assets",
});

defineCalciteElements(window, {
  resourcesUrl: "https://js.arcgis.com/calcite-components/2.7.1/assets",
});

// define custom elements in the browser, and load the assets from the CDN
defineChartsElements(window, {
  resourcesUrl: "https://js.arcgis.com/charts-components/4.29/t9n",
});

/**
 * Add interaction with Calcite Actions
 */
const shellPanel = document.getElementById(
  "shell-panel-start"
) as HTMLCalciteShellPanelElement;
const actions = shellPanel?.querySelectorAll("calcite-action");
actions?.forEach((el) => {
  el.addEventListener("click", () => {
    shellPanel.collapsed = !shellPanel.collapsed;
  });
});

document
  .querySelector("arcgis-map")
  ?.addEventListener("arcgisViewReadyChange", async (event) => {
    console.log("arcgisViewReadyChange event fired!");

    /**
     * Get a reference to the `WebMap`
     * from the `event.detail` object.
     */
    const { map, view } = event.target;
    await map.load();
    await view.when();
    const featureLayer = map.layers.find((layer) => {
      return layer.title === "Energielabels Pand";
    }) as __esri.FeatureLayer;
    loadPieChart(view, featureLayer);
    loadBarChart(view, featureLayer);
  });

const loadPieChart = (view: __esri.MapView, layer: __esri.FeatureLayer) => {
  const pieChartElement = document.querySelector(
    "arcgis-charts-pie-chart"
  ) as HTMLArcgisChartsPieChartElement;
  pieChartElement.config = layer.charts[0];
  pieChartElement.layer = layer;
  pieChartElement.view = view;
};

const loadBarChart = (view: __esri.MapView, layer: __esri.FeatureLayer) => {
  const pieChartElement = document.querySelector(
    "arcgis-charts-bar-chart"
  ) as HTMLArcgisChartsBarChartElement;
  pieChartElement.config = layer.charts[1];
  pieChartElement.layer = layer;
  pieChartElement.view = view;

  pieChartElement?.addEventListener(
    "arcgisChartsSelectionComplete",
    (event) => {
      console.log("arcgisChartsSelectionComplete event fired!");

      if (event.detail.selectionOIDs) {
        applySelectionToLayer(layer, event.detail.selectionOIDs);
      } else {
        applySelectionToLayer(layer, [], true);
      }
    }
  );
};

const applySelectionToLayer = (
  featureLayer: __esri.FeatureLayer,
  selectedOids: Array<number>,
  reset: boolean = false
): boolean => {
  if (selectedOids.length === 0 || reset) {
    featureLayer.definitionExpression = "1=1";
    return false;
  }
  featureLayer.definitionExpression = `OBJECTID in (${selectedOids.join(",")})`;
  return true;
};
