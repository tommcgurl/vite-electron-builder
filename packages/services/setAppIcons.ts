import * as path from 'path';
import { app, Tray, nativeImage, nativeTheme } from 'electron';
import { Platform } from '../main/src/device-info';

const isDarkMode = nativeTheme?.shouldUseDarkColors;
const assetsPath = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : 'assets';
const appIconPath = isDarkMode
  ? 'electric-logo-white.png'
  : 'electric-logo.png';
const appErrorIconPath = isDarkMode ? 'warning-white.png' : 'warning.png';
const appTrayIconPath = isDarkMode ? 'tray-logo-white.png' : 'tray-logo.png';

export const appIcon = nativeImage.createFromPath(
  path.join(assetsPath, appIconPath),
);
export const errorIcon = nativeImage.createFromPath(
  path.join(assetsPath, appErrorIconPath),
);

export const setAppIcon = (platform: Platform) => {
  if (platform === Platform.Mac) {
    app.dock.hide();
  }
};

export const setTrayIcon = () => {
  app.whenReady().then(() => {
    const tray = new Tray(
      nativeImage.createFromPath(path.join(assetsPath, appTrayIconPath)),
    );
    tray.setToolTip('Electric Device Registration Helper');
  });
};
