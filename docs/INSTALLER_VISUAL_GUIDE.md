# Helios Installer - Visual & UI Guide

**Last Updated**: March 27, 2026  
**Project**: Helios Desktop Application  
**Purpose**: Step-by-step visual walkthrough of installer on all platforms

---

## Table of Contents

1. [Windows Installer Flow](#windows-installer-flow)
2. [macOS PKG Installer Flow](#macos-pkg-installer-flow)
3. [macOS DMG Installer Flow](#macos-dmg-installer-flow)
4. [Complete Application File Structure](#complete-application-file-structure)
5. [UI Components Breakdown](#ui-components-breakdown)
6. [Pre & Post Installation States](#pre--post-installation-states)
7. [Platform Comparison](#platform-comparison)
8. [User Scenarios](#user-scenarios)

---

## Windows Installer Flow

### Step 1: Welcome Screen

```
╔════════════════════════════════════════════════════════════════╗
║  Helios Setup                                    ─ □ ✕        ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║                    🎯 HELIOS v1.0.0                           ║
║                                                                ║
║              Professional Desktop Application                  ║
║              Developed by: Navyug Designs                      ║
║                                                                ║
║         This will install Helios on your computer.             ║
║                                                                ║
║         Click "Next" to continue, or "Cancel" to exit.         ║
║                                                                ║
║                                                                ║
║                                                                ║
║                         [< Back]  [Next >]  [Cancel]          ║
╚════════════════════════════════════════════════════════════════╝

USER SEES:
✓ Application name: "Helios"
✓ Version: "v1.0.0"
✓ Developer: "Navyug Designs"
✓ Welcoming message
✓ Action buttons: Back (grayed), Next (blue), Cancel (red)

USER ACTIONS:
→ Click "Next >" to proceed
```

### Step 2: License Agreement Page

```
╔════════════════════════════════════════════════════════════════╗
║  Helios Setup - License Agreement               ─ □ ✕        ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Do you accept the terms of the license agreement?             ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ END USER LICENSE AGREEMENT                                 │ ║
║  │                                                            │ ║
║  │ This Software is provided "AS-IS" without warranty of   │ ║
║  │ any kind, either express or implied.                    │ ║
║  │                                                            │ ║
║  │ TERMS AND CONDITIONS:                                    │ ║
║  │ 1. Installation and Use...                               │ ║
║  │ 2. Restrictions...                                       │ ║
║  │ 3. Limitations of Liability...                           │ ║
║  │ 4. Termination...                                        │ ║
║  │                                                            │ ║
║  │ [Scroll down for more content...]                        │ ║
║  │                                                            │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  ☐ I accept the terms of the license agreement               ║
║                                                                ║
║     🔴 NEXT BUTTON IS DISABLED (Grayed Out)                   ║
║                                                                ║
║                                                                ║
║                         [< Back]  [Next >]  [Cancel]          ║
║                                  (disabled)                    ║
╚════════════════════════════════════════════════════════════════╝

INITIAL STATE:
✓ License text displayed (scrollable)
✓ Checkbox UNCHECKED: "☐ I accept the terms..."
✗ "Next >" button DISABLED (grayed out)

USER READS LICENSE AND CHECKS CHECKBOX:
↓
```

### Step 2b: License Agreement After Checkbox Checked

```
╔════════════════════════════════════════════════════════════════╗
║  Helios Setup - License Agreement               ─ □ ✕        ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Do you accept the terms of the license agreement?             ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ [License text scrolled down...]                           │ ║
║  │                                                            │ ║
║  │ 5. Governing Law: These terms shall be governed by...   │ ║
║  │ 6. Entire Agreement: This constitutes the entire...     │ ║
║  │                                                            │ ║
║  │ END OF LICENSE AGREEMENT                                 │ ║
║  │                                                            │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  ☑ I accept the terms of the license agreement               ║
║     (User clicked checkbox)                                   ║
║                                                                ║
║     🟢 NEXT BUTTON IS ENABLED (Bright Blue)                   ║
║                                                                ║
║                                                                ║
║                         [< Back]  [ Next >]  [Cancel]         ║
║                                   (enabled)                    ║
╚════════════════════════════════════════════════════════════════╝

AFTER CHECKBOX TICKED:
✓ Checkbox CHECKED: "☑ I accept the terms..."
✓ "Next >" button ENABLED (bright blue, clickable)

USER CLICKS "NEXT >"
↓
```

### Step 3: Choose Install Location

```
╔════════════════════════════════════════════════════════════════╗
║  Helios Setup - Choose Install Folder          ─ □ ✕        ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Where do you want to install Helios?                         ║
║                                                                ║
║  Install Folder:                                              ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ C:\Program Files\Helios                                   │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  Disk space required: 250 MB                                  ║
║  Disk space available: 1.2 TB ✓                               ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ Installation will contain:                                │ ║
║  │ • Helios Application (Frontend)                           │ ║
║  │ • Python Backend (heliosgui_backend/)                     │ ║
║  │ • All Dependencies                                        │ ║
║  │ • System Integration (Shortcuts, Etc.)                    │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  [ Browse... ]  (Allows choosing custom path)                 ║
║                                                                ║
║                                                                ║
║                         [< Back]  [ Next >]  [Cancel]         ║
╚════════════════════════════════════════════════════════════════╝

SHOWN HERE:
✓ Default installation path: C:\Program Files\Helios
✓ Disk space info (Required vs Available)
✓ Preview of what will be installed
✓ "Browse" button to change path

DEFAULT LOCATION:
C:\Program Files\Helios\
└── Helios.exe (main app)
└── resources\heliosgui_backend\ (Python backend)
└── [other runtime files]

USER CLICKS "NEXT >"
↓
```

### Step 4: Installation Progress

```
╔════════════════════════════════════════════════════════════════╗
║  Helios Setup - Installing                    ─ □ ✕        ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Helios is being installed, please wait...                    ║
║                                                                ║
║  ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ║
║  56%  Installation Progress                   ETA: 2 min     ║
║                                                                ║
║  Current Task:                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ Installing resources...                                  │ ║
║  │                                                            │ ║
║  │ • Extracting application files... ✓ DONE                │ ║
║  │ • Installing frontend... ✓ DONE                         │ ║
║  │ • Installing backend... ⧐ IN PROGRESS                  │ ║
║  │ • Creating shortcuts... ⧐ QUEUED                        │ ║
║  │ • Finalizing installation... ⧐ QUEUED                  │ ║
║  │                                                            │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  [Cancel]  (may not fully cancel after start)               ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

PROGRESS UPDATES:
1. § 0% → "Extracting application files..."
2. ┃ 20% → "Extracting frontend..."
3. █ 40% → "Installing dependencies..."
4. █ 60% → "Installing frontend..."
5. █ 80% → "Installing backend..."
6. █ 95% → "Creating shortcuts..."
7. █ 100% → "Installation complete!"

⏱ Typical duration: 1-3 minutes depending on system
⚠ Cannot cancel after 30 seconds (files already copied)

AUTOMATIC NEXT STEP AFTER 100%
↓
```

### Step 5: Installation Complete

```
╔════════════════════════════════════════════════════════════════╗
║  Helios Setup - Complete                       ─ □ ✕        ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║                    ✓ INSTALLATION SUCCESSFUL                  ║
║                                                                ║
║              Helios v1.0.0 has been installed!                 ║
║                                                                ║
║    Application Location: C:\Program Files\Helios              ║
║    Backend Location: C:\Program Files\Helios\resources\       ║
║                      heliosgui_backend                        ║
║                                                                ║
║  ☑ Launch Helios now (default checked)                        ║
║                                                                ║
║  Installation includes:                                       ║
║  ✓ Desktop Shortcut                                           ║
║  ✓ Start Menu Item                                            ║
║  ✓ Uninstall Option in Control Panel                         ║
║                                                                ║
║  Thank you for choosing Helios!                               ║
║                                                                ║
║                                                                ║
║                              [ Finish ]                        ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

SHOWS:
✓ Success message
✓ Installation paths confirmed
✓ Checkbox: "Launch Helios now" (checked by default)
✓ Installed components listed

USER CLICKS "FINISH"
↓ (If "Launch Helios now" is checked)
↓ Application automatically launches
```

### Step 5b: App Auto-Launches

```
After clicking "Finish", user sees:

┌──────────────────────────┐
│      HELIOS v1.0.0      │
│                          │
│   [Helios Logo]          │
│                          │
│                          │
│   [Frontend Interface    │
│    Loading...]           │
│                          │
│   Backend initializing...│
│                          │
└──────────────────────────┘

✓ Main window opens
✓ React UI loads
✓ Backend resources available at:
   C:\Program Files\Helios\resources\heliosgui_backend\

✓ Desktop Shortcut Created:
   Desktop\Helios.lnk → C:\Program Files\Helios\Helios.exe

✓ Start Menu Entry Created:
   Start Menu → Navyug Designs → Helios.lnk

INSTALLATION COMPLETE! 
```

---

## macOS PKG Installer Flow

### Step 1: Welcome Screen

```
╔═══════════════════════════════════════════════════════════╗
║  Helios Installer                              [×]        ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║              Welcome to the Helios Installer             ║
║                                                           ║
║        This installer will guide you through the         ║
║        installation of Helios v1.0.0 on your Mac.        ║
║                                                           ║
║        Helios is a professional desktop application       ║
║        developed by Navyug Designs.                       ║
║                                                           ║
║        To continue, click the "Continue" button.          ║
║                                                           ║
║                                                           ║
║                                                           ║
║                  [ Go Back ]  [ Continue ]                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

macOS Native Style:
• System font (San Francisco)
• Standard macOS buttons
• Minimalist design
• Confirm/Cancel layout

USER CLICKS "CONTINUE"
↓
```

### Step 2: License Agreement Page

```
╔═══════════════════════════════════════════════════════════╗
║  Helios Installer - License Agreement          [×]        ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║           License Agreement for Helios v1.0.0            ║
║                                                           ║
║  Please read the following license agreement carefully.   ║
║                                                           ║
║  ┌──────────────────────────────────────────────────────┐║
║  │ END USER LICENSE AGREEMENT                            │║
║  │                                                        │║
║  │ This software is licensed, not sold. By installing   │║
║  │ and using this software, you agree to the terms of  │║
║  │ this license agreement.                              │║
║  │                                                        │║
║  │ 1. LICENSE GRANT                                      │║
║  │    Navyug Designs grants you a limited,             │║
║  │    non-exclusive license to use this software...    │║
║  │                                                        │║
║  │ 2. RESTRICTIONS                                       │║
║  │    You may not reverse engineer, decompile...       │║
║  │                                                        │║
║  │ 3. WARRANTY DISCLAIMER                               │║
║  │    THIS SOFTWARE IS PROVIDED "AS-IS" WITHOUT        │║
║  │    WARRANTY...                                        │║
║  │                                                        │║
║  │ [Scroll down for more...]                            │║
║  │                                                        │║
║  └──────────────────────────────────────────────────────┘║
║                                                           ║
║  ⚠️  NOTE: macOS STANDARD LICENSE BOX                     ║
║  ☐ Buttons: [Print]  [Save...]  [Disagree]  [Agree]    ║
║                                                           ║
║  🔴 IMPORTANT: No custom checkbox available in macOS    ║
║     PKG format. Standard buttons shown instead.          ║
║                                                           ║
║       [ Go Back ]     [Disagree]  [Agree]                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

⚠️ KEY DIFFERENCE FROM WINDOWS:
❌ NO custom checkbox available in macOS PKG
✓ STANDARD macOS license buttons shown:
   • [Print] - Print license to paper
   • [Save...] - Save license as PDF
   • [Disagree] - Cancel installation
   • [Agree] - Accept and continue

BUTTONS SHOWN IN WINDOW:
Mac Native Style Buttons:
┌─────────────┐  ┌─────────────┐
│    Print    │  │    Save     │
└─────────────┘  └─────────────┘
┌─────────────┐  ┌─────────────┐
│  Disagree   │  │    Agree    │
└─────────────┘  └─────────────┘

USER CLICKS "AGREE"
↓
```

### Step 3: Installation Type

```
╔═══════════════════════════════════════════════════════════╗
║  Helios Installer - Installation Type          [×]        ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║           Select Installation Location                   ║
║                                                           ║
║  Easy Install:                                            ║
║  Installs Helios with all standard options.              ║
║                                                           ║
║  Install Location:                                        ║
║  ┌──────────────────────────────────────────────────────┐║
║  │ Applications ▼                                        │║
║  │ (/Users/username/Applications)                       │║
║  │                                                        │║
║  │ [ Change Install Location... ]                       │║
║  │                                                        │║
║  │ Installation will require: ~250 MB                   │║
║  │ Available: ~1.2 TB ✓                                 │║
║  │                                                        │║
║  │ Installation Contents:                               │║
║  │ • Helios Application (Frontend)                      │║
║  │ • Python Backend (heliosgui_backend)                 │║
║  │ • All Dependencies                                   │║
║  │ • System Integration                                 │║
║  │                                                        │║
║  └──────────────────────────────────────────────────────┘║
║                                                           ║
║       [ Go Back ]  [ Continue ]                           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

DEFAULT LOCATION:
~/Applications/Helios.app
(User's personal Applications folder)

⚠️ NOT /Applications (system folder)
   ✓ Why: Unsigned app, no admin rights needed
   ✓ Benefit: Can install without admin password
   ✓ User-friendly: Respects macOS security model

ALTERNATE PATH (If user clicks "Change Install Location..."):
/Applications/Helios.app (requires admin, code signing)
~/Desktop/Helios.app (alternative)
/Custom/Path/Helios.app (user's choice)

USER CLICKS "CONTINUE"
↓
```

### Step 4: Installation Progress

```
╔═══════════════════════════════════════════════════════════╗
║  Helios Installer                              [×]        ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║              Installing Helios v1.0.0...                 ║
║                                                           ║
║  ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ║
║  62%   Estimated time remaining: 1 minute 45 seconds    ║
║                                                           ║
║  Current Activity:                                        ║
║  Installing package resources...                         ║
║                                                           ║
║  [Authenticating... might prompt for password]           ║
║                                                           ║
║                                                           ║
║                                                           ║
║  Installation cannot be interrupted after it starts.     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

PROGRESS SEQUENCE:
1. Preparing for installation
2. Validating package
3. Installing files (0% → 50%)
4. Installing frontend (50% → 70%)
5. Installing backend (70% → 90%)
6. Finalizing (90% → 100%)

⏱ Typical duration: 2-4 minutes

POSSIBLE PROMPT:
┌─────────────────────────────────────┐
│ Password Required                   │
├─────────────────────────────────────┤
│ The install process needs your     │
│ password to write to the           │
│ Applications folder.               │
│                                     │
│ Password: [_________________]      │
│                                     │
│     [Cancel]     [OK]              │
└─────────────────────────────────────┘

User enters macOS password to proceed.

AUTOMATIC NEXT STEP AFTER 100%
↓
```

### Step 5: Installation Complete

```
╔═══════════════════════════════════════════════════════════╗
║  Helios Installer                              [×]        ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║              Installation Complete!                      ║
║                                                           ║
║  Helios v1.0.0 has been successfully installed.           ║
║                                                           ║
║  Installation Location:                                   ║
║  /Users/username/Applications/Helios.app                 ║
║                                                           ║
║  You can now find Helios in:                             ║
║  • Applications folder (via Finder)                       ║
║  • Launchpad                                             ║
║  • Spotlight (Cmd + Space)                               ║
║                                                           ║
║  To launch Helios for the first time:                    ║
║  1. Open Finder → Applications                           ║
║  2. Right-click Helios.app → Open                        ║
║     (For unsigned apps, bypass security)                 ║
║                                                           ║
║  Questions? Visit: helios-docs.navyug.com                ║
║                                                           ║
║                      [ Close ]                            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

SHOWS:
✓ Success message
✓ Installation location confirmed
✓ How to launch the app
✓ Note about first-run security prompt

USER CLICKS "CLOSE"
↓ Installer window closes
↓ PKG installer completes
↓ No auto-launch (unlike Windows)
↓ User manually launches from Applications folder
```

### Step 5b: First App Launch (macOS Security Prompt)

```
When user first launches Helios:

┌─────────────────────────────────────────────┐
│ macOS Cannot Verify Developer              │
├─────────────────────────────────────────────┤
│                                             │
│ "Helios" cannot be opened because the      │
│ developer cannot be verified.              │
│                                             │
│ macOS cannot verify that this app is free  │
│ from malware.                              │
│                                             │
│ [Open System Settings] [Cancel] [Open]    │
│                                             │
└─────────────────────────────────────────────┘

⚠️ Why This Appears:
   • App is unsigned (no Apple Developer Certificate)
   • macOS 10.15+ shows this for unsigned apps
   • Normal for development builds
   • NOT a security risk, just a notification

SOLUTIONS:

Option 1: Click "Open" (Easiest)
→ App launches normally, security remembered for future

Option 2: Right-click → Open
→ Same effect as "Open" button

Option 3: Security Settings
→ Settings → Security & Privacy → Allow
→ More complex, not needed

AFTER FIRST LAUNCH:
✓ App never shows this again
✓ Helios runs normally
✓ Full access to backend at:
   ~/Applications/Helios.app/Contents/Resources/heliosgui_backend/


APP WINDOW OPENS:

┌──────────────────────────────────────┐
│         HELIOS v1.0.0               │
├──────────────────────────────────────┤
│                                      │
│   ╔══════════════════════════════╗  │
│   ║  Helios Dashboard            ║  │
│   ║                              ║  │
│   ║  [Frontend Interface         ║  │
│   ║   Rendered from React]       ║  │
│   ║                              ║  │
│   ║  Backend: Ready ✓            ║  │
│   ║  Status: Running             ║  │
│   ║                              ║  │
│   ╚══════════════════════════════╝  │
│                                      │
└──────────────────────────────────────┘

✓ Installation Complete, App Running!
```

---

## macOS DMG Installer Flow

### Step 1: Download & Mount DMG

```
File System Before:
┌─ Desktop/
│  └─ Helios-1.0.0.dmg (240 MB image file)
└─ Applications/
   └─ (empty - will add app here)

USER DOUBLE-CLICKS: Helios-1.0.0.dmg
↓
```

### Step 2: Virtual Disk Mounts

```
STEP 1: DMG Mounts in Finder

┌────────────────────────────────────────┐
│  Finder Window: Helios 1.0.0           │
├────────────────────────────────────────┤
│                                        │
│  📁 Helios 1.0.0 (Virtual Mounted)     │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │                                  │ │
│  │   [Helios.app Icon]              │ │
│  │      Helios.app                  │ │
│  │   (Application Bundle)           │ │
│  │                                  │ │
│  │   ──────────────────────────     │ │
│  │                                  │ │
│  │   [Applications Folder Alias]    │ │
│  │   Applications →                 │ │
│  │   (Points to /Applications)      │ │
│  │                                  │ │
│  │   ──────────────────────────     │ │
│  │                                  │ │
│  │   [ Optional: README.txt ]       │ │
│  │                                  │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Path: /Volumes/Helios 1.0.0/         │
└────────────────────────────────────────┘

MOUNTED CONTENTS:
• Helios.app               → Complete application bundle
• Applications (shortcut)  → Link to /Applications folder
• README (optional)        → Installation instructions
```

### Step 3: User Drags App to Applications

```
STEP 2: User Drags Helios.app → Applications

    BEFORE                    ACTION                    AFTER
┌──────────────────┐      Hold & Drag        ┌──────────────────┐
│ DMG Volume       │      Release at         │ Applications     │
├──────────────────┤      Applications       ├──────────────────┤
│ ┌──────────────┐ │                         │ ┌──────────────┐  │
│ │ Helios.app   │─┼──────────────────────>  │ │ Helios.app   │  │
│ │ 240 MB       │ │                         │ │ (Copied)     │  │
│ └──────────────┘ │                         │ └──────────────┘  │
│                  │        Copy Progress:    │                  │
│ Applications     │        ████████░░░░░░░░  │ (Other apps)     │
│ (alias)          │        Copying: 180 MB/ │                  │
│                  │        240 MB (75%)      │                  │
│ README.txt       │                         │                  │
└──────────────────┘                         └──────────────────┘

⏱ Duration: ~30-60 seconds (depending on disk speed)
```

### Step 4: Installation Complete

```
STEP 3: Verify Installation

Finder Window After:
┌────────────────────────────────────────┐
│ Applications                           │
├────────────────────────────────────────┤
│                                        │
│ ┌──────────────────────────────────┐  │
│ │ [Helios.app Icon]                │  │
│ │ Helios.app                       │  │
│ │                                  │  │
│ │ (Application Bundle - 240 MB)    │  │
│ │ ✓ Ready to run                   │  │
│ │                                  │  │
│ └──────────────────────────────────┘  │
│                                        │
│ (Other system applications)            │
│                                        │
└────────────────────────────────────────┘

VERIFICATION:
✓ File System Location: /Applications/Helios.app
✓ Size: ~240 MB
✓ Type: Application Bundle
✓ Contains:
   ├─ Helios executable
   ├─ Resources/ (frontend assets)
   ├─ Resources/heliosgui_backend/ (backend)
   └─ Frameworks/ (Electron runtime)

USER CAN NOW:
1. Close DMG window
2. Eject DMG: Right-click Helios volume → Eject
3. Delete DMG file (optional, safe to keep)
4. Launch app from Applications
```

### Step 5: User Launches Application

```
STEP 4: Launch Helios

From Applications Folder:
1. Open Finder
2. Navigate to Applications
3. Find Helios.app
4. Double-click Helios.app
   OR
   Right-click → Open (for unsigned app)

↓

First Run Security Check:
┌──────────────────────────────────┐
│ macOS Cannot Verify Developer    │
│ "Helios" cannot be opened.       │
│                                  │
│ [Cancel] [Open]                  │
└──────────────────────────────────┘

User clicks "Open" → App launches

↓

Application Window Opens:
┌────────────────────────────────────┐
│         HELIOS v1.0.0             │
├────────────────────────────────────┤
│                                    │
│  Helios is now running!            │
│  Frontend loaded from bundle       │
│  Backend resources accessible      │
│                                    │
│  ✓ Installation Complete           │
│                                    │
└────────────────────────────────────┘
```

---

## Complete Application File Structure

### Windows Installation Directory

After installation, Windows file system contains:

```
C:\ (Windows Drive)
└── Program Files\
    └── Helios\                          (Installation Root)
        ├── Helios.exe                   (Main Executable)
        ├── resources\                   (App Resources)
        │   ├── heliosgui_backend\       (Python Backend)
        │   │   ├── main.exe             (Backend executable)
        │   │   ├── library\
        │   │   ├── config\
        │   │   └── data\
        │   └── (other frontend assets)
        ├── locales\                     (Electron i18n)
        ├── [Electron runtime files]
        └── [Dependencies]

Desktop\
└── Helios.lnk                          (Shortcut to Helios.exe)

C:\Users\<username>\AppData\Roaming\Microsoft\Windows\
Start Menu\Programs\Navyug Designs\
└── Helios.lnk                          (Start Menu Shortcut)

Control Panel (Programs):
└── Helios v1.0.0 (Can uninstall from here)
```

### macOS Installation Directory

After installation, macOS file system contains:

```
/Users/<username>/  (User's Home)
└── Applications\
    └── Helios.app\                      (Application Bundle)
        ├── Contents\
        │   ├── MacOS\
        │   │   └── Helios               (Executable)
        │   ├── Resources\               (App Resources)
        │   │   ├── heliosgui_backend\   (Python Backend)
        │   │   │   ├── binary           (Backend executable)
        │   │   │   ├── lib\
        │   │   │   ├── config\
        │   │   │   └── data\
        │   │   ├── assets\
        │   │   └── (Frontend files)
        │   ├── Frameworks\              (Electron runtime)
        │   ├── Info.plist               (App metadata)
        │   ├── PkgInfo
        │   └── [Other metadata]
        ├── _CodeSignature/              (Code signing metadata)
        └── (Hidden metadata files)

Accessible from:
• /Applications/Helios.app (symlink to above)
• Spotlight Search (Cmd + Space, type "Helios")
• Launchpad
• Finder → Applications
```

### Linux Installation Directory

```
/opt/
└── Helios\                             (Installation Root)
    ├── helios                          (Executable)
    ├── resources\                      (App Resources)
    │   ├── heliosgui_backend\          (Python Backend)
    │   │   ├── helios-backend          (Executable)
    │   │   ├── lib\
    │   │   └── config\
    │   └── (Frontend assets)
    ├── locales\
    └── (Dependencies)

Desktop Entry:
~/.local/share/applications/
└── helios.desktop                      (App Launcher)

Accessible:
• Applications Menu
• Command line: helios
• Desktop icon (if created)
```

---

## UI Components Breakdown

### Download Button & File

```
BEFORE INSTALLATION

┌─ Web Browser / Download Portal
│  ├─ "Download Helios" button
│  └─ Shows platform options:
│     ├─ Windows (Helios-1.0.0-setup.exe)
│     ├─ macOS PKG (Helios-1.0.0.pkg)
│     ├─ macOS DMG (Helios-1.0.0.dmg)
│     └─ Linux (AppImage / deb)

Downloads Folder Before:
┌─ Downloads/
│  ├─ [Other files]
│  └─ Helios-1.0.0-setup.exe (280 MB)  ← Recently downloaded

File Properties (Windows)
┌────────────────────────────────────┐
│ Helios-1.0.0-setup.exe Properties │
├────────────────────────────────────┤
│ Type: Application                  │
│ Size: 280 MB                       │
│ Created: 2026-03-27                │
│ Status: ✓ Safe to open             │
│                                    │
│ Double-click to run installer      │
└────────────────────────────────────┘
```

### License Agreement Component

#### Windows (NSIS) - WITH Checkbox

```
License View Component:
┌──────────────────────────────────────────────────────────┐
│ License Text Display Area                               │
│ ┌────────────────────────────────────────────────────┐ │
│ │ END USER LICENSE AGREEMENT                        │ │
│ │                                                    │ │
│ │ 1. DEFINITIONS                                   │ │
│ │    "Software" means the Helios application...   │ │
│ │                                                    │ │
│ │ 2. LICENSE GRANT                                 │ │
│ │    Navyug Designs grants you a license...       │ │
│ │                                                    │ │
│ │ [Can scroll down]                                │ │
│ │ ─── END ───                                      │ │
│ │                                                    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ Acceptance Control:                                      │
│ ☑ I accept the terms of the license agreement           │
│   (Checkbox with label)                                 │
│                                                          │
│ Button States:                                           │
│ [< Back]  [ Next > ENABLED*]  [Cancel]                 │
│           * Only enabled when checkbox checked          │
│                                                          │
│ Warning (if unchecked + try Next):                      │
│ ⚠️ "You must accept the license to continue"            │
│    [OK]                                                  │
│                                                          │
└──────────────────────────────────────────────────────────┘

States:
• Unchecked (Initial) → Next button DISABLED
• After scroll (Checking progress) → Still DISABLED
• After check → Next button ENABLED
• After uncheck → Next button DISABLED again
```

#### macOS (PKG) - Standard Buttons

```
∴ Note: macOS PKG has built-in license display
     (Cannot be modified by developers)

┌──────────────────────────────────────────────────────────┐
│ License View Component                                   │
│ ┌────────────────────────────────────────────────────┐  │
│ │ [Same license text content]                       │  │
│ │ [Scrollable]                                      │  │
│ │                                                    │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ Standard Buttons (macOS Native):                         │
│ [Print]  [Save...]  [Disagree]  [Agree]                │
│                                                          │
│ Each button action:                                      │
│ • Print: Opens print dialog                            │
│ • Save: Shows save as dialog (PDF)                     │
│ • Disagree: Cancels installation                       │
│ • Agree: Proceeds to next step                         │
│                                                          │
│ ⚠️ Custom checkbox NOT possible in macOS PKG format      │
│    This is a system limitation, not a bug              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Progress Bar Animation

```
STATE 1: Initial (0%)
┌────────────────────────────────────┐
│ █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│ 0%  Initializing...                │
└────────────────────────────────────┘

STATE 2: Extraction (20%)
┌────────────────────────────────────┐
│ █████░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│ 20%  Extracting files...           │
└────────────────────────────────────┘

STATE 3: Frontend Install (50%)
┌────────────────────────────────────┐
│ ███████████░░░░░░░░░░░░░░░░░░░░░  │
│ 50%  Installing frontend...        │
└────────────────────────────────────┘

STATE 4: Backend Install (70%)
┌────────────────────────────────────┐
│ █████████████████░░░░░░░░░░░░░░░  │
│ 70%  Installing backend...         │
└────────────────────────────────────┘

STATE 5: Finalization (90%)
┌────────────────────────────────────┐
│ ██████████████████████▒░░░░░░░░░░  │
│ 90%  Creating shortcuts...         │
└────────────────────────────────────┘

STATE 6: Complete (100%)
┌────────────────────────────────────┐
│ ████████████████████████████████████│
│ 100% Installation complete!        │
└────────────────────────────────────┘
```

---

## Pre & Post Installation States

### File System State Comparison

#### BEFORE Installation

```
C:\ (Windows)
├── Program Files\
│   ├── [Other apps]
│   └── ❌ NO Helios folder
├── Users\
│   └── <username>\
│       ├── Desktop\
│       │   └── ❌ NO Helios.lnk
│       └── [Other items]
└── [System folders]

Desktop:
├── ❌ NO Helios shortcut
└── [Other shortcuts]

Start Menu:
├── Programs\
│   ├── [System programs]
│   └── ❌ NO Navyug Designs\Helios
└── [Other items]

macOS Before:
/Users/<username>/
├── Applications/
│   ├── [System apps]
│   └── ❌ NO Helios.app
└── [Other folders]

Register (Windows):
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\
├── [Other programs]
└── ❌ NO Helios entry
```

#### AFTER Installation

```
C:\ (Windows)
├── Program Files\
│   ├── [Other apps]
│   └── ✓ Helios\ (240 MB)
│       ├── Helios.exe
│       ├── resources\heliosgui_backend\
│       └── [Runtime files]
├── Users\
│   └── <username>\
│       ├── Desktop\
│       │   └── ✓ Helios.lnk
│       └── [Other items]
└── [System folders]

Desktop:
├── ✓ Helios shortcut (blue icon)
└── [Other shortcuts]

Start Menu:
├── Programs\
│   ├── [System programs]
│   └── ✓ Navyug Designs\
│       └── Helios.lnk
└── [Other items]

macOS After:
/Users/<username>/
├── Applications/
│   ├── [System apps]  
│   └── ✓ Helios.app (240 MB)
│       └── Contents\Resources\heliosgui_backend\
└── [Other folders]

Registry (Windows):
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\
├── [Other programs]
└── ✓ com.navyug.helios (Helios uninstall entry)
```

### Environment Changes

```
AFTER INSTALLATION - Environment Ready:

1. Executable Available:
   • Windows: C:\Program Files\Helios\Helios.exe exists
   • macOS: ~/Applications/Helios.app/Contents/MacOS/Helios exists
   • Linux: /opt/Helios/helios exists

2. Resources Accessible:
   • Frontend assets loaded from bundle
   • Backend at: <app>/resources/heliosgui_backend/
   • Backend executable can be spawned
   • IPC communication configured

3. System Integration:
   • Shortcuts created
   • App indexed by system search
   • Uninstall option available
   • Registry entries (Windows) created

4. File Permissions:
   • App executable bit set
   • Backend executable has permissions
   • Resources readable by app process
   • No permission errors on launch
```

---

## Platform Comparison

### Feature Matrix

| Feature | Windows NSIS | macOS PKG | macOS DMG | Linux AppImage |
|---------|------------|-----------|-----------|---|
| **License Checkbox** | ✅ YES (Custom) | ❌ NO (Buttons) | N/A (Drag-drop) | N/A |
| **Multi-Step Wizard** | ✅ YES (5 steps) | ✅ YES (4 steps) | N/A (Manual) | N/A |
| **Custom Install Path** | ✅ YES (Browse) | ✅ YES (Browse) | ✅ YES (User drag) | N/A |
| **License Required** | ✅ YES | ✅ YES | N/A | N/A |
| **Auto-Launch After** | ✅ YES | ❌ NO (Manual) | N/A (Manual) | N/A |
| **Desktop Shortcut** | ✅ Auto-created | ❌ Manual | N/A | ✅ Auto |
| **Start Menu Entry** | ✅ Auto-created | N/A | N/A | ✅ App Menu |
| **Admin Required** | ⚠️ YES (for /Program Files) | ⚠️ Optional | N/A | N/A |
| **Code Signing** | ⚠️ Optional | ⚠️ Optional | N/A | N/A |
| **Installation Time** | ~2-3 min | ~2-3 min | ~1 min | ~1 min |
| **File Size** | ~280 MB | ~250 MB | ~240 MB | ~200 MB |

### User Experience Comparison

| Aspect | Windows | macOS PKG | macOS DMG |
|--------|---------|-----------|-----------|
| **Ease of Use** | 🟢 Simple | 🟢 Simple | 🔵 Slightly Manual |
| **Professional Feel** | 🟢 Very Pro | 🟢 Very Pro | 🟡 Standard |
| **Checkbox Support** | 🟢 YES | 🔴 NO | N/A |
| **Speed** | 🟡 2- 3 min | 🟡 2-3 min | 🟢 30-60 sec |
| **System Integration** | 🟢 Full | 🟡 Partial | 🔴 Manual |
| **Learning Curve** | 🟢 Easy | 🟢 Easy | 🟡 Needs instruction |

### When to Use Each

**Windows NSIS (.exe):**
- Production releases
- Enterprise deployments
- Professional users
- Need license agreement enforcement
- Want auto-launch capability

**macOS PKG (.pkg):**
- Production releases on macOS
- System-level integration
- Professional presentation
- When you have admin rights

**macOS DMG (.dmg):**
- Development/testing
- Quick distribution
- When admin rights not available
- Zero-friction for developers

**Linux AppImage (.AppImage):**
- Development/testing
- Cross-distribution support
- portability without installer

---

## User Scenarios

### Scenario 1: First-Time Windows User

```
1. User downloads Helios-1.0.0-setup.exe
   ├─ Checks file size (280 MB - reasonable)
   └─ Double-clicks exe

2. UAC Prompt appears
   ├─ User clicks "Yes" (may not understand, but expected)
   └─ Installer launches

3. Welcome screen shown
   ├─ User reads "Professional Application"
   ├─ Clicks "Next"
   └─ Proceeds to License page

4. License Agreement appears
   ├─ User sees LONG license text
   ├─ Doesn't read completely (normal!)
   ├─ Checkbox unchecked
   ├─ Tries to click "Next" → Button disabled!
   ├─ User realizes: "I need to CHECK the checkbox"
   ├─ Scrolls through text
   ├─ Checks "I accept..."
   ├─ "Next" button becomes blue/enabled
   └─ Clicks "Next"

5. Choose Install Location
   ├─ Default path shown: C:\Program Files\Helios
   ├─ User sees disk space info
   ├─ Proceeds with default
   └─ Clicks "Next"

6. Installation Progress
   ├─ Sees progress bar filling
   ├─ Reads status messages
   ├─ Waits ~2-3 minutes
   ├─ Sees "100% Installation complete!"
   └─ Auto-advances to completion screen

7. Installation Complete
   ├─ Sees "Launch Helios now" checked
   ├─ Clicks "Finish"
   ├─ App launches automatically
   ├─ Sees Helios window open
   ├─ Desktop shortcut created
   ├─ Start Menu entry created
   └─ SUCCESS! ✓

OUTCOME: Helios running, shortcuts available, everything works
```

### Scenario 2: First-Time macOS User

```
1. User downloads Helios-1.0.0.pkg
   ├─ Checks file size (250 MB)
   └─ Double-clicks pkg file

2. Installer launches
   ├─ macOS style installer appears
   └─ Welcome screen shown

3. License Agreement appears
   ├─ User sees license text
   ├─ Standard macOS buttons: Print / Save / Disagree / Agree
   ├─ User may click "Print" (printing the license)
   ├─ Or "Save..." (saving as PDF)
   ├─ Eventually clicks "Agree"
   └─ Proceeds

4. Installation Type
   ├─ Shows: "~/Applications" (default)
   ├─ User can click "Change Install Location"
   ├─ Chooses to keep default
   ├─ May see password prompt (to write to Applications)
   ├─ User enters macOS password
   └─ Clicks "Continue"

5. Installation Progress
   ├─ Progress bar fills
   ├─ Sees "Installing Helios..."
   ├─ Waits ~2-3 minutes
   └─ Completes

6. Completion Screen
   ├─ Shows: "Installation Complete"
   ├─ Tells user app is at ~/Applications/Helios.app
   ├─ Instructions: "Use Finder or Spotlight to launch"
   └─ User clicks "Close"

7. Manual App Launch (User's Next Step)
   ├─ User opens Finder
   ├─ Navigates to Applications
   ├─ Double-clicks Helios.app
   ├─ Security prompt appears: "Cannot verify developer"
   ├─ User clicks "Open"
   ├─ App launches
   └─ SUCCESS! ✓

OUTCOME: Helios running, app in Applications folder

NOTE: macOS process is more manual than Windows,
      but just as straightforward for users
```

### Scenario 3: DMG Installation (Developer)

```
1. Developer downloads Helios-1.0.0.dmg (for testing)
   ├─ File is 240 MB (smaller than .pkg)
   └─ Double-clicks it

2. DMG mounts immediately
   ├─ New volume appears in Finder: "Helios 1.0.0"
   ├─ Contains: Helios.app + Applications folder alias
   ├─ Very fast (instant!)
   └─ No "installation" step needed

3. Developer drags Helios.app to Applications folder
   ├─ Drag-and-drop behavior (intuitive!)
   ├─ Progress bar shows copy progress
   ├─ ~30-60 seconds later: Done
   └─ Helios.app now in ~/Applications

4. Developer closes DMG window
   ├─ Right-clicks volume on desktop
   ├─ Selects "Eject"
   ├─ DMG disappears
   ├─ (Optional: Delete dmg file)
   └─ Keeps only ~/Applications/Helios.app

5. Developer launches Helios
   ├─ Double-clicks ~/Applications/Helios.app
   ├─ Security prompt (one-time)
   ├─ Clicks "Open"
   ├─ App launch
   └─ SUCCESS! ✓

OUTCOME: Quick, manual, developer-friendly installation+
TIME SAVED: ~1 minute vs. full PKG installer
```

### Scenario 4: Troubleshooting - Windows Installation Fails

```
PROBLEM: User sees "Installation failed" error

Steps to debug:

1. Check File Integrity
   └─ File size: Should be ~280 MB
   └─ CRC check passed: Verify download correct

2. Run as Administrator (Required!)
   ├─ Right-click Helios-1.0.0-setup.exe
   ├─ Select "Run as Administrator"
   ├─ UAC prompts: Click "Yes"
   ├─ Retry installation
   └─ Usually works!

3. Disk Space Check
   ├─ Right-click C:\ Drive
   ├─ Check "Free Space"
   ├─ Need: ~250 MB minimum
   ├─ If low: Delete temporary files.
   └─ Retry

4. Antivirus Interference
   ├─ Some antivirus blocks .exe execution
   ├─ Temporarily disable antivirus
   ├─ Run installer
   ├─ Re-enable antivirus after
   └─ Whitelist Helios.exe if needed

5. Port Conflict (if backend starts)
   ├─ Backend may use specific port
   ├─ Check if port already in use
   ├─ Change port configuration if needed
   └─ Reinstall

6. Full Uninstall + Reinstall
   ├─ Control Panel → Programs → Helios
   ├─ Click "Uninstall"
   ├─ Follow prompts
   ├─ Delete C:\Program Files\Helios\ (if remains)
   ├─ Restart computer
   ├─ Download fresh installer
   ├─ Run as admin
   └─ Clean install usually fixes issues

OUTCOME: Installing correctly or identifying root cause
```

---

## Detailed Component Reference

### NSIS Checkbox Implementation

```nsis
Function LicenseShow
  # Called when license page appears
  
  FindWindow $0 "#32770" "" $HWNDPARENT
  # Find the dialog window
  
  GetDlgItem $1 $0 1000
  # Get license text control (ID 1000)
  
  System::Call "user32::GetWindowRect(i $1, l r1)"
  # Get text control rectangle
  
  System::Call "user32::ScreenToClient(i $0, l r1)"
  # Convert to client coordinates
  
  IntOp $2 $r1 + 16
  # Calculate checkbox position (below license text)
  
  ${NSD_CreateCheckbox} 0 $2 100% 12u "I accept the terms of the license agreement"
  # Create checkbox with label
  
  Pop $Checkbox
  # Store checkbox handle
  
  ${NSD_Check} $Checkbox
  # (Could start checked, but left unchecked)
  
  ${NSD_OnClick} $Checkbox OnCheckbox
  # Register click handler
  
  GetDlgItem $3 $0 1
  # Get "Next" button (ID 1)
  
  EnableWindow $3 0
  # Disable it initially (grayed out)
FunctionEnd

Function OnCheckbox
  # Called each time checkbox state changes
  
  ${NSD_GetState} $Checkbox $Checkbox_State
  # Get current checkbox state
  
  FindWindow $0 "#32770" "" $HWNDPARENT
  # Find dialog window
  
  GetDlgItem $3 $0 1
  # Get "Next" button
  
  ${If} $Checkbox_State == ${BST_CHECKED}
    # If checkbox is checked
    EnableWindow $3 1
    # Enable Next button (bright blue)
  ${Else}
    # If checkbox is unchecked
    EnableWindow $3 0
    # Disable Next button (grayed)
  ${EndIf}
FunctionEnd

Function LicenseLeave
  # Called when user tries to leave license page
  
  ${NSD_GetState} $Checkbox $Checkbox_State
  # Get checkbox state
  
  ${If} $Checkbox_State == ${BST_UNCHECKED}
    # If NOT checked
    MessageBox MB_OK "You must accept the license agreement to continue."
    # Show error message
    Abort
    # Block page change
  ${EndIf}
  # If checked, allow proceeding
FunctionEnd
```

---

## Summary Quick Reference

| OS | Installer | License | Checkbox | Install Path | Time | Auto-Launch |
|----|-----------|---------|----------|--------------|------|-------------|
| Windows | .exe (NSIS) | Required | ✅ YES | User choice | 2-3 min | ✅ Auto |
| macOS | .pkg | Required | ❌ NO | User choice | 2-3 min | ❌ Manual |
| macOS | .dmg | N/A | N/A | User drag | 1 min | ❌ Manual |
| Linux | AppImage | N/A | N/A | User choice | 1 min | ❌ Manual |

---

**Document Generated**: March 27, 2026  
**Last Updated**: March 27, 2026  
**Version**: 1.0  
**Purpose**: Complete visual and technical reference for Helios installer
