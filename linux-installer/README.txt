===============================================================
  Helios Desktop — Linux Installation Guide
===============================================================

This folder contains three ways to install Helios on Linux.
Pick the one that suits you best.

---------------------------------------------------------------
  FILES IN THIS FOLDER
---------------------------------------------------------------

  HeliosInstaller-1.0.0.run   Interactive installer (with EULA
                              and location picker)

  helios-1.0.0.deb            Debian package for apt / Software
                              Center (Ubuntu, Debian, Mint,
                              Pop!_OS, elementary)

  helios-1.0.0.AppImage       Portable single-file executable
                              (no install required, any distro)

  HeliosInstaller.desktop     Launcher shortcut for the .run
                              (optional, see OPTION 1B below)


===============================================================
  OPTION 1A — Interactive installer from terminal (recommended)
===============================================================

This is the most reliable way. Open a terminal in this folder
and run:

    chmod +x HeliosInstaller-1.0.0.run
    ./HeliosInstaller-1.0.0.run

You will be asked to:
  1. Accept the license agreement
  2. Choose an install location (default: ~/.local/opt/Helios)
  3. Enter your sudo password (to configure Chromium sandbox)

If you cancel the password prompt, Helios will still install
and work — it will just run with the --no-sandbox flag.


===============================================================
  OPTION 1B — Interactive installer from file manager
===============================================================

Linux file managers (Nautilus, Files, Dolphin) refuse to execute
shell scripts on double-click by default. You have two ways to
work around this:

  WAY 1 — Right-click the .run file:
  ----------------------------------
    1. Right-click HeliosInstaller-1.0.0.run
    2. Click "Properties" -> "Permissions" tab
    3. Check "Allow executing file as a program"
    4. Close Properties
    5. Right-click again -> "Run as a Program"

  WAY 2 — Use the launcher shortcut (.desktop):
  ----------------------------------------------
    1. Right-click HeliosInstaller.desktop
    2. Click "Allow Launching"
       (or Properties -> Permissions -> Allow as program)
    3. Double-click it to start the installer

Note: When launching from a file manager, the installer uses a
graphical password dialog (pkexec / polkit) instead of terminal
sudo. On some systems this can fail — if it does, the installer
automatically falls back to --no-sandbox mode and Helios still
works.


===============================================================
  OPTION 2 — Debian package (.deb)
===============================================================

Recommended for Ubuntu, Debian, Mint, Pop!_OS, elementary OS.
No license screen, no wizard — apt just installs it.

  Double-click helios-1.0.0.deb
    (opens in Software Center or gdebi)

  Or from a terminal:
    sudo apt install ./helios-1.0.0.deb


===============================================================
  OPTION 3 — AppImage (portable, any distro)
===============================================================

No installation. Just make it executable and run it from
anywhere.

    chmod +x helios-1.0.0.AppImage
    ./helios-1.0.0.AppImage


===============================================================
  UNINSTALLING
===============================================================

  .run installer:
      bash ~/.local/opt/Helios/uninstall.sh
      (or wherever you chose to install Helios)

  .deb package:
      sudo apt remove helios

  AppImage:
      Just delete the .AppImage file.


===============================================================
  TROUBLESHOOTING
===============================================================

Problem: "Permission denied" when running the .run file
  Fix:   chmod +x HeliosInstaller-1.0.0.run

Problem: Double-clicking the .run file does nothing
  Why:   GNOME Files blocks script execution by default
  Fix:   Use OPTION 1A (terminal) or OPTION 1B (right-click)

Problem: Chrome sandbox errors or "SUID sandbox helper" messages
  Why:   The chrome-sandbox binary needs root:root ownership
         with the SUID bit set (mode 4755). The installer tries
         to do this automatically via sudo/pkexec.
  Fix:   If the installer couldn't set this up, Helios is
         already configured to run with --no-sandbox — it will
         work fine. To enable the proper sandbox manually:

             sudo chown root:root \
               ~/.local/opt/Helios/app/chrome-sandbox
             sudo chmod 4755 \
               ~/.local/opt/Helios/app/chrome-sandbox

         Then remove the --no-sandbox flag from:
             ~/.local/share/applications/Helios.desktop

Problem: Helios icon doesn't appear in Applications menu
  Fix:   Log out and log back in, or run:
             gtk-update-icon-cache ~/.local/share/icons/hicolor
             update-desktop-database ~/.local/share/applications

Problem: "zenity: command not found" during install
  Fix:   sudo apt install zenity    (Debian/Ubuntu)
         sudo dnf install zenity    (Fedora)

===============================================================
