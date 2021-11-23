const { exec } = require('child_process');

// Pull the procedure and app versions from the package.json
const procedureVersion = process.env.npm_package_procedureVersion;
const appVersion = process.env.npm_package_version;
const data = {
  procedureVersion,
  appVersion,
};
const proceduresToTemplate = [
  {
    templatePath: './kaseya-install-procedure.ejs',
    outputPath: `kaseya-procedure-electric-device-user-mapping-v${procedureVersion}.xml`,
  },
  {
    templatePath: './kaseya-uninstall-procedure.ejs',
    outputPath: `kaseya-procedure-electric-device-user-mapping-uninstall-v${procedureVersion}.xml`,
  },
];
// We need to URI encode and stringify the data so we can use it in the
// ejs command
const encodedData = encodeURIComponent(JSON.stringify(data));
// We use npx so that we don't have to install ejs globally.
proceduresToTemplate.forEach(({ templatePath, outputPath }) => {
  const command = `npx ejs ${templatePath} -i ${encodedData} -o ${outputPath}`;

  const handleCommandCallback = (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
    if (stderr) {
      console.log(stderr);
    }
    console.log(stdout);
  };
  exec(command, handleCommandCallback);
});
