# Helios Windows Installer: Implementation Guide

## Overview

This document explains the professional Windows installer implementation for Helios Electron application using electron-builder with NSIS (Nullsoft Scriptable Install System).

---

## Part 1: Core Requirements & Architecture

### 1.1 Why NSIS + electron-builder?

**NSIS (Nullsoft Scriptable Install System)**
- Industry standard for Windows installers (used by VS Code, Audacity, WinRAR)
- Lightweight (~30KB), no additional runtime needed
- Full customization via scripts
- Supports multi-step UI flows

**electron-builder Integration**
- Automatically packages Electron app for NSIS
- Handles code signing and validation
- Manages digital certificates
- Simplifies deployment pipeline

### 1.2 Assisted Installer Model (vs One-Click)

| Feature | One-Click | Assisted |
|---------|-----------|----------|
| User steps | 1 (accept + install) | 4-5 (welcome→license→directory→install→complete) |
| License agreement | ❌ Cannot enforce | ✅ Mandatory acceptance |
| Install directory | ❌ Fixed (System-determined) | ✅ User selectable |
| UX professionalism | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Control | Low | High |

**For Helios: Assisted is chosen because:**
- Legal compliance (EULA requirement)
- User flexibility (custom install path)
- Professional appearance
- Industry standard

### 1.3 Installer Flow: Step-by-Step

```
┌─────────────────┐
│  Windows User   │
│  Runs .exe      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ STEP 1: Welcome Screen      │
│ ✓ App name & version        │
│ ✓ Branding                  │
│ ✓ "Next" button             │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ STEP 2: License Agreement   │
│ ✓ Show EULA (license.txt)   │
│ ✓ Scrollable content        │
│ ✓ "I Agree" checkbox        │
│ ✓ Next button disabled until checked │
│ ✓ BLOCKS if not accepted    │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ STEP 3: Choose Directory    │
│ ✓ Default: C:\Program...    │
│ ✓ Browse button             │
│ ✓ Path validation           │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ STEP 4: Install Progress    │
│ ✓ Progress bar              │
│ ✓ Status messages:          │
│   - Extracting files        │
│   - Installing resources    │
│   - Creating shortcuts      │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ STEP 5: Completion          │
│ ✓ Success message           │
│ ✓ ☑ Launch app now          │
│ ✓ View readme (optional)    │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────┐
│ App Launches    │
└─────────────────┘
```

---

## Part 2: Configuration Details

### 2.1 electron-builder.yml Configuration

```yaml
nsis:
  # === Type: Assisted vs One-Click ===
  oneClick: false
  # Effect: When false, enables multi-step UI
  # When true, skips all dialogs and installs immediately
  # CRITICAL: Must be false for license agreement to appear
  
  # === License Enforcement ===
  license: build/license.txt
  # Effect: Displays EULA in step 2
  # User CANNOT proceed without accepting
  # File must be plain text, UTF-8 encoded
  
  # === Directory Selection ===
  allowToChangeInstallationDirectory: true
  # Effect: Shows directory selection dialog
  # User can browse and select custom path
  # Default: C:\Program Files\Helios (Windows 64-bit)
  
  # === Permissions Model ===
  perMachine: true
  # Effect: Installs for all users on computer
  # Alternative: false = installs for current user only
  # Recommended: true (matches VS Code, Slack, etc.)
  
  allowElevation: true
  # Effect: Allows UAC (User Access Control) elevation prompt
  # Necessary for installing to C:\Program Files\ (admin-protected)
  # When false: User must manually run as admin
  
  # === Shortcuts ===
  createDesktopShortcut: true
  # Effect: Places shortcut on user's desktop
  
  createStartMenuShortcut: true
  # Effect: Creates Start Menu entry for app launch
  
  shortcutName: Helios
  # Effect: Display name for shortcuts
  
  # === Auto-Launch ===
  runAfterFinish: true
  # Effect: Automatically launches app after installation
  # User sees app start without manual action
  # Professional UX indicator

---

## Part 3: Backend and Frontend Inclusion

### 3.1 Frontend Build
The installer automatically includes the complete frontend build from the current Electron project:
- Built using `electron-vite build`
- Includes all React components, assets, and main process files
- Packaged into the app bundle

### 3.2 Backend Inclusion
The Python backend is included via `extraFiles` configuration:
```
extraFiles:
  - from: /Users/navyug/PyHelios/Helios-UI/heliosgui-desktop/src-tauri/resources/heliosgui_backend
    to: resources/heliosgui_backend
