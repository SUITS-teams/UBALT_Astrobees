import { ImmersiveApp, ui, PrismType } from 'lumin';
import { scienceSamplingMenuButtons, scienceSamplingSteps } from './../../uiComponents/globalVariables';
import { scienceMenuButton, paginationButton } from './../../uiComponents/ButtonArgos';
import { initHorizontalToolKitView } from './../toolKit/toolKit';

export function initScienceSamplingView (prism, mainPrism) {
  // Build things into view
  // Creating background
  let background = ui.UiImage.Create(prism, 'res/instruction_background.png', 0.445, 0.53);
  background.setLocalPosition([-0.31, -0.01, -1.25]);
  // background.setColor([24, 28, 35, 0.45]);
  // Creating a Linear Layout.
  console.log('I am here now');
  prism.getRootNode().removeChild(mainPrism);
  var instructionsView = ui.UiLinearLayout.Create(prism);
  instructionsView.setOrientation(ui.Orientation.kVertical);
  instructionsView.setName('instructionsView');
  // Create icon linear layout horizontal
  var iconView = ui.UiLinearLayout.Create(prism);
  iconView.setOrientation(ui.Orientation.kHorizontal);
  // iconView.setLocalPosition([-0.2, 0.3, -1]);
  // Add icons to the icon view
  for (var btn in scienceSamplingMenuButtons) {
    var prop = scienceSamplingMenuButtons[btn];
    let button = scienceMenuButton(prism, prop.normalIcon);
    button.setLocalPosition([prop.x, prop.y, prop.z]);
    button.setName(prop.name);
    iconView.addChild(button);

    // Creating the hover state of those icons as well
    let buttonHover = scienceMenuButton(prism, prop.hoverIcon);
    buttonHover.setVisible(false);
    buttonHover.setLocalPosition([prop.x, prop.y, prop.z]);
    buttonHover.setName(prop.hoverName);
    iconView.addChild(buttonHover);
  }
  let instructionsHeader = ui.UiText.CreateEclipseLabel(prism, 'Gather Equipment', ui.EclipseLabelType.kT2);
  instructionsHeader.setName('instructionsHeader');
  instructionsHeader.setLocalPosition([-0.5, 0.06, -1.2]);

  let instructionsBody = ui.UiText.Create(prism, scienceSamplingSteps[1]['description']);
  instructionsBody.setName('description');
  instructionsBody.setLocalPosition([-0.5, -0.17, -1.2]);
  instructionsBody.setTextSize(0.03);

  // Pagination Image
  let pagination = paginationButton(prism, 'res/step_tracker1.png');
  pagination.setLocalPosition([-0.3, -0.22, -1.2]);
  pagination.setName('pagination');
  pagination.setLocalScale([1.85, 0.22, 1]);

  instructionsView.setLocalPosition([-0.2, -0.13, -1.3]);
  instructionsView.addChild(background);
  instructionsView.addChild(iconView);
  instructionsView.addChild(instructionsHeader);
  instructionsView.addChild(instructionsBody);
  instructionsView.addChild(pagination);

  // Add Horizontal list view of tools which is only for step one
  // TODO: Remove this view in other steps
  initHorizontalToolKitView(prism);
  prism.getRootNode().addChild(instructionsView);
}

export function setStep (step, prism) {
  if (step >= 1 && step <= 7) {
    console.log('I am the set step fnx');
    // Find Tool kit elements and make them disappear based on the step
    var toolKitHeader = prism.getRootNode().findChild('toolKitHeader');
    var toolKitView = prism.getRootNode().findChild('toolKitView');
    var toolKitBackground = prism.getRootNode().findChild('toolKitBackground');
    if (step > 1) {
      toolKitBackground.setVisible(false);
      toolKitView.setVisible(false);
      toolKitHeader.setVisible(false);
    } else {
      toolKitBackground.setVisible(true);
      toolKitView.setVisible(true);
      toolKitHeader.setVisible(true);
    }
    var currentStep = scienceSamplingSteps[step];
    // Populate this step with its relevant info
    var header = prism.getRootNode().findChild('instructionsHeader');
    header.setText(currentStep['header']);

    var description = prism.getRootNode().findChild('description');
    description.setText(currentStep['description']);

    // Add new image pagination and remove others
    var currentPagination = prism.getRootNode().findChild('pagination');
    var instructionsView = prism.getRootNode().findChild('instructionsView');
    instructionsView.removeChild(currentPagination);
    // instructionsView.removeChild(description);

    // Create new Pagination and add to prism
    let pagination = paginationButton(prism, currentStep['icon']);
    pagination.setLocalPosition([-0.3, -0.22, -1.2]);
    pagination.setName('pagination');
    pagination.setLocalScale([1.85, 0.22, 1]);
    instructionsView.addChild(pagination);
  }
}
