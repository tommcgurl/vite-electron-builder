import { app, dialog } from 'electron';
import fetch from 'node-fetch';
import { getSerialNumber, getMDMSourceInfoFromFile, Platform } from '../main/src/device-info';
import { appIcon, errorIcon } from './setAppIcons';

type AssignUserParams = {
  dt: string;
  serial: string;
  source: MDM;
  source_id: string;
};

type RegisterDeviceParams = {
  dataToken: string;
};

const isProduction = process.env.NODE_ENV === 'production';
// const isProduction = false;

const API_KEY = isProduction
  ? 'dMRDeNgVD8j5Z2uQmhGbgGkzyEJPDBVmZnytaypF'
  : 'n85tFvpSfxm9WfSXsVRtVQt3kHhkaW8sZ7TbtSwQ';

enum MDM {
  Mac = 'jamf',
  Windows = 'kaseya',
}

const assignUser = async (assignmentParams: AssignUserParams) => {
  const url = isProduction
    ? 'https://3ga96cgtx8.execute-api.us-east-1.amazonaws.com/production/v2/assignments/confirmation'
    : 'https://devices-staging.electric.ai/staging/v2/assignments/confirmation';

  console.log('=========== request params:', assignmentParams);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify(assignmentParams),
  });

  return response.status;
};

export const registerDevice = async ({ dataToken }: RegisterDeviceParams, platform: Platform) => {
  // We need to use an interval here in the case where the custom URL
  // triggered the application to open for the first time.
  // In this scenario, it's possible that the application is not
  // ready yet. We use the interval to check that the app is ready.
  // Once it is, we can clear the interval and show the dialog.
  const getDataFromDevice = async () => {
    const serialNumber = await getSerialNumber(platform);
    const { sourceId, source: mdmSource } = await getMDMSourceInfoFromFile();
    let source = mdmSource;
    if (source !== MDM.Mac && source !== MDM.Windows) {
      source = platform === Platform.Mac ? MDM.Mac : MDM.Windows;
    }
    return { serialNumber, sourceId, source };
  };

  const { serialNumber, source, sourceId } = await getDataFromDevice();

  const assignUserResponseStatus = await assignUser({
    dt: dataToken,
    serial: serialNumber,
    source: source as MDM,
    source_id: sourceId,
  });

  await app.whenReady();
  if (assignUserResponseStatus >= 300) {
    // Error Notification
    dialog
      .showMessageBox({
        icon: errorIcon,
        title: 'Unable to register device',
        message: 'Please reach out to Electric so that we\ncan update our device records.',
      })
      .then(() => {
        app.quit();
      })
      .catch(() => app.quit());
  } else {
    // Success Notification
    dialog
      .showMessageBox({
        icon: appIcon,
        title: 'Success',
        message: 'Your device was successfully registered.',
      })
      .then(() => {
        app.quit();
      })
      .catch(() => app.quit());
  }
};
