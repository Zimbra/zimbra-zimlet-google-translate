#!/bin/bash
echo "*** Configuring Zimbra-Zimlet-Google-Translate ***"
echo "*** Checking if Zimbra-Zimlet-Google-Translate  zimlet is installed. ***"
su - zimbra -c "zmmailboxdctl status"
if [ $? -ne 0 ]; then
   echo "*** Mailbox is not running... ***"
   echo "*** Follow the steps below as zimbra user ignore if installing through install.sh .. ***"
   echo "*** Install the Zimbra-Zimlet-Google-Translate  zimlet. ***"
   echo "*** zmzimletctl deploy /opt/zimbra/zimlets-network/zimbra-zimlet-gtranslate.zip ***"
   echo "*** zmprov fc zimlet ***"
else
   echo "*** Deploying Zimbra-Zimlet-Google-Translate ***"
   su - zimbra -c  "zmzimletctl deploy /opt/zimbra/zimlets-network/zimbra-zimlet-gtranslate.zip"
   su - zimbra -c  "zmprov fc zimlet"
fi
echo "*** Zimbra-Zimlet-Google-Translate  Installation Completed. ***"
echo "*** Restart the mailbox service as zimbra user. Run ***"
echo "*** su - zimbra ***"
echo "*** zmmailboxdctl restart ***"