```
- Copies the entire backend directory into the app's resources folder
- Available at runtime for the Electron app to launch or interact with

### 3.3 Complete Package
The installer now contains:
- ✅ Electron frontend application
- ✅ Python backend binaries and files
- ✅ All dependencies and resources
- ✅ Professional installer UI with license checkbox

---

## Part 4: Cross-Platform Support

### 4.1 Windows Installer
- Uses NSIS with custom license page including checkbox
- Assisted installation with directory selection
- Includes both frontend and backend

### 4.2 Mac Installer
- Uses PKG installer with license agreement
- **Note**: macOS PKG installers do not support custom checkboxes in license page
- License is shown with standard "Agree/Disagree" buttons (no checkbox)
- For unsigned development builds, installs to ~/Applications (user's Applications folder)
- Includes both frontend and backend in the app bundle

### 4.3 Building the Installer
To create the complete installer:
```bash
# Build for current platform
npm run package

# Build for Windows
npm run package:win

# Build for Mac
npm run package && electron-builder --mac
```

The resulting installer will contain both frontend and backend, ready for distribution.
  
  # === Branding ===
  installerIcon: build/icon.ico
  # Effect: Icon displayed in installer window title bar
  # Also shown in Add/Remove Programs list
  
  uninstallerIcon: build/icon.ico
  # Effect: Icon in Uninstall dialog
  
  installerHeaderIcon: build/icon.ico
  # Effect: Icon at top of each installer page
  # Visual branding consistency
  
  # === Advanced Customization ===
  include: build/installer.nsh
  # Effect: Injects custom NSIS script
  # Allows advanced behavior & UI customization
```

### 2.2 Key Configuration Values Explained

**oneClick: false**
```
❌ oneClick: true
   └─ User clicks Next once, install happens
   └─ Cannot show license agreement
   └─ Cannot select install directory
   └─ Not recommended for commercial apps

✅ oneClick: false
   └─ Multi-step wizard interface
   └─ User accepts license first
   └─ User selects install path
   └─ Professional installer experience
```

**perMachine: true**
```
Installation Scope Comparison:
┌──────────────────┬──────────────────┬──────────────────┐
│ Setting          │ perMachine: true │ perMachine: false│
├──────────────────┼──────────────────┼──────────────────┤
│ Install Path     │ C:\Program Files │ C:\Users\[User]\ │
│ Admin Required   │ Yes (UAC prompt) │ No               │
│ Shared Among     │ All users        │ Current user only│
│ Recommended For  │ Enterprise       │ Personal tools   │
│ Examples         │ VS Code, Office  │ Portable apps    │
└──────────────────┴──────────────────┴──────────────────┘
```

**allowToChangeInstallationDirectory: true**
```
Directory Selection Behavior:

If true:
  Step 3 shows: "Choose Installation Directory"
  User can browse and select: D:\MyApps\Helios
  Advanced users benefit from flexibility
  
If false:
  No directory selection dialog
  Install path is fixed/system-determined
  Reduces user confusion (not for Helios)
```

---

## Part 3: Required Assets

### 3.1 License File: `build/license.txt`

**Location:** `/Users/navyug/helios_gui/build/license.txt`

