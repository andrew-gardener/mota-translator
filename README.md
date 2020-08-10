# mota-translator

Text Translator Script for https://github.com/ckcz123/mota-js/

This script only translates some game text by overwriting some UI class functions. Some text is directly written using HTML elements and images which are not handled right now. The HTML elements can be translated using a Google Translate extension or something similar. 

## Prerequisites

- Tampermonkey (or user script alternative) installed - https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en 
- Adding this script to Tampermonkey

## Setup IMB Translate Account and getting an API key

This script uses https://cloud.ibm.com/catalog/services/language-translator to translate most game text (it has a free tier and pretty decent/fast). You can create an account by:

- Going to https://cloud.ibm.com/catalog/services/language-translator
- Clicking `Sign up to create`
- Filling in the form with your email & login password
- verify your email (they should email you a short numeric code)
- Fill in personal information
- Click `Ceate account`

After your account is setup:
- Go back to https://cloud.ibm.com/catalog/services/language-translator
- Click `Lite`
- Choose a service location (I used Dallas)
- Click `Create`

You should be on a getting started page
- Click `Service credentials`
- You should see a `Auto-generated service credentials` key, click the copy details button on the side
- Paste this information somewhere safe. It has the API Key and the API Base url
- Copy the generated key for later (should be something like `trnsl.1.1.` followed by a bunch or random characters)

## Using the translation script

- Make sure that the script is enabled in Tampermonkey. 
- Find an interesting game from https://h5mota.com/ and open it. 
- You should be prompted to enter an API key when you run the script for the first time. Enter the API Key you got above.
- The ingame text should be automatically translated (there might a slight delay and visual issues due to the way translations occur dynamically)

Notes/Problems: 
- difficulty level is usually not translated since it hooks into the UI differently
- the text will be messed up sometimes since the traslations are delayed and the game UI functions generally expect to work instantly. 
- if you skip text that is being translated, it sometimes triggers a javascript errors or causes all translated text to disappear causing you to be "stuck". reloading the window and opening the last save will get you almost back were you were. not skipping *new* story text helps avoiding this

### Log translations to console

You can enable and disable printing translation information (original text and translated text) to the console by clicking the `Log Canvas Translation to Console`/`Stop Logging Canvas Translation to Console` button in the Tampermonkey menu (only appears when your in a game).

### Re-enter API Key

You can re-enter the api key by clicking the `Change API Key` button in the Tampermonkey menu (only appears when your in a game).

### Change the API Base Url

You can change the api kbase url by clicking the `Change API Base Url` button in the Tampermonkey menu (only appears when your in a game).

I set the default to `https://api.us-south.language-translator.watson.cloud.ibm.com/instances/53857e8f-a931-4c00-8257-a17a4a5e9e17` (Dallas)
