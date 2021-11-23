import {
  getSerialNumber,
  Platform,
  _parseMDMSourceFileData,
} from './device-info';
import { execCommand } from '../../utils/exec-command';

const WINDOWS_COMMAND = 'wmic csproduct get IdentifyingNumber';
const MAC_COMMAND = 'system_profiler SPHardwareDataType | awk \'/Serial/ {print $4}\'';

jest.mock('../../utils/exec-command.ts');
const mockedExecCommand = execCommand as jest.MockedFunction<
  (command: string) => Promise<unknown>
>;
mockedExecCommand.mockImplementation((command: string) => {
  const stdout =
    command === MAC_COMMAND
      ? 'MOCKED_SERIAL_NUMBER'
      : 'IdentifyingNumber\r\nMOCKED_SERIAL_NUMBER';

  return Promise.resolve({ stdout });
});

describe('getSerialNumber', () => {
  afterEach(() => {
    mockedExecCommand.mockClear();
  });
  it('should be a function', () => {
    expect(getSerialNumber).toEqual(expect.any(Function));
  });

  describe('when given a Windows platform', () => {
    const platform = Platform.Windows;

    it('should execute the Windows command to get the SerialNumber', () => {
      getSerialNumber(platform);

      expect(mockedExecCommand).toHaveBeenCalledWith(WINDOWS_COMMAND);
    });

    it('should return the Serial Number obtained from executing the command', () => {
      const serialNumber = getSerialNumber(platform);

      expect(serialNumber).resolves.toBe('MOCKED_SERIAL_NUMBER');
    });
  });

  describe('when given a Mac platform', () => {
    const platform = Platform.Mac;

    it('should execute the Mac command to get the SerialNumber', () => {
      getSerialNumber(platform);

      expect(mockedExecCommand).toHaveBeenCalledWith(MAC_COMMAND);
    });

    it('should return the Serial Number obtained from executing the command', () => {
      const serialNumber = getSerialNumber(platform);

      expect(serialNumber).resolves.toBe('MOCKED_SERIAL_NUMBER');
    });
  });
});

describe('_parseMDMSourceFileData', () => {
  it('should return a sourceId and source ', () => {
    // This expected result matches what is in the agentIdentifier.spec.ini
    const fileData = 'source_id=6661337666\\r\nsource=kaseya\r\n';
    const expectedResult = {
      sourceId: '6661337666',
      source: 'kaseya',
    };
    expect(_parseMDMSourceFileData(fileData)).toEqual(expectedResult);
  });
  it('should return a sourceId and source and clean out all carriage returns', () => {
    // This expected result matches what is in the agentIdentifier.spec.ini
    const fileData = 'source_id=6661337666\r\r\r\nsource=kaseya\r\r\r\n';
    const expectedResult = {
      sourceId: '6661337666',
      source: 'kaseya',
    };
    expect(_parseMDMSourceFileData(fileData)).toEqual(expectedResult);
  });
  it('should return empty strings if it can\'t successfully parse', () => {
    // This expected result matches what is in the agentIdentifier.spec.ini
    const fileData = 'source_id6661337666sourcekaseya';
    const expectedResult = {
      sourceId: '',
      source: '',
    };
    expect(_parseMDMSourceFileData(fileData)).toEqual(expectedResult);
  });
});
