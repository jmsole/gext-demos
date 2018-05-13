# gext-demos
Glyph extension font axis demos. All these demos and files are currently a work in progress.

[Arabic kashida animation](https://jmsole.github.io/gext-demos/arvar-animation/): This is the first demo we created before the proposal of the gext axis.

[GEXT axis demo with glyph handles](https://jmsole.github.io/gext-demos/gext-handles/): **THIS DEMO WORKS PROPERLY ONLY ON LATEST VERSIONS OF CHROME AND FIREFOX**: For this demo we've implemented a font with GEXT axis. We wanted to show how it could work for people to be able to apply the axis individually on each glyph and not have to rely on sliders. This is also the first step towards a full justification demo.

[Latin display font demo using Bungee](https://jmsole.github.io/gext-demos/bungalow/): **THIS DEMOS HAS BEEN TESTED TO WORK ON CHROME, FIREFOX and SAFARI**: For this demos we modified Bungee by David Jonathan Ross and added a width and GEST axis. Width is controlled by a slider while the GEXT axis is control by individual glyph handles that become more apparent on mouseover. This helps explain some of the aspects that can make the GEXT axis different from a width axis, both conceptually and practically.

[GEXT axis justification demo](https://jmsole.github.io/gext-demos/gext-justification/): **THIS DEMO WORKS PROPERLY ONLY ON LATEST VERSIONS OF FIREFOX WITH VARIABLE FONT SUPPORT ACTIVATED**: For this demo we've implemented full justification using the GEXT axis to allow for long, curved kashidas. As a first demos for this functionallity, we have hardcoded the position of the kashidas. To use, change the width of your browser window and see how the length of the kashidas changes.  
There are handles that allow for manual control of the extension of the kashidas. Once a kashida has been adjusted manually it gets locked into that width and it will not change until you hit the unlock button.  
To be able to have the axis applied to individual glyphs without breaking the word shaping we've duplicated each word with a kashida and made any redundant characters invisible while accounting for their width.  
The justification is using JS code to break lines greedily and then use the GEXT axis and word spacing to adjust to the least bad line setting.  
Finally, you can turn the background colours on and off with the `Background` button. These colours help visualize each section of the text and higlight how it's affected by changing the window width. In `purple` are the parts of the text that are not affected by GEXT or justification. Kashidas have a `red` background. The space character is marked in `green`. Extra whitespace added by the justification code is set in `white`.  
All javascript code was written by Jany Belluz.

---
