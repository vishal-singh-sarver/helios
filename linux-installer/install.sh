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

if ! command -v zenity >/dev/null 2>&1; then
  echo "Error: 'zenity' is required but not installed."
  echo "Install it with: sudo apt install zenity  (Debian/Ubuntu)"
  echo "             or: sudo dnf install zenity  (Fedora)"
  exit 1
fi

zenity --info \
  --title="Welcome to Helios" \
  --width=500 \
  --text="This installer will install Helios on your system.\n\nYou will be asked to:\n  1. Accept the license agreement\n  2. Confirm the install location\n  3. Enter your password (to configure the security sandbox)\n\nClick OK to continue."

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

if zenity --question \
  --title="Install Location" \
  --width=500 \
  --ok-label="Use Default" \
  --cancel-label="Choose Folder..." \
  --text="Install Helios to the default location?

$DEFAULT_INSTALL_DIR"
then
  INSTALL_DIR="$DEFAULT_INSTALL_DIR"
else
  CHOSEN=$(zenity --file-selection \
    --directory \
    --title="Choose Parent Folder for Helios" \
    --filename="$HOME/")

  if [ -z "$CHOSEN" ]; then
    zenity --error \
      --title="Installation Cancelled" \
      --text="No install directory was selected."
    exit 1
  fi
  INSTALL_DIR="$CHOSEN/Helios"
fi

INSTALL_APP_DIR="$INSTALL_DIR/$APP_SUBDIR"
DESKTOP_TARGET="$HOME/.local/share/applications/$DESKTOP_FILE_NAME"

mkdir -p "$INSTALL_APP_DIR"

(
  echo "5"
  echo "# Preparing installation directory..."
  rm -rf "$INSTALL_APP_DIR"
  mkdir -p "$INSTALL_APP_DIR"

  echo "20"
  echo "# Copying application files..."
  cp -R "$PAYLOAD_DIR"/. "$INSTALL_APP_DIR"/

  echo "55"
  echo "# Setting executable permissions..."
  chmod +x "$INSTALL_APP_DIR/helios" 2>/dev/null || true
  chmod +x "$INSTALL_APP_DIR/chrome-sandbox" 2>/dev/null || true
  chmod +x "$INSTALL_APP_DIR/chrome_crashpad_handler" 2>/dev/null || true
  find "$INSTALL_APP_DIR" -type f -name "*.so*" -exec chmod +x {} + 2>/dev/null || true
  if [ -d "$INSTALL_APP_DIR/resources/backend" ]; then
    find "$INSTALL_APP_DIR/resources/backend" -type f -name "heliosgui_backend" -exec chmod +x {} + 2>/dev/null || true
  fi

  echo "70"
  echo "# Installing application icon..."
  ICON_THEME_DIR="$HOME/.local/share/icons/hicolor/512x512/apps"
  mkdir -p "$ICON_THEME_DIR"
  if [ -f "$INSTALL_APP_DIR/resources/icon.png" ]; then
    cp "$INSTALL_APP_DIR/resources/icon.png" "$ICON_THEME_DIR/helios.png"
    chmod 644 "$ICON_THEME_DIR/helios.png"
    gtk-update-icon-cache "$HOME/.local/share/icons/hicolor" >/dev/null 2>&1 || true
  fi

  echo "80"
  echo "# Creating desktop launcher..."
  mkdir -p "$HOME/.local/share/applications"
  sed "s|__INSTALL_DIR__|$INSTALL_DIR|g" "$DESKTOP_TEMPLATE" > "$DESKTOP_TARGET"
  chmod +x "$DESKTOP_TARGET"
  update-desktop-database "$HOME/.local/share/applications" >/dev/null 2>&1 || true

  echo "88"
  echo "# Adding Helios to PATH..."
  mkdir -p "$HOME/.local/bin"
  ln -sf "$INSTALL_APP_DIR/helios" "$HOME/.local/bin/helios"

  echo "93"
  echo "# Creating uninstall script..."
  UNINSTALL_SCRIPT="$INSTALL_DIR/uninstall.sh"
  cat > "$UNINSTALL_SCRIPT" <<UNINSTALL_EOF
#!/bin/bash
INSTALL_DIR="$INSTALL_DIR"
APP_INSTALL_DIR="\$INSTALL_DIR/$APP_SUBDIR"
DESKTOP_TARGET="\$HOME/.local/share/applications/$DESKTOP_FILE_NAME"
BIN_SYMLINK="\$HOME/.local/bin/helios"
ICON_FILE="\$HOME/.local/share/icons/hicolor/512x512/apps/helios.png"

echo "Removing Helios installation..."
rm -rf "\$APP_INSTALL_DIR" 2>/dev/null || true
rm -f "\$DESKTOP_TARGET" 2>/dev/null || true
rm -f "\$BIN_SYMLINK" 2>/dev/null || true
rm -f "\$ICON_FILE" 2>/dev/null || true

if [ -d "\$INSTALL_DIR" ] && [ -z "\$(ls -A "\$INSTALL_DIR" 2>/dev/null)" ]; then
  rmdir "\$INSTALL_DIR" 2>/dev/null || true
fi

gtk-update-icon-cache "\$HOME/.local/share/icons/hicolor" >/dev/null 2>&1 || true
update-desktop-database "\$HOME/.local/share/applications" >/dev/null 2>&1 || true

echo "Helios uninstalled successfully."
UNINSTALL_EOF
  chmod +x "$UNINSTALL_SCRIPT"

  echo "100"
  echo "# Files copied."
) | zenity --progress \
  --title="Installing Helios" \
  --width=500 \
  --auto-close \
  --no-cancel \
  --percentage=0

