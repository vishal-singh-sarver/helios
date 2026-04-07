; Helios custom NSIS hook file
; Uses only electron-builder-supported macros so Windows keeps a stable
; assisted installer flow and explicit shortcut icons.

!include "LogicLib.nsh"

!macro customWelcomePage
  !insertmacro MUI_PAGE_WELCOME
!macroend

!macro customUnWelcomePage
  !insertmacro MUI_UNPAGE_WELCOME
!macroend

!macro customInstall
  ; Ship a stable .ico file with the installation and point shortcuts at it.
  ; This avoids the default Electron icon when executable resource editing is disabled.
  File /oname=helios-shortcut.ico "${BUILD_RESOURCES_DIR}\icon.ico"

  IfFileExists "$newStartMenuLink" 0 +4
    Delete "$newStartMenuLink"
    CreateShortCut "$newStartMenuLink" "$appExe" "" "$INSTDIR\helios-shortcut.ico" 0 "" "" "${APP_DESCRIPTION}"
    WinShell::SetLnkAUMI "$newStartMenuLink" "${APP_ID}"

  IfFileExists "$newDesktopLink" 0 +4
    Delete "$newDesktopLink"
    CreateShortCut "$newDesktopLink" "$appExe" "" "$INSTDIR\helios-shortcut.ico" 0 "" "" "${APP_DESCRIPTION}"
    WinShell::SetLnkAUMI "$newDesktopLink" "${APP_ID}"

  ClearErrors
!macroend
