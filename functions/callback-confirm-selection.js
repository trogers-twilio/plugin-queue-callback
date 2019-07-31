exports.handler = function(context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();
  const baseUrl = `https://${context.DOMAIN_NAME}`;
  const sayOptions = { voice: 'Polly.Salli' };
  const { Digits } = event;

  if (Digits === '1') {
    let message = 'You have requested a callback from the next'
    + 'available agent. If this is correct, press 1. Otherwise, '
    + 'remain on the line to continue holding.';
    const gather = twiml.gather({
      action: `${baseUrl}/callback-confirm-number`,
      numDigits: '1'
    });
    gather.say(sayOptions, message);
    message = 'The next available agent will be with you soon.';
    twiml.say(sayOptions, message);
  } else {
    const message = "I'm sorry, I didn't understand your selection.";
    twiml.say(sayOptions, message);
  }
  twiml.redirect(`${baseUrl}/callback-queue-greeting?skipGreeting=true`);

  callback(null, twiml);
};
