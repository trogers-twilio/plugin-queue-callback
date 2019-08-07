const cacheCallTask = (context, event) => {
  return new Promise(async (resolve, reject) => {
    const client = context.getTwilioClient();
    const syncClient = client.sync.services(context.TWILIO_SYNC_SERVICE_SID);

    const { TaskSid, TaskAttributes, TaskQueueSid } = event;
    const attributes = TaskAttributes && JSON.parse(TaskAttributes);
    const callSid = attributes && attributes.call_sid;

    let map;
    const syncMapName = `${callSid}_cache`;
    try {
      console.log('Creating sync map with name', syncMapName);
      const syncMapOptions = {
        uniqueName: syncMapName,
        collectionTtl: 86400
      };
      map = await syncClient.syncMaps.create(syncMapOptions);
      console.log('Sync map created:', map.sid);
    } catch (error) {
      console.error('Error creating sync map.', error);
      return reject(error);
    }

    try {
      const itemKey = 'task';
      const itemData = {
        taskSid: TaskSid,
        queueSid: TaskQueueSid,
        attributes
      };
      console.log('Creating sync map item on map', syncMapName);
      console.log(`Item key: ${itemKey}. Item data:`, itemData);
      const item = await syncClient.syncMaps(syncMapName).syncMapItems.create({
        key: itemKey,
        data: itemData
      });
      console.log('Item created on map', item.mapSid);
    } catch (error) {
      console.error('Error creating sync map item.', error);
      return reject(error);
    }

    return resolve();
  });
};

exports.handler = async function(context, event, callback) {
  const response = { status: 200 };

  console.log('Event properties:');
  Object.keys(event).forEach(key => {
    console.log(`${key}: ${event[key]}`);
  });

  const { EventType } = event;

  switch (EventType) {
    case 'task.created': {
      try {
        console.log('Task created. Caching call and task details.');
        await cacheCallTask(context, event);
      } catch (error) {
        console.error('Error caching call and task details.', error);
      }
      break;
    }
    default:
      // nothing to do here
  }

  callback(null, response);
};
