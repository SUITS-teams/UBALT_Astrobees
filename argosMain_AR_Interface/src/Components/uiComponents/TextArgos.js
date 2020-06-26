import { ui } from 'lumin';
const { UiText, EclipseLabelType, Alignment, HorizontalTextAlignment } = ui;
export function genericText (prism) {
  let node = UiText.CreateEclipseLabel(
    prism,
    'Hello\nMagicScript!',
    EclipseLabelType.kT7
  );
  node.setAlignment(Alignment.CENTER_CENTER);
  node.setTextAlignment(HorizontalTextAlignment.kCenter);
  return node;
}
export function hoverText (prism, text) {
  let node = UiText.Create(prism, text);
  node.setTextSize(0.03);
  node.setTextAlignment(ui.HorizontalTextAlignment.kCenter);
  return node;
}
