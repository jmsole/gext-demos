# gext-demos
Glyph extension font axis demos. All these demos and files are currently a work in progress.

[Arabic kashida animation](https://jmsole.github.io/gext-demos/arvar-animation/): This is the first demo we created before the proposal of the GEXT axis.

[GEXT axis demo with glyph handles](https://jmsole.github.io/gext-demos/gext-handles/): **THIS DEMO WORKS PROPERLY ONLY ON THE LATEST VERSIONS OF CHROME AND FIREFOX**: For this demo we have implemented a font with the GEXT axis. It shows how the axis can be used individually on each glyph without having to rely on sliders. This is also the first step towards a full justification demo.

[Latin display font demo using Bungee](https://jmsole.github.io/gext-demos/bungalow/): **THIS DEMO HAS BEEN TESTED TO WORK ON CHROME, FIREFOX and SAFARI**: For this demo we modified Bungee by David Jonathan Ross and added a width and GEXT axis. The width is controlled by a slider while the GEXT axis is control by individual glyph handles that become more apparent on mouseover. This helps explain some of the aspects that can make the GEXT axis different from a width axis, both conceptually and practically.

[GEXT axis justification demo](https://jmsole.github.io/gext-demos/gext-justification/): **THIS DEMO WORKS PROPERLY ONLY ON THE LATEST VERSIONS OF FIREFOX WITH VARIABLE FONT SUPPORT ACTIVATED**: For this demo we have implemented full justification using the GEXT axis to allow for long, curved kashidas. As a first demo for this functionality, we have hardcoded the position of the kashidas. To use, change the width of your browser window and see how the length of the kashidas change.

There are handles that allow for manual control of the extension of the kashidas. Once a kashida has been adjusted manually, it gets locked into that width and it will not change until you hit the unlock button. To apply the axis to individual glyphs without breaking the word shaping, we've duplicated each word with a kashida and made any redundant characters invisible while accounting for their width. The justification is using JavaScript code to break lines greedily and then use the GEXT axis and word spacing to adjust to the least bad line setting.

Finally, you can turn the background colours on and off with the `Background` button. These colours help visualize each section of the text and higlight how it's affected by changing the window width. In `purple` are parts of the text that are not affected by GEXT or justification. Kashidas have a `red` background. The space character is marked in `green`. Extra whitespace added by the justification code is set in `white`.

All JavaScript code was written by Jany Belluz.

---
