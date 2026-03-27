; Custom NSIS Installer Script for Helios
; This file provides customization for the installer UI and flow
; Referenced in electron-builder.yml as: include: build/installer.nsh
;
; NOTE: electron-builder auto-generates the base NSIS script.
; This file can include additional customizations.
; Avoid redefining functions that electron-builder already defines (un.onInit, etc.)

!include nsDialogs.nsh
!include LogicLib.nsh

Var Checkbox
Var Checkbox_State

!define MUI_PAGE_CUSTOMFUNCTION_SHOW LicenseShow
!define MUI_PAGE_CUSTOMFUNCTION_LEAVE LicenseLeave

Function LicenseShow
    FindWindow $0 "#32770" "" $HWNDPARENT
    GetDlgItem $1 $0 1000  ; The license text control
    ; Get the position of the text control
    System::Call "user32::GetWindowRect(i $1, l r1)"
    System::Call "user32::ScreenToClient(i $0, l r1)"
    ; r1 has left,top,right,bottom in screen coords, now client
    ; Bottom is the bottom of the text control
    ; Add checkbox below it
    IntOp $2 $r1 + 16  ; top for checkbox, adjust as needed
    ${NSD_CreateCheckbox} 0 $2 100% 12u "I accept the terms of the license agreement"
    Pop $Checkbox
    ${NSD_Check} $Checkbox
    ${NSD_OnClick} $Checkbox OnCheckbox
    ; Initially disable Next button
    GetDlgItem $3 $0 1  ; Next button ID is 1
    EnableWindow $3 0
FunctionEnd

Function OnCheckbox
    ${NSD_GetState} $Checkbox $Checkbox_State
    FindWindow $0 "#32770" "" $HWNDPARENT
    GetDlgItem $3 $0 1  ; Next button
    ${If} $Checkbox_State == ${BST_CHECKED}
        EnableWindow $3 1
    ${Else}
        EnableWindow $3 0
    ${EndIf}
FunctionEnd

Function LicenseLeave
    ${NSD_GetState} $Checkbox $Checkbox_State
    ${If} $Checkbox_State == ${BST_UNCHECKED}
        MessageBox MB_OK "You must accept the license agreement to continue."
        Abort
    ${EndIf}
FunctionEnd

; ============================================================================
; SECTION: Custom Installation Messages (Optional)
; ============================================================================
; Add custom messages during installation if needed

; Example: Show custom status messages
; Uncomment to use:
; Function InstallMessage
;     DetailPrint "Initializing Helios installation..."
; FunctionEnd

; ============================================================================
; SECTION: Final Notes
; ============================================================================
; 
; Installer Flow Implemented:
; 1. Welcome Screen (built-in)
;    - Shows app name, version, publisher info
;    - Displays intro text
; 
; 2. License Agreement (built-in, uses build/license.txt)
;    - User must accept license to proceed
;    - Cannot skip or bypass
;    - Now includes checkbox to accept terms, enabling Next button only when checked
; 
; 3. Installation Directory Selection (built-in)
;    - Default: C:\Program Files\Helios
;    - User can browse and select custom path
;    - Requires admin permissions (allowElevation: true)
; 
; 4. Install Progress (built-in)
;    - Displays file extraction progress
;    - Shows status messages
;    - Visual progress bar
; 
; 5. Completion Screen (built-in)
;    - Success message
;    - Option to launch app immediately (runAfterFinish: true)
;    - View readme option (optional)
;
; For advanced customization, refer to NSIS documentation:
; https://nsis.sourceforge.io/Docs/
