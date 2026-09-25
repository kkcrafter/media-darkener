// Bookmark URLs lose newlines, so invert() must not contain // comments.
// Transparent pixels are flattened onto white first, so transparent PNGs with dark text count as background.
// Invert only bright areas (slide background), dilated so thin dark text inside is covered too.
// Large dark areas (a person) stay original. Background = bright AND not warm: luma - 3*max(R-B,0), so skin highlights are skipped.
// Only warm is penalised: compressed white text on blue picks up a blue tint and must still count.
// No erode to drop bright specks: it breaks letter counters in bold text.
// ponytail: fixed threshold 0.8-0.9, penalty 3, radius 3px; tune if text or faces misbehave.
// No innerHTML: sites with Trusted Types (YouTube) block it, so build nodes with DOM calls.
function invert() {
  const s = document.getElementById('__inv');
  if (s) return s.remove();
  const el = (tag, attrs, ...kids) => {
    const n = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    n.append(...kids);
    return n;
  };
  const neg = c => el('feFunc' + c, {type: 'table', tableValues: '1 0'});
  const style = document.createElement('style');
  style.textContent = 'img,video,iframe,[style*=background-image]{filter:url(#__bg)!important}';
  const svg = el('svg', {width: 0, height: 0, style: 'position:absolute'},
    el('filter', {id: '__bg', x: 0, y: 0, width: 1, height: 1, 'color-interpolation-filters': 'sRGB'},
      el('feFlood', {'flood-color': '#fff'}),
      el('feComposite', {in: 'SourceGraphic', operator: 'over', result: 'src'}),
      el('feComponentTransfer', {in: 'src', result: 'inv'}, neg('R'), neg('G'), neg('B')),
      el('feColorMatrix', {in: 'inv', type: 'hueRotate', values: 180, result: 'inv'}),
      el('feColorMatrix', {in: 'src', values: '1 0 -1 0 0 0 0 0 0 0 .2126 .7152 .0722 0 0 0 0 0 0 1'}),
      el('feColorMatrix', {values: '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -3 0 1 0 0'}),
      el('feComponentTransfer', {}, el('feFuncA', {type: 'linear', slope: 10, intercept: -8})),
      el('feMorphology', {operator: 'dilate', radius: 3, result: 'mask'}),
      el('feComposite', {in: 'inv', in2: 'mask', operator: 'in'}),
      el('feComposite', {in2: 'src', operator: 'over'})));
  const e = document.createElement('div');
  e.id = '__inv';
  e.append(style, svg);
  document.body.append(e);
}
