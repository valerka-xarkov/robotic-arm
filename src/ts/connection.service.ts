export type RequestData = { [key in Props]?: number };

// min time between 2 requests starts
const minTime = 100; // ms

export enum Props {
  Servo1 = 'servo1',
  Servo2 = 'servo2',
  Servo3 = 'servo3'
}

let nextTaskData: RequestData;
let inTask = false;

function sendRequest(requestData: RequestData) {
  const time = Date.now();
  inTask = true;

  const request = new XMLHttpRequest();
  request.addEventListener('loadend', () => {
    const interval = Date.now() - time;
    setTimeout(() => {
      inTask = false;
      if (nextTaskData) {
        sendRequest(nextTaskData);
        nextTaskData = null;
      }
    }, Math.max(0, minTime - interval));
  });

  request.open(
    'GET',
    '/wheels?' +
      Object.keys(requestData)
        .map(k => `${k}=${requestData[k]}`)
        .join('&')
  );
  request.send();
}

export function sendRequestSubsequently(data: RequestData) {
  if (inTask) {
    nextTaskData = Object.assign({}, nextTaskData, data);
  } else {
    sendRequest(data);
  }
}
