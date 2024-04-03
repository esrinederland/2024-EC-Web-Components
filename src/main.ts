import { defineCustomElements as defineMapElements } from "@arcgis/map-components/dist/loader";
import { defineCustomElements as defineChartsElements } from "@arcgis/charts-components/dist/loader";

import { defineCustomElements } from "@esri/calcite-components/dist/loader";
import { setAssetPath } from "@esri/calcite-components/dist/components";

import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import FeatureLayerView from "@arcgis/core/views/layers/FeatureLayerView";
import Sketch from "@arcgis/core/widgets/Sketch";

import "@arcgis/core/assets/esri/themes/light/main.css";
import "@esri/calcite-components/dist/calcite/calcite.css";
import "./style.css";
import { createMenuItems } from "./createCharts";

// CDN hosted assets
setAssetPath("https://js.arcgis.com/calcite-components/2.6.0/assets");

// define custom elements in the browser, and load the assets from the CDN
defineChartsElements(window, {
  resourcesUrl: "https://js.arcgis.com/charts-components/4.29/t9n",
});

/**
 * Define and lazy load the component package.
 */
defineMapElements();
defineCustomElements(window, {
  resourcesUrl: "https://js.arcgis.com/calcite-components/2.6.0/assets",
});
/**
 * Use `document.querySelector()` to get a reference to the `arcgis-map` component.
 * Add an event listener for the `arcgis-map` component's `viewReadyChange` event.
 */

let chartRef: any = {};
let charts: Array<
  HTMLArcgisChartsBarChartElement | HTMLArcgisChartsPieChartElement
> = [];
const graphicsLayer = new GraphicsLayer();
let currentSelectedOids = [];

document
  .querySelector("arcgis-map")
  .addEventListener("arcgisViewReadyChange", async (event) => {
    console.log("arcgisViewReadyChange event fired!");

    /**
     * Get a reference to the `WebMap`
     * from the `event.detail` object.
     */
    const { map, view } = event.target;
    await map.load();
    await view.when();
    /**
     * Getting the feature layer holding the chart specification
     */
    const featureLayer = map.layers.items.find(
      (layer) => layer.title === "Rijksmonumenten"
    );
    view.whenLayerView(featureLayer).then((layerView) => {
      view.watch("updating", async (isLoading) => {
        if (!isLoading) {
          const query = (layerView as FeatureLayerView).createQuery();
          query.where = "1=1";
          query.geometry = view.extent;
          const resultQuery = await (
            layerView as FeatureLayerView
          ).queryFeatures(query);
          console.log("Features in view:", resultQuery.features.length);
          (
            document.getElementById(
              "calcite-panel-footer"
            ) as HTMLCalcitePanelElement
          ).heading = `Features in view: ${resultQuery.features.length}`;
        }
      });
    });

    charts = featureLayer.charts;
    /**
     * Create menu items in header that will toggle the charts visibility
     */
    const menuItems = createMenuItems(view, featureLayer, charts);
    document
      .querySelector("calcite-menu#menu-navigation-primary")
      ?.appendChild(menuItems[0]);
    document
      .querySelector("calcite-menu#menu-navigation-primary")
      ?.appendChild(menuItems[1]);

    /**
     * Adding the selection functionality
     */
    const sketchWidget = new Sketch({
      availableCreateTools: [],
      layer: graphicsLayer,
      view: view,
    });
    view.ui.add(sketchWidget, "top-right");
    //const sketchComponent = document.querySelector("arcgis-sketch");

    // if (sketchComponent) {
    //   //sketchComponent.availableCreateTools = [];
    //   sketchComponent.visibleElementsSettingsMenu = false;
    //   sketchComponent.visibleElementsUndoRedoMenu = false;
    //   sketchComponent.layer = graphicsLayer;
    //   sketchComponent?.addEventListener("sketchCreate", (event) => {
    //     console.log("sketchCreate event fired!", event);
    //   });
    // }

    /**
     * Setting up the Bar Chart
     */
    // chartRef = document.querySelector("arcgis-charts-bar-chart");
    // if (chartRef) {
    //   chartRef.config = featureLayer.charts[0];

    //   chartRef.layer = featureLayer;
    //   chartRef.view = view;
    //   chartRef?.addEventListener("arcgisChartsSelectionComplete", (event) => {
    //     console.log("arcgisChartsSelectionComplete event fired!");
    //     const actionClearSelection = document.querySelector(
    //       "calcite-action#clear-selection"
    //     ) as HTMLCalciteActionElement;

    //     if (event.detail.selectionOIDs) {
    //       const isSelectionApplied = applySelectionToLayer(
    //         featureLayer,
    //         event.detail.selectionOIDs
    //       );
    //       if (isSelectionApplied) {
    //         actionClearSelection.indicator = true;
    //         actionClearSelection.disabled = false;
    //         actionClearSelection?.addEventListener("click", () => {
    //           chartRef.clearSelection();
    //           actionClearSelection.indicator = !actionClearSelection.indicator;
    //           actionClearSelection.disabled = !actionClearSelection.disabled;
    //         });
    //       }
    //     } else {
    //       applySelectionToLayer(featureLayer, [], true);
    //     }
    //   });
    // }

    // const mapElement = document.querySelector("arcgis-map");

    // mapElement?.addEventListener("arcgisViewChange", (event) => {
    //   // event.target provides a reference to the object that dispatched the event
    //   // event.target is used here since the event type is CustomEvent<void>
    //   // void means that there are no details to show
    //   const { zoom } = event.target;
    //   console.log("arcgisViewChange event fired!");
    //   console.log(`The zoom is ${zoom}`);
    // });

    // Add more functionality here.
  });
