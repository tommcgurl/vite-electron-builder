import type { ExecCommandResponse } from '../../utils/exec-command';
import { execCommand, readFileAsync } from '../../utils/exec-command';
import { app } from 'electron';
import * as path from 'path';

export enum Platform {
  Mac = 'darwin',
  Windows = 'win32',
}

export type MDMSourceInfo = {
  source: string;
  sourceId: string;
};

const platformSpecificCommands = {
  darwin: 'system_profiler SPHardwareDataType | awk \'/Serial/ {print $4}\'',
  win32: 'wmic csproduct get IdentifyingNumber',
};

const getWindowsSerialNumber = async () => {
  try {
    const { stdout } = (await execCommand(platformSpecificCommands.win32)) as ExecCommandResponse;
    return stdout.slice(stdout.indexOf('\r\n') + 2).trim();
  } catch (err) {
    console.error(err);
    return '';
  }
};

const getDarwinSerialNumber = async () => {
  try {
    const { stdout } = (await execCommand(platformSpecificCommands.darwin)) as ExecCommandResponse;
    return stdout.trim();
  } catch (err) {
    console.error(err);
    return '';
  }
};

export const getSerialNumber = (platform: Platform) => {
  const getSerialNumberForPlatform =
    platform === Platform.Mac ? getDarwinSerialNumber : getWindowsSerialNumber;
  return getSerialNumberForPlatform();
};

export const _parseMDMSourceFileData = (fileData: string): MDMSourceInfo =>
  fileData.split('\n').reduce(
    (acc, line) => {
      const [key, value] = line.split('=');
      switch (key) {
        case 'source_id':
          return {
            ...acc,
            sourceId: value.replace(/^[\r\n]+|\.|[\r\n]+$/g, '').trim(),
          };
        case 'source':
          return {
            ...acc,
            [key]: value.replace(/^[\r\n]+|\.|[\r\n]+$/g, '').trim(),
          };
        default:
          return acc;
      }
    },
    {
      sourceId: '',
      source: '',
    },
  );

export const getMDMSourceInfoFromFile = async (): Promise<MDMSourceInfo> => {
  try {
    const agentIdentifierPath = app.isPackaged
      ? path.join(process.resourcesPath, 'agentIdentifier.ini')
      : path.join(__dirname, 'agentIdentifier.ini');
    console.log('$$$$$$$$$$$$ agent ini path: ', agentIdentifierPath);
    const fileData = await readFileAsync(agentIdentifierPath);
    return _parseMDMSourceFileData(fileData);
  } catch (err) {
    console.error(err);
    return {
      source: '',
      sourceId: '',
    };
  }
};
