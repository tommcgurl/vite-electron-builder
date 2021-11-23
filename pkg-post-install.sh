#!/bin/sh
## postinstall

pathToScript=$0
pathToPackage=$1
targetLocation=$2
targetVolume=$3

# Check if file exists and if so first delete it.
CONFIG_FILE=/Applications/Electric.app/Contents/Resources/agentIdentifier.ini
if test -f "$CONFIG_FILE"; then
	rm "$CONFIG_FILE"
fi

# Grab the jamf computer_id using the jamf recon command 
# The ID is output as the last line and is surrounded by <computer_id></computer_id>
# for example: <computer_id>1337</computer_id>
# We also trim the whitespace and newline from around the id.
computer_identifier=$(sudo /usr/local/bin/jamf recon | grep "computer_id" | sed s'/<computer_id>//' | sed s'/<\/computer_id>//' | tr -d '[:space:]')

# Write the source and source_id to the agentIdentifier.ini file 
# in the resources directory so that the native app can read from this file.
# for example, the file will look like:
# source_id=1337
# source=jamf
echo "source_id=${computer_identifier}\nsource=jamf" > /Applications/Electric.app/Contents/Resources/agentIdentifier.ini

exit 0		## Success
exit 1		## Failure