**Requirements:**
- ✅ Plain text format (.txt)
- ✅ UTF-8 encoding
- ✅ ~1-2 pages ideal (don't exceed 10 pages)
- ✅ Include copyright, disclaimers, restrictions
- ⚠️ NOT compiled/binary format

**What's Included:**
```
1. Grant of License
2. Restrictions (what users cannot do)
3. Intellectual Property Rights
4. Disclaimers & Warranties
5. Limitation of Liability
6. Termination Conditions
7. Governing Law
```

**In Installer:**
- Step 2 displays content in scrollable window
- User MUST ☑ "I Agree" to proceed
- User cannot bypass acceptance

### 3.2 Icons: `build/icon.ico`

**Location:** `/Users/navyug/helios_gui/build/icon.ico`

**Requirements:**
- ✅ Windows ICO format (.ico)
- ✅ At least 256×256 pixels
- ✅ Include multiple sizes: 256x256, 128x128, 64x64, 32x32, 16x16
- ✅ Support transparency (32-bit RGBA)

**Used For:**
- Installer window title bar
- Uninstall dialog
- Shortcuts (desktop, Start Menu)
- Add/Remove Programs list

**How to Create:**
```bash
# Option 1: Online converter (iconconverter.com)
# Upload PNG → Download ICO

# Option 2: ImageMagick (CLI)
convert icon.png -define icon:auto-resize=256,128,64,32,16 icon.ico

# Option 3: Inkscape or Photoshop
# Export→ICO format with multiple sizes
```

### 3.3 Optional: Installer Sidebar Image

**File:** `build/installer-sidebar.bmp`

**Optional Enhancement:**
```
If you want branded installer sidebar (left panel):
  nsis:
    installerSidebar: build/installer-sidebar.bmp
```

**Specs:**
- 164 × 314 pixels
- BMP format
- Your logo/branding graphics

---

## Part 4: Installation Directory Layout

### 4.1 After Installation on Windows

```
C:\Program Files\Helios\
│
├── Helios.exe                    ← Main application
├── resources\
│   ├── app.asar                  ← Bundled app code
│   ├── icon.ico                  ← App icon
│   └── [other assets]
│
├── LICENSE.txt                   ← License info
├── Uninstall Helios.exe          ← Uninstaller
│
└── [Additional electron files]

Windows Registry Entries Created:
├── HKEY_LOCAL_MACHINE\Software\Helios\    (app settings)
└── HKEY_LOCAL_MACHINE\Software\Microsoft\  (Add/Remove Programs)
    └── Windows\CurrentVersion\Uninstall\Helios

Shortcuts Created:
├── Desktop:
│   └── Helios.lnk
│
└── Start Menu > Programs:
    └── Helios
        ├── Helios.lnk
        ├── Uninstall.lnk
        └── [Optional: Readme.lnk]
```

### 4.2 Post-Install Runtime

```
User clicks desktop shortcut or Start Menu > Helios

├── Electron main process starts
│   └── Reads app.asar
│
├── Renderer process initializes (React UI)
│
├── FastAPI backend starts as child process
│   └── Binds to localhost:[PORT]
│   └── Initializes database
│       └── %APPDATA%\Helios\  (userData directory)
│
└── App connection established
    └── Renderer communicates with backend via IPC
    └── UI displays fully
```

---

## Part 5: Implementation Files

### 5.1 Files Created/Modified

| File | Purpose | Status |
|------|---------|--------|
| `build/license.txt` | EULA displayed in step 2 | ✅ Created |
| `build/installer.nsh` | Custom NSIS script | ✅ Created |
| `electron-builder.yml` | Main config | ✅ Updated |
| `package.json` | Build scripts | ✅ Updated |
| `build/icon.ico` | App icon *(TO CREATE)* | ⏳ TODO |

### 5.2 electron-builder.yml Changes Summary

```yaml
BEFORE:
-------
nsis:
  oneClick: not specified (defaults to true - one-click)
  license: not specified (no license shown)
  allowToChangeInstallationDirectory: not specified (false)
  createDesktopShortcut: always (shown)

AFTER:
------
nsis:
  oneClick: false                          ← CRITICAL: Enable multi-step
  license: build/license.txt              ← Show EULA (mandatory)
  allowToChangeInstallationDirectory: true ← User can pick path
  perMachine: true                         ← All users on computer
  allowElevation: true                     ← Allow admin UAC prompt
  createDesktopShortcut: true
  createStartMenuShortcut: true            ← NEW: Start Menu entry
  runAfterFinish: true                     ← Auto-launch after install
  installerIcon: build/icon.ico            ← Branding icons
  uninstallerIcon: build/icon.ico
  installerHeaderIcon: build/icon.ico
  include: build/installer.nsh             ← Custom NSIS script
```

---

## Part 6: Testing & Validation

### 6.1 Pre-Build Checklist

- [ ] `build/license.txt` exists (plain text, UTF-8)
- [ ] `build/icon.ico` exists (256×256 minimum, ICO format)
- [ ] `build/installer.nsh` exists (NSIS script)
- [ ] `electron-builder.yml` has `oneClick: false`
- [ ] `productName: Helios` in electron-builder.yml
- [ ] All dependencies installed: `npm install`

### 6.2 Build Command

```bash
# Build for Windows with NSIS installer
npm run package:win

# Or manually:
npm run build
electron-builder --win --publish never
```

**Expected Output:**
```
  distPath=...
  outDir=dist
  
  • building NSIS installer
    • Helpers
    • License
    • Custom script
  
  ✓ built successfully
  dist/Helios-1.0.0-setup.exe
  dist/Helios-1.0.0-setup.exe.blockmap
```

### 6.3 Testing the Installer

```bash
# 1. Run the installer
dist/Helios-1.0.0-setup.exe

# 2. Verify Step 1: Welcome Screen
   ✓ Shows "Helios" name
   ✓ Shows version 1.0.0
   ✓ "Next" button visible
   ✓ App icon displayed

# 3. Verify Step 2: License
   ✓ License text scrolls
   ✓ Can accept with checkbox
   ✓ Cannot proceed without acceptance
   ✓ "I Agree" checkbox blocks next

# 4. Verify Step 3: Directory Selection
   ✓ Shows default: C:\Program Files\Helios
   ✓ Can click "Browse"
   ✓ Can select custom path (e.g., D:\MyApps\Helios)
   ✓ Shows selected path

# 5. Verify Step 4: Install Progress
   ✓ Progress bar animates 0-100%
   ✓ Status messages appear
   ✓ Files extract to chosen directory

# 6. Verify Step 5: Completion
   ✓ Success message appears
   ✓ "Launch application" checkbox available
   ✓ Finish button completes installation

# 7. Verify Post-Install
   ✓ Files exist in C:\Program Files\Helios\
   ✓ Desktop shortcut created
   ✓ Start Menu entry exists
   ✓ App launches upon completion (if checked)
   ✓ Backend starts successfully
   ✓ No errors in Event Viewer
```

### 6.4 Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| License page doesn't appear | `oneClick: true` | ✅ Set `oneClick: false` |
| Can't change install path | `allowToChangeInstallationDirectory: false` | ✅ Set to `true` |
| No desktop shortcut | `createDesktopShortcut: false` | ✅ Set to `true` (done) |
| Installer fails silently | Invalid icon.ico | ✅ Create valid 256×256 ICO with multiple sizes |
| Permission error on install | `allowElevation: false` | ✅ Set to `true` |
| App doesn't launch at end | `runAfterFinish: false` | ✅ Set to `true` (done) |
| License.txt not found | Wrong path | ✅ Ensure `build/license.txt` exists |
| Icon not shown in installer | Invalid location | ✅ Use `build/icon.ico` path |

---

## Part 7: Build Script Commands

### 7.1 Available Commands

```bash
# Development (hot reload)
npm run dev

# Production build
npm run build

# Build + Package for Windows (NSIS installer)
npm run package:win

# Build + Package portable executable (no installer)
npm run package:win-portable

# Build + Package all platforms
npm run package

# Run tests
npm run test
npm run test:watch
npm run test:coverage

# Code quality
npm run lint
npm run lint:fix
npm run format
```

### 7.2 Full Build Pipeline

```bash
# Step 1: Ensure dependencies installed
npm install

# Step 2: Run tests (optional but recommended)
npm run test

# Step 3: Build + Create NSIS installer
npm run package:win

# Step 4: Installer is in:
# dist/Helios-1.0.0-setup.exe

# Step 5: Test the installer manually (see 6.3)
```

---

## Part 8: What electron-builder Does Automatically

### 8.1 Automated NSIS Handling

When you run `npm run package:win`, electron-builder:

```
1. ✅ Compiles React → JavaScript
2. ✅ Bundles code into app.asar
3. ✅ Bundles electron executable
4. ✅ Reads electron-builder.yml config
5. ✅ Generates default NSIS installer script
6. ✅ Applies nsis settings:
   - oneClick: false
   - license: build/license.txt
   - allowToChangeInstallationDirectory: true
   - icons, shortcuts, branding
7. ✅ Includes custom script: build/installer.nsh
8. ✅ Runs NSIS.exe (must be installed on Windows)
9. ✅ Creates dist/Helios-1.0.0-setup.exe
10. ✅ Signs executable (if certificate configured)
```

### 8.2 What You Don't Need to Do

- ❌ Write full NSIS script (electron-builder generates base)
- ❌ Manually compile MSI (NSIS generates .exe)
- ❌ Handle registry entries (NSIS manages)
- ❌ Create uninstaller (NSIS auto-generates)
- ❌ Manage shortcuts (handled by config)

---

## Part 9: Installer vs Portable Executable

### 9.1 Comparison

| Feature | NSIS Installer (.exe) | Portable Executable (.exe) |
|---------|----------------------|---------------------------|
| Size | ~50-100MB | ~50-100MB (same) |
| Installation Required | ✅ Yes | ❌ No (run directly) |
| Shortcuts | ✅ Desktop + Start Menu | ❌ Manual creation |
| Registry Entries | ✅ Yes (uninstall info) | ❌ None |
| Uninstaller | ✅ Yes | ❌ Manual deletion |
| License Agreement | ✅ Can show | ❌ Cannot show |
| Professional Feel | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Enterprise | ✅ Recommended | ❌ Not recommended |
| Use Case | Standard application | Utilities, portable tools |

**For Helios: Use NSIS installer** (current setup)

---

## Part 10: Next Steps

### 10.1 Immediate Actions

1. **Create `build/icon.ico`**
   - Export app logo as PNG
   - Convert to ICO (256×256 minimum)
   - Save as `/Users/navyug/helios_gui/build/icon.ico`

2. **Test build process:**
   ```bash
   npm run build        # Build React + Electron
   npm run package:win  # Create installer
   ```

3. **Verify installer:**
   - Run `dist/Helios-*.exe`
   - Walk through all 5 steps
   - Verify shortcuts created
   - Check installed files

### 10.2 Production Readiness

For enterprise deployment:
- [ ] Code signing certificate (Trusted CA)
- [ ] AutoUpdate configuration
- [ ] Crash reporting
- [ ] Analytics
- [ ] Multi-language support (i18n)

### 10.3 Maintenance & Future

```
After first release:
├── Version bump in package.json
├── Update CHANGELOG.md
├── Update license if legal changes
├── Test new installer with each release
└── Monitor user feedback for UX improvements
```

---

## Summary: Files You Created

✅ **`build/license.txt`**
- Professional EULA
- Enforced during installation
- Customizable per jurisdiction

✅ **`build/installer.nsh`**
- Custom NSIS script
- Prepared for advanced customization
- Includes detailed comments

✅ **Updated `electron-builder.yml`**
- Multi-step installer enabled
- Professional Windows installer
- Complete NSIS configuration

✅ **Updated `package.json`**
- Correct app name: "helios"
- New build scripts: `package:win`, `package:win-portable`
- Updated description

⏳ **TODO: Create `build/icon.ico`**
- Essential for final branding
- 256×256 pixels minimum
- ICO format with multiple sizes

---

## Industry Standards Reference

Your installer matches professional standards of:
- VS Code
- Slack
- Postman
- Discord
- Steam

All use:
- ✅ Multi-step installation
- ✅ License agreement screens
- ✅ Directory selection
- ✅ Progress indication
- ✅ Auto-launch capability

---

## Questions?

Reference this guide for:
- ✅ Understanding NSIS configuration
- ✅ Troubleshooting installation issues
- ✅ Customizing installer behavior
- ✅ Building for different platforms
- ✅ Industry best practices

---

**Document Version:** 1.0  
**Created:** 2024  
**For:** Helios Desktop Application v1.0.0
