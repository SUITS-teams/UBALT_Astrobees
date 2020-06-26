import { ui } from 'lumin';
import { tools } from '../../uiComponents/globalVariables.js';

function initHorizontalToolKitView (prism) {
  let listView = ui.UiListView.Create(prism);
  listView.setOrientation(ui.Orientation.kHorizontal);
  listView.setLocalPosition([-0.2, 0.28, -2.3]);
  listView.setDefaultItemPadding([0, 0.05, 0, 0.05]);
  listView.setName('toolKitView');
  let background = ui.UiImage.Create(prism, 'res/instruction_background.png', 0.92, 0.9);
  background.setLocalPosition([0.22, 0.05, -2.5]);
  background.setName('toolKitBackground');
  // TODO: Check if width and height changes impact list view rendering
  let header = ui.UiText.CreateEclipseLabel(prism, 'GATHER ROCK SAMPLING EQUIPMENT',
    ui.EclipseLabelType.kT2);
  header.setLocalPosition([-0.16, 0.38, -2.4]);
  header.setName('toolKitHeader');
  // Loop through all the tolls we have and create list view items for each one
  for (var tool in tools) {
    if (tool === 'rake' || tool === 'container') {
      var props = tools[tool];
      // Create a list view item
      let listItem = ui.UiListViewItem.Create(prism);
      // Create linear layount to hold the item's elements like dimensions, etc.
      let linearLayout = ui.UiLinearLayout.Create(prism);
      linearLayout.setOrientation(ui.Orientation.kVertical);
      let title = ui.UiText.Create(prism, props.title);
      title.setTextSize(0.05);
      let location = ui.UiText.Create(prism, props.location);
      location.setTextSize(0.025);
      let dimensions = ui.UiText.Create(prism, props.dimensions);
      dimensions.setTextSize(0.025);
      let use = ui.UiText.Create(prism, props.use);
      use.setTextSize(0.025);

      // Create resource and a model to hold that resource
      let resource = prism.createModelResourceId(props.path, props.scale);
      let model = prism.createModelNode(resource);
      if (tool === 'container') {
        model.setLocalPosition([-0.16, 0.38, -2.5]);
      }
      if (tool === 'rake') {
        model.setLocalPosition([-0.16, 0.38, -1.2]);
      }
      linearLayout.addItem(model);
      linearLayout.addItem(title);
      linearLayout.addItem(location);
      linearLayout.addItem(dimensions);
      linearLayout.addItem(use);
      // Add model to listItem
      listItem.addChild(linearLayout);
      // Add listItem to listView
      // TODO: Consider adding padding to list view items
      listView.addItem(listItem);
    }
  }

  prism.getRootNode().addChild(listView);
  prism.getRootNode().addChild(background);
  prism.getRootNode().addChild(header);
}

export { initHorizontalToolKitView };
