import MapView from "@arcgis/core/views/MapView";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

export const createMenuItems = (
  view: MapView,
  layer: FeatureLayer,
  chartsObjects: Array<any>
) => {
  // Loop through the chartsObject array
  if (chartsObjects.length > 0) {
    const menuItems = chartsObjects.map((chart) => {
      //
      // Create menu items in header
      //
      const menuItem = document.createElement(
        "calcite-menu-item"
      ) as HTMLCalciteMenuItemElement;
      menuItem.active = false;
      menuItem.text = getChartType(chart).text;
      menuItem.iconStart = getChartType(chart).icon;
      //menuItem.textEnabled = true;
      //`<calcite-menu-item active text="${chart}" icon-start="${chart}" text-enabled></calcite-menu-item>`;

      // Add click event to menu item to toggle chart visibility
      menuItem.onclick = () => {
        const chartContainer = document.getElementById("chart-container");

        // Remove existing chart elements
        if (chartContainer?.firstChild) {
          chartContainer.innerHTML = "";
        }
        const chartElement = createChartElement(view, layer, chart);

        // Add the chart element to the chart container
        chartContainer?.appendChild(chartElement);
      };

      return menuItem;
    });
    return menuItems;
  }

  // Position chart elements in the shell panel
};

const createChartElement = (view: MapView, layer: FeatureLayer, chart: any) => {
  // Create new chart element
  const chartElement = document.createElement(
    getChartType(chart).elementName
  ) as HTMLArcgisChartsBarChartElement | HTMLArcgisChartsPieChartElement;
  chartElement.config = chart;
  chartElement.layer = layer;
  chartElement.view = view;
  chartElement.classList.add("chart-element");

  const chartElementActionBarElement = document.createElement(
    "arcgis-charts-action-bar"
  ) as HTMLArcgisChartsActionBarElement;
  chartElementActionBarElement.slot = "action-bar";
  chartElement.appendChild(chartElementActionBarElement);

  chartElement?.addEventListener("arcgisChartsSelectionComplete", (event) => {
    console.log("arcgisChartsSelectionComplete event fired!");
    const actionClearSelection = document.querySelector(
      "calcite-action#clear-selection"
    ) as HTMLCalciteActionElement;

    if (event.detail.selectionOIDs) {
      const isSelectionApplied = applySelectionToLayer(
        layer,
        event.detail.selectionOIDs
      );
      if (isSelectionApplied) {
        actionClearSelection.indicator = true;
        actionClearSelection.disabled = false;
        actionClearSelection?.addEventListener("click", () => {
          chartElement.clearSelection();
          actionClearSelection.indicator = false;
          actionClearSelection.disabled = true;
        });
      }
    } else {
      applySelectionToLayer(layer, [], true);
      actionClearSelection.indicator = false;
      actionClearSelection.disabled = true;
    }
  });

  // chartElement.view = view;

  return chartElement;
};

const getChartType = (chart: any) => {
  //switch (chart.series.type) {
  switch (chart.series[0].type) {
    case "barSeries":
      return {
        elementName: "arcgis-charts-bar-chart",
        icon: "graph-bar",
        text: "Bar Chart",
      };

    case "pieSeries":
      return {
        elementName: "arcgis-charts-pie-chart",
        icon: "pie-chart",
        text: "Pie Chart",
      };

    default:
      break;
  }
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
