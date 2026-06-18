#!/bin/bash

set -e

echo "=== VirtualBox Guest Additions Setup Script ==="
echo ""

# Check if running in VirtualBox
if [ ! -f /sys/class/dmi/id/product_name ]; then
    echo "Cannot detect hardware. Exiting."
    exit 1
fi

if grep -qi "virtualbox" /sys/class/dmi/id/product_name; then
    echo "Detected VirtualBox environment."
else
    echo "This does not appear to be a VirtualBox VM."
    echo "Exiting."
    exit 1
fi

echo "Installing Guest Additions dependencies..."
apt-get update -y
apt-get upgrade -y
apt-get install -y build-essential dkms linux-headers-$(uname -r)

# Check if Guest Additions ISO is mounted
if mount | grep -q /media/sf_VBoxGuestAdditions; then
    echo "Guest Additions ISO is already mounted."
elif ls /media/vboxadditions* 2>/dev/null || ls /mnt/*VBoxGuestAdditions* 2>/dev/null; then
    echo "Guest Additions ISO found."
else
    echo "Please insert Guest Additions CD image (Devices > Insert Guest Additions CD image)"
    echo "Press Enter when done..."
    read -r
fi

# Try to find and mount the ISO
VBOX_ISO=""
for path in /media/sf_VBoxGuestAdditions /media/vboxadditions /mnt/vboxadditions /mnt; do
    if ls "$path"/*VBoxGuestAdditions* 2>/dev/null; then
        VBOX_ISO="$path"
        break
    fi
done

if [ -z "$VBOX_ISO" ]; then
    # Try to mount from /dev/sr0
    if [ -b /dev/sr0 ]; then
        mkdir -p /mnt/vboxadditions
        mount -t iso9660 -o ro /dev/sr0 /mnt/vboxadditions
        VBOX_ISO="/mnt/vboxadditions"
    fi
fi

if [ -n "$VBOX_ISO" ]; then
    echo "Installing Guest Additions from $VBOX_ISO..."
    sh "${VBOX_ISO}/VBoxLinuxAdditions.run"
else
    echo "Guest Additions ISO not found. Please install manually:"
    echo "1. Devices > Insert Guest Additions CD image"
    echo "2. Run: sudo sh /media/cdrom/VBoxLinuxAdditions.run"
fi

echo ""
echo "=== Guest Additions Setup Complete ==="
echo "Features now available:"
echo "  - Shared folders"
echo "  - Clipboard sharing"
echo "  - Better video support"
echo "  - Seamless mouse integration"
echo ""
echo "Note: You may need to enable shared clipboard in VirtualBox settings."
echo "Reboot recommended: sudo reboot"