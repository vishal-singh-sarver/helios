#!/usr/bin/env bash
set -e

APP_VERSION="1.0.0"
INSTALLER_NAME="HeliosInstaller-${APP_VERSION}.run"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

rm -rf "$SCRIPT_DIR/payload/Helios"
mkdir -p "$SCRIPT_DIR/payload"
cp -R "$SCRIPT_DIR/../dist/linux-unpacked" "$SCRIPT_DIR/payload/Helios"

makeself "$SCRIPT_DIR" "$SCRIPT_DIR/../dist/$INSTALLER_NAME" "Helios Installer" ./install.sh
echo "Created: dist/$INSTALLER_NAME"
