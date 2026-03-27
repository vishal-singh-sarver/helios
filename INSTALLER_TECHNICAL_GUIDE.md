# Helios Installer - Complete Technical Guide

**Last Updated**: March 27, 2026  
**Project**: Helios Desktop Application  
**Version**: 1.0.0  
**Platforms Supported**: Windows (NSIS), macOS (PKG/DMG), Linux (AppImage/deb)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Frontend & Backend Integration](#frontend--backend-integration)
3. [Platform-Specific Configuration](#platform-specific-configuration)
4. [Build Configuration Files](#build-configuration-files)
5. [Installation Process Details](#installation-process-details)
6. [Troubleshooting Guide](#troubleshooting-guide)
7. [Build & Distribution Commands](#build--distribution-commands)

---

## Architecture Overview

### 1.1 Installer Technology Stack

| Component | Purpose | Technology | Platform |
|-----------|---------|-----------|----------|
| Installer Framework | Package & distribute app | electron-builder | Cross-platform |
| Windows Installer | Custom installer UI | NSIS (Nullsoft Scriptable Install System) | Windows only |
| Windows License Page | License agreement enforcement | Custom NSIS script (installer.nsh) | Windows only |
| macOS Installer | System-level installation | macOS PKG format | macOS only |
| macOS DMG | Drag-drop installation | APFS/HFS+ disk image | macOS only |
| Linux Installer | Linux application package | AppImage, deb | Linux only |

### 1.2 Multi-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    electron-builder                         │
│  (Orchestrates all platform-specific installers)           │
└──────────────┬──────────────┬──────────────┬────────────────┘
               │              │              │
          ┌────▼────┐    ┌────▼────┐   ┌────▼────┐
          │ Windows │    │  macOS  │   │  Linux  │
          │  NSIS   │    │ PKG/DMG │   │ AppImage│
          └────┬────┘    └────┬────┘   └────┬────┘
               │              │              │
        ┌──────▼──────┐ ┌─────▼─────┐ ┌─────▼─────┐
        │ .exe setup  │ │   .pkg    │ │  .AppImage│
        │             │ │   .dmg    │ │   .deb    │
        └─────────────┘ └───────────┘ └───────────┘
```

### 1.3 Complete Package Contents

The final installer includes:

#### Frontend Assets
- **Electron Main Process**: `out/main/index.js` (main app logic)
- **Preload Scripts**: `out/preload/index.js` (secure IPC bridge)
- **Renderer Files**: Complete React UI
  - `out/renderer/index.html` (entry point)
  - `out/renderer/assets/` (CSS, JS bundles)
  - Components: ExampleButton, HomePage, etc.
  - Store configuration and reducers
  - All compiled TypeScript files

#### Backend Assets
- **Location in Installer**: `resources/heliosgui_backend/`
- **Source Path**: `/Users/navyug/PyHelios/Helios-UI/heliosgui-desktop/src-tauri/resources/heliosgui_backend`
- **Contents**: Complete Python backend
  - Application binaries
  - Dependencies
  - Configuration files
  - Runtime libraries

#### Configuration Files
- `package.json` metadata
- `build/license.txt` (legal agreement)
- `build/welcome.txt` (welcome screen)
- `build/conclusion.txt` (completion screen)
- `build/installer.nsh` (custom NSIS script - Windows only)

---

## Frontend & Backend Integration

### 2.1 Frontend Build Process

```bash
# Step 1: Compile TypeScript & React
npm run build
# Outputs:
# - out/main/index.js          (Electron main process)
# - out/preload/index.js       (IPC bridge)
# - out/renderer/              (Complete React app with assets)

# Step 2: Package with electron-builder
electron-builder
# Creates platform-specific installers in dist/
```

### 2.2 Backend Integration in Installer

**Configuration in `electron-builder.yml`:**
```yaml
extraFiles:
  - from: /Users/navyug/PyHelios/Helios-UI/heliosgui-desktop/src-tauri/resources/heliosgui_backend
    to: resources/heliosgui_backend
```

**Result**: Backend copied to `resources/` folder in the app bundle
- Windows: `C:\Program Files\Helios\resources\heliosgui_backend\`
- macOS: `~/Applications/Helios.app/Contents/Resources/heliosgui_backend/`
- Linux: `/opt/Helios/resources/heliosgui_backend/`

### 2.3 Frontend-Backend Communication

The Electron app can launch/communicate with backend via:

```javascript
const backendPath = path.join(app.getAppPath(), 'resources', 'heliosgui_backend');
// Use backendPath to spawn processes or communicate with backend
```

### 2.4 Runtime Paths (After Installation)

| OS | Frontend Location | Backend Location |
|----|------------------|------------------|
| Windows | `C:\Program Files\Helios\` | `C:\Program Files\Helios\resources\heliosgui_backend\` |
| macOS | `~/Applications/Helios.app/` | `~/Applications/Helios.app/Contents/Resources/heliosgui_backend/` |
| Linux | `/opt/Helios/` | `/opt/Helios/resources/heliosgui_backend/` |

---

## Platform-Specific Configuration

### 3.1 Windows NSIS Installer

**File**: `electron-builder.yml` → `nsis` section

```yaml
nsis:
  # Installer file name: Helios-1.0.0-setup.exe
  artifactName: ${name}-${version}-setup.${ext}
  
  # Professional multi-step wizard (NOT one-click)
  oneClick: false
  
  # License agreement enforcement
  license: build/license.txt
  
  # User can choose install directory
  allowToChangeInstallationDirectory: true
  
  # System-wide installation (all users)
  perMachine: true
  allowElevation: true
  
  # Shortcuts
  createDesktopShortcut: true
  createStartMenuShortcut: true
  shortcutName: Helios
  
  # Auto-launch after install
  runAfterFinish: true
  
  # Custom installer enhancements
  include: build/installer.nsh
```

#### Windows Installation Flow
```
1. Welcome Screen
   ├── App name: Helios
   ├── Version: 1.0.0
   ├── Publisher: Navyug Designs
   └── "Next" button

2. License Agreement Page (CUSTOM with Checkbox)
   ├── Display full license text
   ├── "I accept the terms..." CHECKBOX
   ├── Next button is DISABLED until checkbox is checked
   ├── If unchecked and try to proceed: "You must accept..."
   └── If checked: Proceed to next step

3. Install Directory Selection
   ├── Default: C:\Program Files\Helios
   ├── Browse button to select custom path
   ├── Requires admin permissions
   └── Path validation

4. Installation Progress
   ├── Progress bar (0% → 100%)
   ├── Status messages:
   │   ├── "Extracting application files..."
   │   ├── "Installing resources..."
   │   ├── "Creating shortcuts..."
   │   └── "Installation complete!"
   └── Prevents interruption

5. Completion Screen
   ├── Success message
   ├── ☑ Launch app now (default checked)
   └── "Finish" button
   └── App launches automatically
```

#### Custom NSIS Script: `build/installer.nsh`

Implements checkbox functionality:

```nsis
!include nsDialogs.nsh
!include LogicLib.nsh

Var Checkbox
Var Checkbox_State

!define MUI_PAGE_CUSTOMFUNCTION_SHOW LicenseShow
!define MUI_PAGE_CUSTOMFUNCTION_LEAVE LicenseLeave

Function LicenseShow
    FindWindow $0 "#32770" "" $HWNDPARENT
    GetDlgItem $1 $0 1000
    System::Call "user32::GetWindowRect(i $1, l r1)"
    System::Call "user32::ScreenToClient(i $0, l r1)"
    IntOp $2 $r1 + 16
    ${NSD_CreateCheckbox} 0 $2 100% 12u "I accept the terms of the license agreement"
    Pop $Checkbox
    ${NSD_Check} $Checkbox
    ${NSD_OnClick} $Checkbox OnCheckbox
    GetDlgItem $3 $0 1
    EnableWindow $3 0  ; Initially disabled
FunctionEnd

Function OnCheckbox
    ${NSD_GetState} $Checkbox $Checkbox_State
    FindWindow $0 "#32770" "" $HWNDPARENT
    GetDlgItem $3 $0 1
    ${If} $Checkbox_State == ${BST_CHECKED}
        EnableWindow $3 1  ; Enable Next button
    ${Else}
        EnableWindow $3 0  ; Disable Next button
    ${EndIf}
FunctionEnd

Function LicenseLeave
    ${NSD_GetState} $Checkbox $Checkbox_State
    ${If} $Checkbox_State == ${BST_UNCHECKED}
        MessageBox MB_OK "You must accept the license agreement to continue."
        Abort
    ${EndIf}
FunctionEnd
```

**Key NSIS Functions:**
- `LicenseShow`: Called when license page appears
- `OnCheckbox`: Called when checkbox state changes
- `LicenseLeave`: Validates before leaving license page

### 3.2 macOS PKG Installer

**File**: `electron-builder.yml` → `pkg` section

```yaml
pkg:
  # Installer file name: Helios-1.0.0.pkg
  artifactName: ${name}-${version}.${ext}
  
  # License agreement (standard Agree/Disagree)
  license: build/license.txt
  
  # Installation location (user Applications folder)
  installLocation: ~/Applications
  
  # Flexible installation options
  allowAnywhere: true
  allowCurrentUserHome: true
  
  # Standard macOS installer screens
  welcome: build/welcome.txt
  conclusion: build/conclusion.txt
```

#### macOS PKG Installation Flow
```
1. Welcome Screen
   ├── Shows app name & welcome message
   ├── "Continue" button
   
2. License Agreement Page (STANDARD macOS)
   ├── Displays license.txt content
   ├── Buttons: Print | Save | Disagree | Agree
   ├── Cannot proceed without clicking "Agree"
   ├── NOTE: No custom checkbox possible in macOS PKG
   
3. Installation Type
   ├── Standard installation to ~/Applications
   ├── Option to choose installation location
   
4. Installation Progress
   ├── Progress bar
   ├── Status messages
   
5. Completion Screen
   ├── Success message
   ├── App is now in ~/Applications/Helios.app
```

#### Why ~/Applications Instead of /Applications?

**Reason 1: No Code Signing**
- Unsigned apps cannot write to system `/Applications` directory
- Requires admin elevation and approval prompts
- Installation often fails silently

**Reason 2: User-Friendly**
- User's own Applications folder doesn't need admin
- Faster installation
- Better for development builds

**Reason 3: macOS Security**
- System protections prevent unsigned code in protected directories
- User's home directory has appropriate permissions

**For Production**:
When you have an Apple Developer Certificate (paid):
```yaml
mac:
  identity: "Apple Developer ID" # Your certificate
  sign: true
  notarize: true
```
Then you can use `/Applications`.

### 3.3 macOS DMG Installer

**File**: `electron-builder.yml` → `dmg` section

```yaml
dmg:
  artifactName: ${name}-${version}.${ext}
```

#### macOS DMG Installation Flow
```
1. User downloads Helios-1.0.0.dmg
2. Double-clicks DMG
3. Virtual disk mounts and shows:
   ├── Helios.app (icon)
   └── Applications (folder alias)
4. User drags Helios.app to Applications
5. Installation complete
```

**Advantages for Development:**
- No installer overhead
- Instant mounting
- Perfect for testing
- Shows app immediately

### 3.4 Installation Location Resolution

**macOS Path Resolution:**
```
~/Applications  →  /Users/<username>/Applications
~               →  /Users/<username>
/Applications   →  /Library/Applications (system-wide, requires sudo)
```

---

## Build Configuration Files

### 4.1 Main Configuration: `electron-builder.yml`

**Location**: Project root

**Key Sections:**

```yaml
appId: com.navyug.helios
productName: Helios
copyright: Copyright © 2024 Navyug Designs

directories:
  buildResources: build        # Installer resources (license, icons, etc.)
  output: dist                 # Output directory for installers

files:
  # What to INCLUDE in app bundle
  - '!**/.vscode/*'            # Exclude VS Code config
  - '!src/*'                   # Exclude source code
  # (Only compiled output is included)

extraFiles:
  # Backend folder
  - from: /Users/navyug/PyHelios/Helios-UI/heliosgui-desktop/src-tauri/resources/heliosgui_backend
    to: resources/heliosgui_backend
```

### 4.2 NSIS Script: `build/installer.nsh`

**Location**: `build/installer.nsh`  
**Platform**: Windows only  
**Purpose**: Custom license page with checkbox

**Key Components:**
- License page customization
- Checkbox creation and state management
- Next button enable/disable logic
- User acceptance validation

### 4.3 License File: `build/license.txt`

**Requirements:**
- Plain text format
- Legal EULA content
- Shown to all users during installation
- User must accept before proceeding

### 4.4 Welcome Screen: `build/welcome.txt`

**Shown**: First step of macOS PKG installer

### 4.5 Conclusion Screen: `build/conclusion.txt`

**Shown**: Final step after successful installation on macOS

---

## Installation Process Details

### 5.1 Windows Installation Step-by-Step

#### Prerequisites:
- Windows 7 or later
- Administrator privileges (for system-wide install to Program Files)
- ~150MB free disk space (frontend + backend)

#### Installation Steps:

```
1. User downloads: Helios-1.0.0-setup.exe
2. Double-click to run
3. UAC Prompt: "Allow this app to make changes?"
   → User clicks "Yes"
4. NSIS Installer Launches
   └─ Welcome Screen
      ├─ Shows Helios v1.0.0
      ├─ Publisher: Navyug Designs
      └─ "Next >" button visible
5. License Agreement Page
   ├─ Full license.txt displayed
   ├─ Checkbox: "I accept the terms..."
   ├─ NEXT BUTTON DISABLED (grayed out)
   ├─ User reads and clicks checkbox
   ├─ NEXT BUTTON ENABLED (turns blue)
   └─ User clicks "Next >"
6. Choose Install Location
   ├─ Default: C:\Program Files\Helios
   ├─ "Browse..." button to choose custom path
   ├─ Validates path existence
   └─ "Next >" to proceed
7. Installation Progress
   ├─ Progress bar fills
   ├─ Status updates:
   │  ├─ "Extracting files..." (20%)
   │  ├─ "Installing frontend..." (60%)
   │  ├─ "Installing backend..." (80%)
   │  ├─ "Creating shortcuts..." (95%)
   │  └─ "Installation complete!" (100%)
   └─ Cannot be canceled
8. Installation Complete
   ├─ Success message
   ├─ ☑ "Launch Helios now" (checked)
   ├─ "Finish" button
   └─ Clicking Finish → App launches
9. App Launches
   ├─ Helios window opens
   ├─ Frontend loads
   ├─ Backend available in resources/
   └─ Desktop shortcut created
```

#### Files Created:
```
C:\Program Files\Helios\
├── Helios.exe                          (main app)
├── resources\
│   ├── heliosgui_backend\              (Python backend)
│   └── [other assets]
├── [Electron Runtime Files]
└── [Dependencies]

Desktop\
└── Helios.lnk                          (shortcut)

Start Menu\
└── Navyug Designs\
    └── Helios.lnk                      (shortcut)
```

### 5.2 macOS Installation Step-by-Step

#### Prerequisites:
- macOS 10.12 or later
- ~150MB free disk space
- For unsigned apps: User must confirm app opening first time

#### Installation Steps:

```
1. User downloads: Helios-1.0.0.pkg
2. Double-click to run
3. Install Assistant Launches
   └─ Welcome Screen
      ├─ Shows welcome message
      └─ "Continue" button
4. License Agreement Page
   ├─ Full license.txt displayed
   ├─ Buttons: Print | Save | Disagree | Agree
   ├─ User reads and clicks "Agree"
   └─ Info: Cannot proceed without agreeing
5. Installation Type
   ├─ Default location: ~/Applications
   ├─ Click "Change Install Location..." to choose
   └─ "Continue" to proceed
6. Installation Progress
   ├─ Progress bar
   ├─ Status: "Installing Helios..."
   └─ Estimated time remaining
7. Installation Complete
   ├─ Completion screen
   ├─ App is at: ~/Applications/Helios.app
   └─ "Close" button
8. User Launches App
   ├─ Open ~/Applications/
   ├─ Double-click Helios.app
   ├─ First Run: "macOS cannot verify developer..."
   │  └─ Click "Open anyway" (for unsigned app)
   └─ App launches with full access to backend
```

#### Files Created:
```
~/Applications/
└── Helios.app/
    ├── Contents/
    │   ├── MacOS/
    │   │   └── Helios              (executable)
    │   ├── Resources/
    │   │   ├── heliosgui_backend/  (Python backend)
    │   │   └── [assets]
    │   ├── Frameworks/             (Electron runtime)
    │   └── Info.plist              (app metadata)
    └── [supporting files]
```

### 5.3 macOS DMG Installation Step-by-Step

```
1. User downloads: Helios-1.0.0.dmg
2. Double-click DMG
3. Virtual disk mounts in Finder
   └─ Window shows:
      ├── Helios.app icon
      ├── Applications folder (alias)
      └── README (optional)
4. User drags Helios.app → Applications
5. File copies to ~/Applications/Helios.app
6. Done! User closes DMG
7. User opens ~/Applications/Helios.app to run
```

---

## Troubleshooting Guide

### 6.1 Windows NSIS Issues

#### Issue: "Next" button not appearing/not clickable on License page

**Possible Causes:**
- NSIS script not properly included in build
- Old cached build files

**Solution:**
```bash
# Clean build
npm run build
rm -rf dist/
npm run package:win
```

#### Issue: Checkbox not showing on license agreement

**Possible Causes:**
- `build/installer.nsh` not properly formatted
- NSIS version incompatibility

**Solution:**
1. Verify `build/installer.nsh` exists and contains checkbox code
2. Check NSIS include statement in `electron-builder.yml`:
   ```yaml
   nsis:
     include: build/installer.nsh
   ```
3. Rebuild: `npm run package:win`

#### Issue: Installation fails with "Access Denied"

**Possible Causes:**
- User not running as Administrator
- Antivirus blocking installation
- Insufficient disk space

**Solution:**
- Right-click .exe → "Run as Administrator"
- Temporarily disable antivirus
- Ensure 200MB+ free space

#### Issue: Backend files not included in installation

**Possible Causes:**
- Source path incorrect in `electron-builder.yml`
- Backend folder doesn't exist

**Solution:**
1. Verify backend folder exists:
   ```bash
   ls /Users/navyug/PyHelios/Helios-UI/heliosgui-desktop/src-tauri/resources/heliosgui_backend
   ```
2. Check exact path in `electron-builder.yml`
3. Rebuild: `npm run package`

### 6.2 macOS PKG Issues

#### Issue: "Cannot verify developer" warning on first run

**Why**: App is unsigned (unsigned development build)

**Solution**:
1. Click "Open" in the warning dialog
2. Or right-click app → "Open" → "Open"
3. App will run normally after first confirmation

**For Production**: Obtain Apple Developer Certificate and enable code signing in `electron-builder.yml`

#### Issue: Installation to /Applications fails

**Possible Causes:**
- No admin privileges
- App is unsigned
- macOS security restrictions

**Why it fails**:
- Unsigned apps cannot write to system directories
- macOS protects `/Applications` from non-admin modifications

**Solution**:
The current configuration installs to `~/Applications` instead, which:
- Works without admin rights
- Doesn't require code signing
- Is user-friendly for development

**For System-Wide Install**:
To install to `/Applications`, you need:
```yaml
mac:
  identity: "Developer ID Application: Your Name (XXXXXXXXXX)"
  sign: true
  notarize: true
```
Then change `pkg.installLocation` to `/Applications`.

#### Issue: PKG installer shows no license checkbox/buttons

**Why**: macOS PKG format limitation

**Fact**: macOS PKG installers do NOT support custom checkboxes. They show standard:
- Print button
- Save button  
- Disagree button
- Agree button

**Windows** (NSIS) supports custom checkboxes. **macOS** (PKG) does not.

**Solution**: This is expected behavior. No code change needed.

#### Issue: Application doesn't appear in Applications folder after install

**Possible Causes:**
- Installation path was customized
- User's home path has special characters
- File permissions issue

**Solution:**
1. Check where it installed:
   ```bash
   find ~/ -name "Helios.app" -type d
   ```
2. Look in:
   - `~/Applications/Helios.app`
   - `/Applications/Helios.app`
   - Custom path if selected
3. If not found, reinstall and check install location selection

### 6.3 General Issues

#### Issue: Installer not created/blank dist folder

**Possible Causes:**
- Build failed silently
- node_modules missing
- Invalid configuration

**Solution:**
```bash
# Clean everything
rm -rf dist/ out/ node_modules/

# Reinstall
npm install

# Rebuild
npm run build
npm run package
```

#### Issue: Backend processes don't start from installer application

**Possible Causes:**
- Backend path incorrect at runtime
- Backend executable permissions lost
- Backend not included in extraFiles

**Solution:**
1. Verify backend copied to installer:
   ```bash
   # After installation, check Windows:
   ls "C:\Program Files\Helios\resources\heliosgui_backend"
   
   # Or macOS:
   ls ~/Applications/Helios.app/Contents/Resources/heliosgui_backend
   ```
2. In Electron main process:
   ```javascript
   const backendPath = path.join(app.getAppPath(), 'resources', 'heliosgui_backend');
   console.log('Backend location:', backendPath);
   ```
3. Ensure backend executable has permissions:
   ```bash
   # On macOS/Linux
   chmod +x backend_executable
   ```

#### Issue: License agreement not shown

**Possible Causes:**
- `build/license.txt` doesn't exist
- Path incorrect in configuration

**Solution:**
1. Create/verify `build/license.txt`:
   ```bash
   ls -la build/license.txt
   ```
2. Verify configuration:
   ```yaml
   nsis:
     license: build/license.txt
   pkg:
     license: build/license.txt
   ```
3. Add proper license content to file

### 6.4 Version-Specific Notes

**electron-builder v24.13.3** (current):
- Full NSIS support with custom scripts
- macOS PKG and DMG support
- Asset inclusion via extraFiles working correctly

**Node.js v22+** (required):
- Compatible with all build tools
- TypeScript compilation working

---

## Build & Distribution Commands

### 7.1 Development Build

```bash
# Install dependencies (first time only)
npm install

# Run in development mode (not as installer)
npm run dev

# Test application before packaging
npm run preview
```

### 7.2 Production Build

```bash
# Complete build for all platforms
npm run package

# Windows installer only
npm run package:win

# Windows portable executable (no installer)
npm run package:win-portable

# macOS (DMG + PKG)
npm run package && electron-builder --mac

# Linux (AppImage + deb)
npm run package && electron-builder --linux
```

### 7.3 Build Output

When `npm run package` completes:

```
dist/
├── Helios-1.0.0-setup.exe         (Windows NSIS installer)
├── Helios-1.0.0.dmg               (macOS drag-drop installer)
├── Helios-1.0.0.pkg               (macOS package installer)
├── Helios-1.0.0.AppImage          (Linux AppImage)
├── Helios-1.0.0-x.x.x.deb         (Linux deb package)
├── mac-arm64/                     (macOS build artifacts)
│   ├── Helios.app/               (macOS application bundle)
│   └── [supporting files]
├── win-unpacked/                 (Windows build artifacts)
└── [other platform artifacts]
```

### 7.4 Distribution Checklist

Before releasing installer:

- [ ] Version number updated in `package.json`
- [ ] License agreement updated in `build/license.txt`
- [ ] Welcome screen text in `build/welcome.txt`
- [ ] Conclusion screen text in `build/conclusion.txt`
- [ ] Backend path verified in `electron-builder.yml`
- [ ] All tests passing: `npm run test`
- [ ] E2E tests passing: `npm run e2e`
- [ ] No console errors in development: `npm run dev`
- [ ] Build completes without warnings
- [ ] Installer files generated in `dist/`
- [ ] App launches correctly after installation on test machine
- [ ] Backend accessible from installed app

### 7.5 Build Optimization

For faster builds during development:

```bash
# Skip code signing (development only)
# Already configured: identity: null

# Skip notarization (development only)
# Already configured: notarize: false

# NPM rebuild disabled (already set)
# Reason: resources/heliosgui_backend is pre-compiled
npmRebuild: false
```

### 7.6 Signing & Notarization (Production)

For production releases with code signing:

**Windows:**
```javascript
// In electron-builder.yml
win: {
  certificateFile: "/path/to/certificate.pfx",
  certificatePassword: "password",
  signingHashAlgorithms: ["sha256"]
}
```

**macOS:**
```yaml
mac:
  identity: "Developer ID Application: Company (XXXXXXXXXX)"
  sign: true
  notarize: true
  notarize:
    teamId: "XXXXXXXXXX"
```

---

## Version History & Updates

### v1.0.0 (March 27, 2026)

**Features Implemented:**
- Windows NSIS installer with license checkbox
- macOS PKG installer with standard agreement
- Backend inclusion in all installers
- Professional multi-step installation wizard
- Automatic app launch after installation

**Known Limitations:**
- macOS PKG doesn't support custom checkboxes (OS limitation)
- Requires Microsoft Store to run unsigned Windows installer on Windows 11
- macOS apps appear with "unverified developer" on first run (unsigned)

**Future Improvements:**
- Apple Developer Certificate for code signing
- Windows EV Code Signing Certificate
- Automated builds and release pipeline
- Update mechanism (auto-update framework)

---

## Appendix: Configuration Reference

### File Structure

```
project-root/
├── build/
│   ├── installer.nsh           (Windows NSIS customization)
│   ├── license.txt             (License agreement text)
│   ├── welcome.txt             (macOS welcome screen)
│   ├── conclusion.txt          (macOS completion screen)
│   └── icon.ico               (Windows icon)
├── electron-builder.yml        (Installer configuration)
├── package.json                (Project metadata)
├── dist/                       (Generated installers)
│   ├── Helios-1.0.0-setup.exe
│   ├── Helios-1.0.0.dmg
│   ├── Helios-1.0.0.pkg
│   └── [other files]
├── out/                        (Compiled frontend)
│   ├── main/
│   ├── preload/
│   └── renderer/
└── src/                        (Source code - not in installer)
```

### Key Configuration Options Explained

| Option | Value | Effect |
|--------|-------|--------|
| `oneClick` | false | Multi-step wizard (not auto-install) |
| `allowToChangeInstallationDirectory` | true | User can select install path |
| `perMachine` | true | Install for all users (not just current user) |
| `createDesktopShortcut` | true | Add app to Desktop |
| `createStartMenuShortcut` | true | Add app to Start Menu |
| `runAfterFinish` | true | Launch app after installation |
| `allowAnywhere` | true (macOS) | User can choose any location |
| `allowCurrentUserHome` | true (macOS) | Can install in user's home folder |

---

## Contact & Support

For issues or questions:
1. Check Troubleshooting Guide (Section 6)
2. Review Build Configuration (Section 4)
3. Verify Installation Steps (Section 5)
4. Check file paths match your system

---

**Document Generated**: March 27, 2026  
**Last Updated**: March 27, 2026  
**Maintainer**: Navyug Designs
