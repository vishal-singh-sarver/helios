#!/usr/bin/env bash
set -e

APP_VERSION="1.0.0"
INSTALLER_NAME="HeliosInstaller-${APP_VERSION}.run"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LINUX_UNPACKED="$SCRIPT_DIR/../dist/linux-unpacked"
PAYLOAD_DIR="$SCRIPT_DIR/payload/Helios"

# Validation: Check if the build output exists
if [ ! -d "$LINUX_UNPACKED" ]; then
  echo "Error: Build output not found at $LINUX_UNPACKED"
  echo "Please run: npm run build:linux first"
  exit 1
fi

# Validation: Check if critical files exist
if [ ! -f "$LINUX_UNPACKED/helios" ]; then
  echo "Error: Executable 'helios' not found in build output"
  exit 1
fi

if [ ! -f "$LINUX_UNPACKED/chrome-sandbox" ]; then
  echo "Error: 'chrome-sandbox' not found in build output"
  exit 1
fi

if [ ! -f "$LINUX_UNPACKED/resources/icon.png" ]; then
  echo "Error: 'icon.png' not found in resources"
  echo "Make sure electron-builder.yml includes: build/icons/512x512.png -> icon.png"
  exit 1
fi

if [ ! -f "$LINUX_UNPACKED/resources/backend/heliosgui_backend/heliosgui_backend" ]; then
  echo "Error: Backend executable not found at resources/backend/heliosgui_backend/heliosgui_backend"
  echo "Make sure backend binary is properly bundled"
  exit 1
fi

echo "✓ Build validation passed"

# Clean and copy payload
echo "Preparing installer payload..."
rm -rf "$PAYLOAD_DIR"
mkdir -p "$SCRIPT_DIR/payload"
cp -R "$LINUX_UNPACKED" "$PAYLOAD_DIR"

# Remove CMake metadata only (long paths break makeself); keep pyhelios runtime libs
echo "Cleaning up CMake build metadata..."
find "$PAYLOAD_DIR/resources/backend" -type d -name "CMakeFiles" -exec rm -rf {} + 2>/dev/null || true
find "$PAYLOAD_DIR/resources/backend" -type f -name "CMakeCache.txt" -delete 2>/dev/null || true
find "$PAYLOAD_DIR/resources/backend" -type f -name "cmake_install.cmake" -delete 2>/dev/null || true
find "$PAYLOAD_DIR/resources/backend" -type f -name "Makefile" -path "*/pyhelios_build/*" -delete 2>/dev/null || true

echo "✓ Payload copied successfully"

# Create the installer
echo "Creating linux installer..."
makeself "$SCRIPT_DIR" "$SCRIPT_DIR/../dist/$INSTALLER_NAME" "Helios Installer" ./install.sh
echo "✓ Created: dist/$INSTALLER_NAME"

# Copy installer .desktop helper to dist folder
echo "Creating installer launcher..."
cp "$SCRIPT_DIR/HeliosInstaller.desktop" "$SCRIPT_DIR/../dist/HeliosInstaller.desktop"
chmod +x "$SCRIPT_DIR/../dist/HeliosInstaller.desktop"

# Copy installation README to dist folder
echo "Copying README..."
cp "$SCRIPT_DIR/README.txt" "$SCRIPT_DIR/../dist/README.txt"

echo ""
echo "========================================="
echo "✓ Installer ready for distribution!"
echo "========================================="
echo ""
echo "Files in dist/:"
echo "  HeliosInstaller-1.0.0.run    (~210 MB)"
echo "  HeliosInstaller.desktop      (Launcher shortcut)"
echo "  README.txt                   (Installation guide)"
echo ""
echo "Recommended install method (terminal):"
echo "  cd dist/"
echo "  ./HeliosInstaller-1.0.0.run"
echo "========================================="