SANDBOX_FILE="$INSTALL_APP_DIR/chrome-sandbox"
SANDBOX_OK=0
if [ -f "$SANDBOX_FILE" ]; then
  if [ -t 0 ] && [ -t 1 ]; then
    echo ""
    echo "==========================================="
    echo " Helios Installer — Administrator Access"
    echo "==========================================="
    echo " Helios needs sudo access to configure the"
    echo " Chromium security sandbox."
    echo "==========================================="
    echo ""
    if sudo -p "[sudo] password for %u: " bash -c "chown root:root '$SANDBOX_FILE' && chmod 4755 '$SANDBOX_FILE'"; then
      SANDBOX_OK=1
      echo ""
      echo " Sandbox configured successfully."
      echo ""
    fi
  elif command -v pkexec >/dev/null 2>&1; then
    zenity --info \
      --title="Administrator Access Required" \
      --width=500 \
      --no-markup \
      --text="Helios needs administrator privileges to configure the Chromium security sandbox. You will be prompted for your password in the next dialog." 2>/dev/null || true

    if pkexec bash -c "chown root:root '$SANDBOX_FILE' && chmod 4755 '$SANDBOX_FILE'" </dev/null 2>/dev/null; then
      SANDBOX_OK=1
    fi
  fi

  if [ "$SANDBOX_OK" -ne 1 ]; then
    sed -i "s|__NOSANDBOX__| --no-sandbox|g" "$DESKTOP_TARGET" 2>/dev/null || true
    NO_SANDBOX_WRAPPER="$INSTALL_APP_DIR/helios-launcher"
    cat > "$NO_SANDBOX_WRAPPER" <<WRAPPER_EOF
#!/bin/bash
exec "$INSTALL_APP_DIR/helios" --no-sandbox "\$@"
WRAPPER_EOF
    chmod +x "$NO_SANDBOX_WRAPPER"
    ln -sf "$NO_SANDBOX_WRAPPER" "$HOME/.local/bin/helios"
    zenity --warning \
      --title="Sandbox Not Configured" \
      --width=500 \
      --no-markup \
      --text="Chromium sandbox was not configured. Helios will run with the --no-sandbox flag (less secure but fully functional). You can enable the sandbox later by running these two commands in a terminal: sudo chown root:root $SANDBOX_FILE ; sudo chmod 4755 $SANDBOX_FILE" 2>/dev/null || true
  fi
fi

sed -i "s|__NOSANDBOX__||g" "$DESKTOP_TARGET" 2>/dev/null || true

zenity --info \
  --title="Installation Complete" \
  --width=550 \
  --no-markup \
  --text="Helios installed successfully!

Location: $INSTALL_DIR

You can now:
  - Launch Helios from your Applications menu
  - Run 'helios' from a terminal
  - Uninstall with: bash $INSTALL_DIR/uninstall.sh" 2>/dev/null || true

if zenity --question \
  --title="Launch Helios" \
  --width=400 \
  --no-markup \
  --text="Do you want to launch Helios now?" 2>/dev/null
then
  if [ -x "$INSTALL_APP_DIR/helios" ]; then
    if [ "$SANDBOX_OK" -eq 1 ]; then
      nohup "$INSTALL_APP_DIR/helios" >/dev/null 2>&1 &
    else
      nohup "$INSTALL_APP_DIR/helios" --no-sandbox >/dev/null 2>&1 &
    fi
  else
    zenity --error \
      --title="Launch Failed" \
      --width=500 \
      --no-markup \
      --text="Could not find executable at: $INSTALL_APP_DIR/helios. Please launch manually from the Applications menu." 2>/dev/null || true
  fi
fi

exit 0
