#!/usr/bin/env bash
set -e

APP_NAME="Helios"
DEFAULT_INSTALL_DIR="$HOME/.local/opt/Helios"
APP_SUBDIR="app"
DESKTOP_FILE_NAME="Helios.desktop"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PAYLOAD_DIR="$SCRIPT_DIR/payload/Helios"
LICENSE_FILE="$SCRIPT_DIR/license.txt"
DESKTOP_TEMPLATE="$SCRIPT_DIR/helios.desktop"

INSTALL_APP_DIR=""

zenity --info \
  --title="Welcome to Helios" \
  --width=500 \
  --text="This installer will install Helios on your system."

if ! zenity --text-info \
  --title="License Agreement" \
  --width=700 \
  --height=500 \
  --filename="$LICENSE_FILE" \
  --checkbox="I accept the license agreement"
then
  zenity --error \
    --title="Installation Cancelled" \
    --text="You must accept the license agreement to continue."
  exit 1
fi

INSTALL_DIR=$(zenity --file-selection \
  --directory \
  --title="Choose Install Location" \
  --filename="$DEFAULT_INSTALL_DIR/")

if [ -z "$INSTALL_DIR" ]; then
  zenity --error \
    --title="Installation Cancelled" \
    --text="No install directory was selected."
  exit 1
fi

INSTALL_APP_DIR="$INSTALL_DIR/$APP_SUBDIR"

mkdir -p "$INSTALL_APP_DIR"

(
  echo "10"
  echo "# Preparing installation directory..."
  rm -rf "$INSTALL_APP_DIR"
  mkdir -p "$INSTALL_APP_DIR"

  echo "40"
  echo "# Copying application files..."
  cp -R "$PAYLOAD_DIR"/. "$INSTALL_APP_DIR"/

  echo "70"
  echo "# Setting executable permissions..."
  find "$INSTALL_APP_DIR" -type f -name "helios" -exec chmod +x {} \; || true
  find "$INSTALL_APP_DIR" -type f -name "heliosgui_backend" -exec chmod +x {} \; || true

  echo "85"
  echo "# Creating desktop launcher..."
  mkdir -p "$HOME/.local/share/applications"
  DESKTOP_TARGET="$HOME/.local/share/applications/$DESKTOP_FILE_NAME"
  sed "s|__INSTALL_DIR__|$INSTALL_DIR|g" "$DESKTOP_TEMPLATE" > "$DESKTOP_TARGET"
  chmod +x "$DESKTOP_TARGET"

  if [ -f "$INSTALL_APP_DIR/resources/icon.png" ]; then
    cp "$INSTALL_APP_DIR/resources/icon.png" "$INSTALL_DIR/icon.png"
  fi

  echo "100"
  echo "# Installation complete."
) | zenity --progress \
  --title="Installing Helios" \
  --width=500 \
  --auto-close \
  --percentage=0

zenity --info \
  --title="Installation Complete" \
  --width=500 \
  --text="Helios was installed successfully.\n\nLocation: $INSTALL_DIR"

if zenity --question \
  --title="Launch Helios" \
  --width=400 \
  --text="Do you want to launch Helios now?"
then
  if [ -x "$INSTALL_APP_DIR/helios" ]; then
    nohup "$INSTALL_APP_DIR/helios" >/dev/null 2>&1 &
  else
    zenity --error \
      --title="Launch Failed" \
      --text="Could not find executable at:\n$INSTALL_APP_DIR/helios"
  fi
fi
