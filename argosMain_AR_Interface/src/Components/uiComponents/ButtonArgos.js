import { ui } from 'lumin';
const { UiButton } = ui;
const { UiText, EclipseButtonType, Alignment, HorizontalTextAlignment } = ui;
var counter = 0;
function onPress (node, text) {
  console.log('onPress triggered!');
  counter++;
  node.setText('Press again');
  text.setText('Pressed ' + counter + ' time(s)');
}
export function genericButton (prism, text) {
  let node = UiButton.Create(prism, 'Press me', 0, 0.1, 1);
  console.log('makeButton');
  node.onActivateSub(function (uiEventData) {
    onPress(node, text);
  });
  return node;
}
// Creating a template for the mainMenu Button. Can be referenced from anywhere.
export function menuButton (prism, path) {
  // Arguments we need to parse: icon path, prism it should be rendered in.
  var params = new ui.EclipseButtonParams(EclipseButtonType.kIcon);
  params.absoluteIconPath = true;
  params.type = EclipseButtonType.kIcon;
  params.iconPath = path;
  // params.iconType = ui.SystemIcon.kHome;
  params.height = 0.3;
  let node = UiButton.CreateEclipseButton(prism, params);
  return node;
}
export function scienceMenuButton (prism, path) {
  // Arguments we need to parse: icon path, prism it should be rendered in.
  var params = new ui.EclipseButtonParams(EclipseButtonType.kIcon);
  params.absoluteIconPath = true;
  params.type = EclipseButtonType.kIcon;
  params.iconPath = path;
  // params.iconType = ui.SystemIcon.kHome;
  params.height = 0.15;
  let node = UiButton.CreateEclipseButton(prism, params);
  return node;
}
export function paginationButton (prism, path) {
  // Arguments we need to parse: icon path, prism it should be rendered in.
  let node = ui.UiImage.Create(prism, path, 0.2, 0.2);

  // params.iconType = ui.SystemIcon.kHome;
  // params.height = 0.2;
  return node;
}
