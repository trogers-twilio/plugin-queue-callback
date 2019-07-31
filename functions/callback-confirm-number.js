exports.handler = function(context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();
  const sayOptions = { voice: 'Polly.Salli' };
  const baseUrl = `https://${context.DOMAIN_NAME}`;
  const { Digits, step } = event;

  if (step === 'optionChosen') {
    if (Digits === '1') {
      twiml.redirect(`${baseUrl}/callback-create-task`);
    } else if (Digits === '2') {
      twiml.redirect(`${baseUrl}/callback-new-number`);
    }
  } else if (Digits === '1') {
    const callerNumber = event.From.replace(/\D/g, '');
    const say = twiml.say(sayOptions);
    say.addText('Would you like us to call you back at ');
    say.ssmlBreak({ time: '200ms' });
    say.ssmlSayAs({ 'interpret-as': 'telephone' }, callerNumber);
    say.ssmlBreak({ time: '200ms' });
    const message = 'If yes, press 1. Or press 2 '
        + "if you'd like to enter a new number.";
    const gather = twiml.gather({
      action: `${baseUrl}/callback-confirm-number?step=optionChosen`,
      numDigits: '1'
    });
    gather.say(sayOptions, message);
    twiml.redirect(`${baseUrl}/callback-confirm-number?Digits=${Digits}`);
  } else {
    const message = 'The next available agent will be with you soon.';
    twiml.say(sayOptions, message);
    twiml.redirect(`${baseUrl}/hold-with-callback?skipGreeting=true`);
  }
  callback(null, twiml);
};
