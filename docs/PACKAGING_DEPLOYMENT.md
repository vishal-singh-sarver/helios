# Helios - Desktop Application Packaging & Deployment Guide

**Version:** 1.0.0  
**Last Updated:** March 30, 2026  
**Target Platforms:** Windows 10+, macOS 10.12+, Linux (Ubuntu 18.04+)

---

## Table of Contents

1. [Build & Packaging](#build--packaging)
2. [Installed Files and User Data](#installed-files-and-user-data)
3. [Distribution & End-User Installation](#distribution--end-user-installation)
4. [Configuration & Customization](#configuration--customization)
5. [CI/CD Integration](#cicd-integration)
6. [Troubleshooting](#troubleshooting)

---

## Build & Packaging

### Overview

Helios uses **electron-builder** for cross-platform packaging. The build process:

```
npm run build            # Compile TypeScript/React → out/
    ↓
electron-builder        # Package app → dist/
    ↓
Platform-specific installers/packages available for distribution
```

### Build Artifacts Created

| File | Location | Purpose | Size Est. |
|------|----------|---------|-----------|
| Development output | `out/` | Compiled app files (NOT for distribution) | 50 MB |
| Installers | `dist/` | User-facing distribution packages | 140-160 MB each |
| macOS app bundle | `dist/mac-arm64/` | Intermediate app package | 150 MB |

### Build Commands

```bash
# Development: Compile and test locally
npm run build

# Package for current platform (macOS, Windows, or Linux)
npm run package

# Package for all platforms (requires tools on host)
npm run package:all

# Platform-specific packaging
npm run package:mac            # macOS
npm run package:win            # Windows
npm run package:linux          # Linux

# Clean build artifacts
npm run dist:clean             # Remove dist/ and out/
npm run dist:clean-all         # Full clean (also removes node_modules)
```

### Build Resources

All installer assets are stored in the `build/` directory (repo-local, no absolute paths):

```
build/
├── license.txt              # EULA shown in all installers
├── icon.ico                 # Windows/macOS app icon (256x256)
├── installer.nsh            # NSIS script customization (Windows)
├── welcome.txt              # macOS PKG installer welcome screen
├── conclusion.txt           # macOS PKG installer completion screen
├── readme.txt               # macOS PKG installer info
└── distribution.xml         # macOS PKG configuration reference
```

#### Asset Specifications

- **icon.ico**: 256×256 pixels, ICO format
  - Used in: Windows installer, shortcuts, taskbar, dialogs
  - Must exist for clean builds
  
- **license.txt**: UTF-8 plain text
  - Mandatory: User must accept in all installers
  - Max ~2 pages recommended for readability
  - Currently: Comprehensive EULA with all standard clauses

- **installer.nsh**: NSIS script (Windows)
  - Advanced NSIS customization
  - Must not redefine electron-builder generated functions
  - Currently: License acceptance checkbox enhancement

### Configuration Files

| File | Purpose | Modifications | CI Safety |
|------|---------|---------------|----|
| `electron-builder.yml` | Master packaging config | Should contain only relative paths | ✅ Safe |
| `package.json` | App metadata + build scripts | Update productName/version as needed | ✅ Safe |
| `.nsis.yml` (auto-generated) | Windows-specific NSIS config | Generated, do not edit | ✅ Auto |

---

## Installed Files and User Data

### Windows Installation

#### Installed App Location
- **Per-Machine Install Path:** `C:\Program Files\Helios\` (default, UAC elevation on install)
- **Alternative User Install:** `%LOCALAPPDATA%\Programs\Helios\` (non-admin install)

Use Cases:
- Professional environments → `C:\Program Files\`
- Single-user, no-admin → `%LOCALAPPDATA%\Programs\`

#### App Files Structure
```
C:\Program Files\Helios\
├── Helios.exe                    # Main application executable
├── resources/
│   ├── app.asar                  # Packaged app code
│   ├── electron.asar             # Electron runtime
│   └── [native modules]
└── [Support DLLs]
```

#### shortcuts & Start Menu
- **Desktop Shortcut:** `C:\Users\{User}\Desktop\Helios.lnk`
- **Start Menu:** `C:\Users\{User}\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Helios.lnk`
- **Uninstall Entry:** Control Panel → Programs and Features → "Helios"

#### User Data Locations

**Application Data:**
```
%APPDATA%\Helios\                   # User-specific app data
├── config/                         # Application configuration
├── data/                           # User projects/files
└── cache/                          # Temporary cached data
```

**Logs:**
```
%APPDATA%\Helios\logs\              # Application logs
├── main.log                        # Main process logs
├── renderer.log                    # Renderer process logs
└── [date-stamped logs]
```

**Support/Admin For User Data Issues:**
- Safe to inspect: All files in `%APPDATA%\Helios\` are user/support viewable
- Safe to delete: `%APPDATA%\Helios\cache\` can be cleared
- Do not modify: Application configuration files without user directive
- Do not modify: .asar files in installation directory

#### Uninstall Behavior
- Uninstall via: Control Panel → Programs → Helios → Uninstall
- **Preserved:** `%APPDATA%\Helios\` directory (user data not deleted)
- **Removed:** All app executable files in `C:\Program Files\Helios\`
- **Removed:** Shortcuts and start menu entries
- **Removed:** Registry uninstall entry

---

### macOS Installation

#### Installed App Location
- **App Bundle:** `/Applications/Helios.app/`

Structure:
```
/Applications/Helios.app/
├── Contents/
│   ├── MacOS/Helios              # Executable entry point
│   ├── Resources/
│   │   ├── app.asar              # Packaged app code
│   │   ├── electron.asar         # Electron runtime
│   │   └── icon.icns             # App icon
│   ├── Info.plist                # App metadata
│   └── _CodeSignature/           # (Empty for dev builds)
```

#### User Data Locations

**Application Data & Preferences:**
```
~/Library/Application Support/Helios/
├── config/                         # User preferences
├── data/                           # User projects/files
└── cache/                          # Temporary data
```

**Logs:**
```
~/Library/Logs/Helios/
├── main.log                        # Main process logs
└── renderer.log                    # Renderer process logs
```

**System Integration:**
- **Preferences:** `~/Library/Preferences/com.navyug.helios.plist`
- **Dock Icon:** Drag `/Applications/Helios.app` to Dock manually
- **Launchpad:** App appears automatically (can be removed, not deleted)

**Support/Admin For User Data Issues:**
- Safe to inspect: All files under `~/Library/Application Support/Helios/`
- Safe to inspect: All files under `~/Library/Logs/Helios/`
- Safe to delete: `~/Library/Application Support/Helios/cache/` can be cleared
- Do not modify: `.asar` files in the app bundle
- Do not modify: Library/Preferences/*.plist files without developer guidance

#### Uninstall Behavior
- Manual uninstall: Delete `/Applications/Helios.app` to Trash
- Clean uninstall: Also delete `~/Library/Application Support/Helios/` and `~/Library/Preferences/com.navyug.helios.plist` if user desires fresh state
- **Preserved by default:** All files in `~/Library/Application Support/Helios/`
- **Note:** Removing app does NOT remove user data or preferences

---

### Linux Installation

#### Installed App Locations

**System-wide (if applicable):**
```
/opt/Helios/                        # Preferred system location (if packaged)
or
/usr/local/Helios/                  # Alternative location
```

**User-specific (AppImage standard):**
```
~/.local/bin/                       # Optional: symlink to portable AppImage
~/applications/Helios.AppImage       # Typical user location for AppImage
```

#### App Files Structure

**AppImage (single executable):**
```
Helios-1.0.0.AppImage              # Monolithic executable
(No unpacking needed - runs directly)
```

**DEB Package Install:**
```
/opt/helios/                        # Actual install location post-install
├── Helios                          # Executable wrapper
├── resources/
│   ├── app.asar                    # Packaged app
│   ├── electron.asar               # Electron runtime
│   └── [support files]
└── libffmpeg.so                    # Native library dependencies
```

#### Shortcuts & Desktop Integration

**Desktop Entry (starts automatically after install):**
```
~/.local/share/applications/Helios.desktop   # User menu integration
/usr/share/applications/helios.desktop       # System-wide (via DEB)
```

Desktop entry provides:
- Application menu entry
- Alt+F2 launcher support
- File type associations (if configured)
- 'Open with' context menu

**Launcher:**
```bash
# Run AppImage
./Helios-1.0.0.AppImage

# Run installed DEB app
helios               # Via symlink if configured
/opt/helios/Helios   # Direct path
```

#### User Data Locations

**Application Data (XDG standard):**
```
~/.config/Helios/                   # Configuration
├── config.json                     # User preferences
└── [app config]

~/.local/share/Helios/              # Application data
├── data/                           # User projects/files
└── cache/                          # Temporary cache
```

**Logs:**
```
~/.local/share/Helios/logs/
├── main.log                        # Main process logs
└── renderer.log                    # Renderer process logs
```

**Support/Admin For User Data Issues:**
- Safe to inspect: All files in `~/.config/Helios/` and `~/.local/share/Helios/`
- Safe to delete: `~/.local/share/Helios/cache/` can be cleared
- Do not modify: Application executables in `/opt/helios/`
- Do not modify: Symlinks in `/usr/bin/` or `/usr/local/bin/`

#### Uninstall Behavior

**AppImage:**
- Delete file: `rm ~/Helios-1.0.0.AppImage`
- Preserves: User data in `~/.config/Helios/` and `~/.local/share/Helios/`

**DEB Package:**
- Uninstall: `sudo apt remove helios`
- Purge: `sudo apt remove --purge helios` (removes config too)
- Preserves: User data unless purge is used

---

## Distribution & End-User Installation

### Windows End-User Installation

**What User Receives:**
- File: `helios-1.0.0-setup.exe` (85 MB)
- Delivery: Download link or USB

**Installation Steps:**
1. User double-clicks `helios-1.0.0-setup.exe`
2. UAC prompt appears: "Allow app to make changes?" → User clicks `Yes`
3. **Welcome screen** → "Next"
4. **License agreement** → User reads and checks "I Agree" → "Next"
5. **Installation directory** → (Pre-filled with `C:\Program Files\Helios\`) → User can change → "Install"
6. **Progress bar** → Installation completes
7. **Finish screen** → Option to "Launch Helios" is checked → "Finish"
8. **App launches**
9. **Shortcuts created:**
    - Desktop: `Helios.lnk`
    - Start Menu: `Helios.lnk`

**Post-Installation:**
- App is now accessible from Start Menu, Desktop, and Programs
- Uninstall available via Control Panel → Programs

---

### macOS End-User Installation

**DMG Method (Simple Drag-and-Drop):**

**What User Receives:**
- File: `helios-1.0.0.dmg` (135 MB, standard for macOS)
- Delivery: Download or email

**Installation Steps:**
1. User double-clicks `helios-1.0.0.dmg`
2. Finder opens: DMG mounts as virtual disk
3. Shows: Folder icon "Helios.app" and "Applications" folder
4. User drags `Helios.app` onto `Applications` folder
5. Installation completes
6. Unmount DMG: Eject from Finder sidebar
7. App is now in `/Applications/Helios.app`

**Launch:**
- Spotlight: Press `Cmd+Space`, type "Helios"
- Finder: `/Applications/` → `Helios.app`
- Dock: Drag `/Applications/Helios.app` to Dock for quick access

---

**PKG Method (Professional Installer):**

**What User Receives:**
- File: `helios-1.0.0.pkg` (135 MB, professional enterprise style)
- Delivery: Download or enterprise deployment

**Installation Steps:**
1. User double-clicks `helios-1.0.0.pkg`
2. Installer.app opens
3. **Welcome screen** → "Continue"
4. **License agreement** → User reads → "Agree" → "Continue"
5. **Installation location** → (Default: `/Applications`) → "Continue"
6. **Authentication** → Admin password requested (standard for per-machine installs)
7. **Progress bar** → Installation completes
8. **Summary screen** → Shows installation success
9. **Close**
10. App is now in `/Applications/Helios.app`

**Post-Installation:**
- App accessible immediately from `/Applications/`
- Can be added to Dock, Launchpad, Spotlight
- Uninstall via dragging to Trash (user data preserved)

---

### Linux End-User Installation

**AppImage Method (No Installation Required):**

**What User Receives:**
- File: `helios-1.0.0.AppImage` (150 MB)
- Delivery: Download

**Usage:**
1. User downloads `helios-1.0.0.AppImage`
2. Make executable: `chmod +x helios-1.0.0.AppImage`
3. Run directly: `./helios-1.0.0.AppImage`
4. Optional: Move to discoverable location:
   ```bash
   mv helios-1.0.0.AppImage ~/.local/bin/Helios
   chmod +x ~/.local/bin/Helios
   ```
5. App launches or shows in application menu

**Advantages:**
- No installation required
- Single file (easy to distribute)
- Works on any Linux distro

---

**DEB Package Method (System Integration):**

**What User Receives:**
- File: `helios-1.0.0.deb` (140 MB)
- Delivery: Download or repository

**Installation Steps (Ubuntu/Debian):**
1. User double-clicks `helios-1.0.0.deb` in file manager
2. Software center/installer opens
3. Shows: "Helios" with description
4. User clicks "Install"
5. Password prompt (may appear): Admin password required
6. Installation completes
7. User closes installer

**Or via Terminal:**
```bash
sudo dpkg -i helios-1.0.0.deb
```

**Post-Installation:**
- App available in Applications menu
- Desktop entry created
- Can be launched: `helios` or `/opt/helios/Helios`
- Uninstall: `sudo apt remove helios` or software manager

---

## Configuration & Customization

### Modifying Installer Assets

#### Change License Agreement
1. Edit `build/license.txt`
2. Rebuild: `npm run build && npm run package:{platform}`
3. New installer will show updated license

#### Change App Icon
1. Replace `build/icon.ico` (Windows/macOS) - must be valid .ico format, 256×256 minimum
2. Rebuild: `npm run package:{platform}`
3. Flush system caches if icon doesn't update immediately

#### Modify Installer UI (Windows NSIS)
1. Edit `build/installer.nsh`
2. Reference NSIS docs: https://nsis.sourceforge.io/
3. Rebuild: `npm run package:win`

#### Modify macOS Installer Text
1. Edit `build/welcome.txt` and `build/conclusion.txt`
2. Rebuild: `npm run package:mac`

### Code Signing & Notarization (Production)

#### macOS Code Signing

**For App Store or Gatekeeper bypass:**

1. Obtain Apple Developer certificate
2. Update `electron-builder.yml`:
   ```yaml
   mac:
     identity: 'Developer ID Application: Company Name (TEAM_ID)'
     sign: true
   ```
3. Rebuild

#### Windows Code Signing

**For SmartScreen bypass (production):**

1. Obtain code signing certificate (.pfx)
2. Update `electron-builder.yml`:
   ```yaml
   win:
     certificateFile: path/to/cert.pfx
     certificatePassword: ${CERTIFICATE_PASSWORD}
   ```
3. Set environment: `set CERTIFICATE_PASSWORD=...`
4. Rebuild

### Updating App Version

1. Edit `package.json`: `"version": "1.0.1"`
2. Rebuild: `npm run package:all`
3. New installers: `helios-1.0.1-setup.exe`, `helios-1.0.1.dmg`, etc.

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build Installers

on:
  push:
    tags:
      - 'v*'

jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 22
      - run: npm ci
      - run: npm run package:win
      - uses: actions/upload-artifact@v3
        with:
          name: windows-installer
          path: dist/*.exe

  build-macos:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 22
      - run: npm ci
      - run: npm run package:mac
      - uses: actions/upload-artifact@v3
        with:
          name: macos-installers
          path: dist/*.{dmg,pkg}

  build-linux:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 22
      - run: npm ci
      - run: npm run package:linux
      - uses: actions/upload-artifact@v3
        with:
          name: linux-packages
          path: dist/*.{AppImage,deb}
```

### Local Multi-Platform Building (if desired)

**Requirements:**
- macOS: For building macOS installers (DMG/PKG signing and packaging)
- Windows: For building Windows NSIS installer (native tools required)
- Linux: For building AppImage and DEB (native tools required)

**Limitation:** Cross-compilation is not recommended for Electron. Each platform should build on its native OS.

---

## Troubleshooting

### Build Issues

**Error: Icon file not found**
```
Solution: Ensure build/icon.ico exists
ls build/icon.ico
```

**Error: License file not found**
```
Solution: Ensure build/license.txt exists
ls build/license.txt
```

**Error: Absolute paths in configuration**
```
Solution: Use only relative paths in electron-builder.yml
Example ❌: from: /Users/navyug/...
Example ✅: from: build/resources/...
```

### Windows Installation Issues

**UAC prompt doesn't appear**
- Check: `perMachine: true` in electron-builder.yml
- Verify: `allowElevation: true`

**License agreement doesn't appear**
- Check: `license: build/license.txt` path is correct
- Verify: File is readable UTF-8

**Shortcuts not created**
- Check: `createDesktopShortcut: true` and `createStartMenuShortcut: true`
- Note: User permissions may prevent system-wide shortcuts

### macOS Installation Issues

**"Helios cannot be opened because it is from an unidentified developer"**
- Expected for unsigned development builds
- Solution (user): `Open with` → Select and click "Open" once, or
- Workaround: `xattr -d com.apple.quarantine /Applications/Helios.app`

**Code signing validation fails during build**
- Check: `identity: null` for development
- Production: Provide valid Apple Developer certificate

### Linux Installation Issues

**AppImage: "AppImage: Could not find magic bytes"**
- Issue: File corrupted during download
- Solution: Re-download, verify file size

**DEB: "Depends on unmet package"**
- Issue: Missing system dependencies
- Solution: Install via: `sudo apt-get install -f`

### Installer Size Too Large

**Expected sizes:**
- Windows NSIS: 140-160 MB (includes Electron runtime)
- macOS DMG: 140-160 MB (includes Electron runtime)
- Linux AppImage: 150-170 MB (includes Electron runtime)

**To reduce:**
- Remove unused dependencies from `package.json`
- Optimize app code (minification, tree-shaking)
- Note: Electron runtime itself is ~150 MB unavoidable

### Post-Install Assets Not Included

**Issue:** Custom resources not in installed app

**Check:**
1. Verify path is in `files:` or `extraResources:` in electron-builder.yml
2. Path must be relative to repo root
3. No absolute paths allowed

**Example fix:**
```yaml
# ❌ Wrong:
extraResources:
  - from: /Users/navyug/resources
    to: resources

# ✅ Correct:
extraResources:
  - from: build/resources
    to: resources
```

---

## Appendix: File Checklist

### Before Release

- [ ] `build/license.txt` - EULA reviewed and approved
- [ ] `build/icon.ico` - Professional 256×256 icon in place
- [ ] `build/installer.nsh` - NSIS customization (if used) tested
- [ ] `build/welcome.txt` - macOS installer welcome text
- [ ] `build/conclusion.txt` - macOS installer completion text
- [ ] `electron-builder.yml` - No absolute paths, correct identifiers
- [ ] `package.json` - Version bumped, correct app naming
- [ ] `npm run build` - Succeeds without errors
- [ ] `npm run package:{platform}` - Succeeds, creates distributable
- [ ] Installer tested on target OS/version
- [ ] License agreement accepted during install confirmed
- [ ] App launches post-install
- [ ] Shortcuts created (Windows/macOS)
- [ ] Uninstall process tested
- [ ] Clean install tested (no residual files)
- [ ] User data locations verified

### Documentation Locations

| Topic | File |
|-------|------|
| Packaging Config | `electron-builder.yml` |
| Build Scripts | `package.json` (scripts section) |
| Build Assets | `build/` directory |
| This Guide | `PACKAGING_DEPLOYMENT.md` (this file) |

---

## Support & Feedback

For issues or improvements to the packaging system:
1. Review this document for resolution
2. Check Troubleshooting section above
3. Review `electron-builder.yml` for configuration issues
4. Consult electron-builder official docs: https://www.electron.build/

---

**END OF PACKAGING GUIDE**
