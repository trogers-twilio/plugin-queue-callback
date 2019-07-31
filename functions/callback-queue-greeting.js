exports.handler = function(context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();
  const baseUrl = `https://${context.DOMAIN_NAME}`;

  const say = twiml.say({ voice: 'Polly.Salli' });
  if (event.skipGreeting !== 'true') {
    say.addText('Please wait for the next available agent. ');
  }

  const callbackThreshold = 300;
  // TODO: Get call cache from Sync Map
  // TODO: Get queue wait time from TaskRouter
  const maxWaitTime = 330;
  const avgWaitTime = 310;

  if (maxWaitTime > callbackThreshold
    || avgWaitTime > callbackThreshold
  ) {
    say.addText("If you'd like to receive a callback instead ");
    say.addText('of holding, press 1 at anytime');
    const gather = twiml.gather({
      action: `${baseUrl}/callback-confirm-selection`,
      numDigits: '1',
    });
    gather.play('http://demo.twilio.com/docs/classic.mp3');
  } else {
    twiml.play('http://demo.twilio.com/docs/classic.mp3');
  }
  twiml.redirect(`${baseUrl}/callback-queue-greeting?skipGreeting=true`);

  callback(null, twiml);
};
