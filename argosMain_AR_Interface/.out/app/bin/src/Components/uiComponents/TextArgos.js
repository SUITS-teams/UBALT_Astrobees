import { ui } from 'lumin';

const { UiText, EclipseLabelType, Alignment, HorizontalTextAlignment } = ui;
function hoverText (prism, text) {
  let node = UiText.Create(prism, text);
  node.setTextSize(0.03);
  node.setTextAlignment(ui.HorizontalTextAlignment.kCenter);
  return node;
}

export { hoverText };
