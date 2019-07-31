exports.handler = function(context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();
  const sayOptions = { voice: 'Polly.Salli' };
  const say = twiml.say(sayOptions);
  say.addText('Thank you. Please make sure you can receive calls at ');
  say.addText('the confirmed phone number. If we are unable to reach ');
  say.addText('you, please call us back at your earliest convenience. ');
  say.addText('We look forward to talking with you soon. Goodbye for now!');
  twiml.hangup();
  // TODO: Get call cache from Sync Map
  // TODO: Cancel the inbound voice task
  const client = context.getTwilioClient();
  const taskAttributes = {
    to: event.From,
    direction: 'outbound',
    name: event.From,
    from: event.To,
    url: `https://${context.DOMAIN_NAME}`
  };
  client
    .taskrouter.workspaces(context.TWILIO_WORKSPACE_SID)
    .tasks
    .create({
      attributes: JSON.stringify(taskAttributes),
      workflowSid: context.TWILIO_ANYONE_WORKFLOW_SID,
      taskChannel: 'custom1'
    })
    .then(task => {
      console.log('Task created:', task.sid);
      callback(null, twiml);
    })
    .catch((error) => {
      console.log(error);
      callback(error);
    });
};
