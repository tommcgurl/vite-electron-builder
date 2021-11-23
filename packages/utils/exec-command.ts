import { exec } from 'child_process';
import { readFile } from 'fs';
export type ExecCommandResponse = {
  stdout: string;
  stderror: string;
};

export const execCommand = (command: string) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      resolve({
        stdout,
        stderr,
      });
    });
  });
};

export const readFileAsync = (filename: string) => {
  return new Promise((resolve, reject) => {
    readFile(filename, 'utf8', (error, data) => {
      if (error) {
        reject(error);
      }
      resolve(data);
    });
  }) as Promise<string>;
};
