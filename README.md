# media-darkener

Dark mode stops at text. You turn it on, the page goes dark, and then:

- A lecture video fills the screen with a blinding white slide.
- A diagram with a transparent background shows black text on a black page, so you can't read it.
- Tools like Dark Reader only offer a whole-page invert, which turns every photo and every face into a negative.

Turning dark mode off isn't a fix either, because then the whole page goes white.

**media-darkener is one bookmark you click to fix this.** Click it on any page and bright image and video backgrounds turn dark, and the text on them turns light. People, faces and photos keep their real colours. Click again to switch it off.

## Install

1. Open `index.html` in your browser.
2. Drag the **Media Darkener** link to your bookmarks bar.

It works in Chrome, Brave and other Chromium browsers, including on sites with strict security policies such as YouTube.

## How it works

An SVG filter applied to `img`, `video`, `iframe` and background-image elements:

1. Flatten transparency onto white, so dark text on transparent PNGs counts as foreground.
2. Mask pixels that are bright and not warm (`luma - 3 * max(R - B, 0)` above ~0.85), so skin highlights are skipped.
3. Dilate the mask by 3px so thin text inside the background is covered too.
4. Invert (plus 180° hue rotate to keep colours) only inside the mask.

Tuning knobs live in `invert()` in `index.html`: threshold (`slope`/`intercept`), warm penalty (`-3`), dilate `radius`.

## Limits

- Large bright text inside photos turns dark with a light outline.
- Warm light backgrounds (cream slides) are not inverted.
- Elements added after clicking are covered; iframes are filtered as a whole.
