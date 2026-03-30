# Helios - Quick Start Guide for Packaging & Builds

## For Developers

### Development Workflow
```bash
# Install dependencies once
npm install

# Development with hot reload
npm run dev

# Build for testing
npm run build

# Package for current platform (macOS, Windows, or Linux)
npm run package
```

### Before Committing
```bash
npm run lint
npm run test
npm run build  # Ensure build succeeds
```

---

## For Release Engineering

### Release Build Procedure

#### Step 1: Prepare Release
```bash
# Update version in package.json
# Commit all changes
git add .
git commit -m "Release version 1.0.1"

# Create version tag
git tag v1.0.1
git push origin main --tags
```

#### Step 2: GitHub Actions Triggers Automatically
- GitHub Actions runs when tags are pushed
- Builds all platforms (Windows, macOS, Linux) in parallel
- Creates GitHub Release with all installers
- Total time: ~30-35 minutes

#### Step 3: Download Installers
1. Go to GitHub Actions tab
2. Select latest build
3. Download artifacts:
   - `windows-installer` (*.exe)
   - `macos-installers` (*.dmg, *.pkg)
   - `linux-packages` (*.AppImage, *.deb)

#### Step 4: Test Before Release
```bash
# Test Windows installer (on Windows with UAC elevated terminal)
Run: helios-1.0.1-setup.exe

# Test macOS installer
# Method 1 - DMG (drag-and-drop)
open dist/helios-1.0.1.dmg
# Drag Helios.app to Applications

# Method 2 - PKG (professional installer)
open dist/helios-1.0.1.pkg
# Follow installer steps

# Test Linux
chmod +x Helios-1.0.1.AppImage
./Helios-1.0.1.AppImage
```

#### Step 5: Verify Installation
Windows:
```cmd
:: Check app is installed
dir "C:\Program Files\Helios\"

:: Check user data folder
dir %APPDATA%\Helios\
```

macOS:
```bash
# Check app is in Applications
ls -lah /Applications/Helios.app

# Check user data
ls -lah ~/Library/Application\ Support/Helios/

# Launch app
open /Applications/Helios.app
```

Linux:
```bash
# Check DEB install
ls -lah /opt/helios/

# Check desktop entry
ls -lah ~/.local/share/applications/Helios.desktop

# Launch
helios
```

#### Step 6: Publish to Users
1. Create release announcement
2. Upload installers to distribution server
3. Update website with download links
4. Announce release

---

## Build Commands Reference

### Development
```bash
npm run dev              # Hot reload development
npm run build            # Compile TypeScript & React
npm run preview          # Preview packaged app
```

### Packaging
```bash
npm run package          # Package for current platform
npm run package:all      # Build all platforms
npm run package:mac      # macOS only
npm run package:win      # Windows only
npm run package:linux    # Linux only
```

### Maintenance
```bash
npm run lint             # Check code quality
npm run test             # Run tests
npm run format           # Format code
npm run dist:clean       # Clean build output
npm run dist:clean-all   # Full clean (includes node_modules)
```

---

## Configuration & Customization

### Change App Icon
1. Replace `build/icon.ico` (256×256, ICO format)
2. Rebuild: `npm run package`

### Update License Agreement
1. Edit `build/license.txt`
2. Rebuild: `npm run package`

### Change App Name or Version
1. Update `productName` in `electron-builder.yml`
2. Update `version` in `package.json`
3. Rebuild: `npm run package`

### Code Signing (Production)
See IMPLEMENTATION_COMPLETE.md section "Configuration for Production"

---

## Troubleshooting

### Build fails: "icon.ico not found"
```bash
# Verify icon exists
ls build/icon.ico

# If missing, copy/create one
# Icon must be 256×256 ICO format
```

### Build fails: "license.txt not found"
```bash
# Verify license exists
ls build/license.txt

# Must be valid UTF-8 text file
```

### Installer won't launch on macOS
```bash
# Check for quarantine flag
xattr -d com.apple.quarantine /Applications/Helios.app

# Restart app
```

### Windows installer stuck on license screen
- Ensure license.txt is valid UTF-8
- Try rebuilding with: `npm run package:win`

---

## Platform-Specific Notes

### Windows
- Requires Windows 10+ for end users
- NSIS installer with UAC elevation
- User data in: `%APPDATA%\Helios\`
- Shortcuts created on Desktop and Start Menu

### macOS
- Requires macOS 10.12+
- Both DMG (drag-and-drop) and PKG (professional) available
- User data in: `~/Library/Application Support/Helios/`
- Code signing required for distribution (development: null)

### Linux
- Supports: Ubuntu 18.04+, Debian 9+, Fedora, Arch, etc.
- AppImage: Single executable, no installation required
- DEB: Standard package for Debian/Ubuntu
- User data in: `~/.local/share/Helios/`

---

## CI/CD Information

### GitHub Actions Workflows

**build-installers.yml** (Production Releases)
- Trigger: `git push origin v*.*.* tag`
- Runs on: Windows, macOS, Linux in parallel
- Output: Signed installers + GitHub Release
- Time: ~30-35 minutes total

**build-validation.yml** (Development)
- Trigger: Pull requests, develop branch
- Tests: Lint + Build validation
- Time: ~2-3 minutes per platform

### For Secrets Configuration
See .github/workflows/build-installers.yml for required secrets setup

---

## Support & Help

### User Installation Issues
See PACKAGING_DEPLOYMENT.md → "Distribution & End-User Installation"

### Support Data Locations
- Windows: `%APPDATA%\Helios\`
- macOS: `~/Library/Application Support/Helios/`
- Linux: `~/.local/share/Helios/`

### Build Documentation
- Full guide: PACKAGING_DEPLOYMENT.md (5000+ lines)
- Implementation details: IMPLEMENTATION_COMPLETE.md
- Configuration file: electron-builder.yml

### External Resources
- electron-builder: https://www.electron.build/
- NSIS installer: https://nsis.sourceforge.io/
- GitHub Actions: https://docs.github.com/actions

---

## Release Checklist

Before releasing:
- [ ] Version bumped in package.json
- [ ] All code committed and pushed
- [ ] Tests pass: `npm run test`
- [ ] Lint passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] License updated if needed
- [ ] Icon is professional
- [ ] Tag created: `git tag v1.0.1`
- [ ] Tag pushed: `git push origin v1.0.1`

During release (automated by CI/CD):
- [ ] GitHub Actions triggered
- [ ] All platforms building
- [ ] No build errors
- [ ] GitHub Release created

After release:
- [ ] Download and test installers
- [ ] Verify on Windows, macOS, Linux
- [ ] Upload to distribution server
- [ ] Announce release

---

## Common Tasks

### Update to patch version (1.0.0 → 1.0.1)
```bash
# Update version in package.json
npm run dist:clean
npm run build
git add package.json
git commit -m "Bump to v1.0.1"
git tag v1.0.1
git push origin main --tags
# GitHub Actions handles rest
```

### Add code signing for production
1. Obtain certificates (see IMPLEMENTATION_COMPLETE.md)
2. Add GitHub Secrets
3. Update .github/workflows/build-installers.yml
4. Uncomment the signing sections in electron-builder.yml
5. Push to trigger rebuild

### Change default installation directory (Windows)
Edit electron-builder.yml:
```yaml
nsis:
  installLocation: C:\Custom\Path\Helios
```

### Add new build resource (e.g., splash screen)
1. Add file to build/
2. Reference in electron-builder.yml
3. Test with: `npm run package`

---

**For comprehensive details, see PACKAGING_DEPLOYMENT.md**

Last Updated: March 30, 2026
