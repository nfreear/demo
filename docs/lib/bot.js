/**
 * @STATUS Not working !
 *
 * A Mock-bot with speech.
 *
 * @see https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/03.speech/b.cognitive-speech-services-js
 * @author NDF, 27-May-2021.
 */

import { getFilterDataFromUrl, param } from './data-from-url.js';

const WebChat = window.WebChat;

// Create a function to fetch the Cognitive Services Speech Services credentials.
// The async function created will hold expiration information about the token and will return cached token when possible.
function createFetchSpeechServicesCredentials() {
  let expireAfter = 0;
  let lastPromise;

  return () => {
    const now = Date.now();

    // Fetch a new token if the existing one is expiring.
    // The following article mentioned the token is only valid for 10 minutes.
    // We will invalidate the token after 5 minutes.
    // https://docs.microsoft.com/en-us/azure/cognitive-services/authentication#authenticate-with-an-authentication-token
    if (now > expireAfter) {
      expireAfter = now + 300000;
      lastPromise = fetch('https://webchat-mockbot.azurewebsites.net/speechservices/token', {
        method: 'POST', mode: 'no-cors'
      }).then(
        res => res.json(),
        err => {
          expireAfter = 0;

          return Promise.reject(err);
        }
      );
    }

    return lastPromise;
  };
}

const fetchSpeechServicesCredentials = createFetchSpeechServicesCredentials();

(async function () {
  const DATA = getFilterDataFromUrl();

  // In this demo, we are using Direct Line token from MockBot.
  // Your client code must provide either a secret or a token to talk to your bot.
  // Tokens are more secure. To learn about the differences between secrets and tokens.
  // and to understand the risks associated with using secrets, visit https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication?view=azure-bot-service-4.0

  const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST', mode: 'no-cors' });
  const { token } = await res.json();

  // Create the ponyfill factory function, which can be called to create a concrete implementation of the ponyfill.
  const webSpeechPonyfillFactory = await WebChat.createCognitiveServicesSpeechServicesPonyfillFactory({
    // We are passing the Promise function to the "credentials" field.
    // This function will be called every time the token is being used.
    credentials: fetchSpeechServicesCredentials
  });

  // Pass a Web Speech ponyfill factory to renderWebChat.
  // You can also use your own speech engine given it is compliant to W3C Web Speech API: https://w3c.github.io/speech-api/.
  // For implementor, look at createBrowserWebSpeechPonyfill.js for details.
  WebChat.renderWebChat(
    {
      directLine: WebChat.createDirectLine({ token }),
      webSpeechPonyfillFactory
      ,
      userID: DATA.userID, // param(/userID=([^&]+)/i, 'webchat-mockbot@r1nD2m'),
      username: DATA.username,
      locale: DATA.locale,

      styleOptions: {
        botAvatarInitials: 'Bot',
        userAvatarInitials: 'You'
      }
    },
    document.getElementById('webchat')
  );

  document.querySelector('#webchat > *').focus();

  console.warn('Mock-Bot:', DATA, WebChat);
})()
.catch(err => console.error(err));
