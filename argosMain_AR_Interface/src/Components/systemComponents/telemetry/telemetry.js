import { ImmersiveApp, ui, PrismType } from 'lumin';
import { sampleTelemetryStream } from './../../uiComponents/globalVariables';
export function initTelemetry (prism, telemetry) {
  // Create background image
  let background = ui.UiImage.Create(prism, 'res/instruction_background.png', 0.445, 0.33);
  background.setLocalPosition([-0.5, 0.33, -2.5]);
  prism.getRootNode().addChild(background);
  // Create 2 pages to display telemetry
  for (var i = 1; i <= 2; i++) {
    let pageName = 'page' + i.toString();
    var page = ui.UiLinearLayout.Create(prism);
    page.setOrientation(ui.Orientation.kVertical);
    page.setDefaultItemPadding([0.005, 0, 0.005, 0]);
    page.setName(pageName);
    page.setLocalPosition([-0.7, 0.47, -2.48]);
    prism.getRootNode().addChild(page);
  }
  // Load Page 1 telemetry data rank 1 - 5
  for (var j = 1; j <= 5; j++) {
    // Load individual telemetry data points
    var page1 = prism.getRootNode().findChild('page1');
    var props = sampleTelemetryStream[j];
    // Create a horizontal layout to add icons and value for this telemetry point
    let singleTelemetryView = ui.UiLinearLayout.Create(prism);
    singleTelemetryView.setOrientation(ui.Orientation.kHorizontal);
    singleTelemetryView.setDefaultItemPadding([0, 0.01, 0, 0.01]);

    if (props.hasIcon) {
      // Load icon based telemetry
      let icon = ui.UiImage.Create(prism, props.icon, 0.05, 0.05);
      singleTelemetryView.addItem(icon);
    } else {
      // Load title based telemetry
      let title = ui.UiText.Create(prism, props.title);
      title.setTextSize(0.04);
      singleTelemetryView.addItem(title);
    }

    if (props.hasSlider) {
      // Load progress bar based telemetry
      let progressBar = ui.UiProgressBar.Create(prism, 0.2, 0.025);
      progressBar.setMin(0);
      progressBar.setMax(100);
      progressBar.setValue(80);
      progressBar.setProgressColor([255, 0, 0, 1], [0, 129, 0, 1]);
      singleTelemetryView.addItem(progressBar);
    } else {
      // Load text value based telemetry
      let value = ui.UiText.Create(prism, props.value);
      value.setTextSize(0.04);
      singleTelemetryView.addItem(value);
      value.setTextColor([255, 0, 0, 1]);
    }
    page1.addItem(singleTelemetryView);
  }
}
