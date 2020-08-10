# mota-translator

Text Translator Script for https://github.com/ckcz123/mota-js/

This script only translates some game text by overwriting some UI class functions. Some text is directly written using HTML elements and images which are not handled right now. The HTML elements can be translated using a Google Translate extension or something similar. 

## Prerequisites

- Tampermonkey (or user script alternative) installed - https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en 
- Adding this script to Tampermonkey

## Using the translation script

- Make sure that the script is enabled in Tampermonkey. 
- Find an interesting game from https://h5mota.com/ and open it. 
- The ingame text should be automatically translated (there might a slight delay)

Notes/Problems: 
- difficulty level is usually not translated since it hooks into the UI differently
- the text will be messed up sometimes since the traslations are asynchronous (delayed) and the UI functions generally work synchronously. 
- the first monster in the monster book is usually hard/impossible to read because the font color gets messed up due to the delay
- if you skip text that is being translated, it sometimes triggers a javascript error causing you to be "stuck". reloading the window and opening the last save will get you almost back were you were.

### Log translations to console

You can enable and disable printing translation information (original text and translated text) to the console by clicking the `Log Canvas Translation to Console`/`Stop Logging Canvas Translation to Console` button in the Tampermonkey menu (only appears when your in a game).
