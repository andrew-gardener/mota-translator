# mota-translator

Text Translator Script for https://github.com/ckcz123/mota-js/

This script only translates some game text by overwriting some UI class functions. Some text is directly written using HTML elements and images which are not handled right now. The HTML elements can be translated using a Google Translate extension or something similar. 

## Prerequisites

- Tampermonkey (or user script alternative) installed - https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en 
- Adding this script to Tampermonkey

## Setup a Yandex account and getting an API key

This script uses https://translate.yandex.com to translate the Canvas text (since it is free and pretty decent). You can create an account by:

- Going to https://passport.yandex.com/registration
- Filling in the form (Yandex is a Russian site so I __cannot__ vouch for its trustworthiness. You can just fill in fake info and use a security question instead of giving them your phone number)
- Clicking `Register`

After your account is setup:
- Go to https://translate.yandex.com/developers/keys
- Click `+ Create a new key`
- Click `Create`
- Copy the generated key for later (should be something like `trnsl.1.1.` followed by a bunch or random characters)

## Using the translation script

Find an interesting game from https://h5mota.com/ and open it. 

You should be prompted to enter an API key when you run the script for the first time. Enter the API Key you generated above. That's it, the canvas text should now automatically be translated to English. 

### Change API key

If you made a mistake, you can re-enter the API key by using the `Enter new API Key` button in the Tampermonkey menu (only appears when your in a game).

### Disable/Enable translation

You can disable and re-enable the translation by clicking the `Disable/Enable Canvas Translation` button in the Tampermonkey menu (only appears when your in a game).

### Log translations to console

You can enable and disable printing translation information (original text and translated text) to the console by clicking the `Log Canvas Translation to Console`/`Stop Logging Canvas Translation to Console` button in the Tampermonkey menu (only appears when your in a game).
