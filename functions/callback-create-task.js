const getCallCache = (context, event) => {
  return new Promise(async (resolve, reject) => {
    const client = context.getTwilioClient();
    const syncClient = client.sync.services(context.TWILIO_SYNC_SERVICE_SID);
    const callSid = event.CallSid;

    let taskCache;
    const syncMapName = `${callSid}_cache`;
    const syncMapItemKey = 'task';
    try {
      console.log(`Getting sync map item key ${syncMapItemKey} for map ${syncMapName}`);
      const callCache = await syncClient.syncMaps(syncMapName).syncMapItems(syncMapItemKey).fetch();
      taskCache = callCache.data;
      return resolve(taskCache);
    } catch (error) {
      console.error('Error creating sync map.', error);
      return reject(error);
    }
  });
};

exports.handler = async function(context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();
  const sayOptions = { voice: 'Polly.Salli' };
  const say = twiml.say(sayOptions);
  say.addText('Thank you. Please make sure you can receive calls at ');
  say.addText('the confirmed phone number. If we are unable to reach ');
  say.addText('you, please call us back at your earliest convenience. ');
  say.addText('We look forward to talking with you soon. Goodbye for now!');
  twiml.hangup();

  let taskCache;
  try {
    taskCache = await getCallCache(context, event);
    console.log('Cached task info:', taskCache);
  } catch (error) {
    console.error('Error getting task cache.', error);
  }
  const { taskSid, queueSid, attributes } = taskCache;
  const client = context.getTwilioClient();
  // TODO: Cancel the inbound voice task
  try {
    console.log('Cancelling task', taskSid);
    await client.taskrouter
      .workspaces(context.TWILIO_WORKSPACE_SID)
      .tasks(taskSid)
      .update({
        assignmentStatus: 'canceled',
        reason: 'callback requested'
      });
  } catch (error) {
    console.error(`Error cancelling task ${taskSid}.`, error);
  }

  const taskAttributes = {
    ...attributes,
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
