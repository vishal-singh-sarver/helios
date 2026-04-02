#!/usr/bin/env bash
################################################################################
# Verification Script for macOS Backend Startup Fix
#
# Run this script to verify all fixes are in place and working correctly
#
# Usage: bash verify-fix.sh
################################################################################

echo "======================================================================"
echo "  Helios macOS Backend Startup Fix - Verification Script"
echo "======================================================================"
echo ""

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
PASS="✓"
FAIL="✗"
WARN="⚠"

PASS_COUNT=0
FAIL_COUNT=0

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

function print_pass() {
  echo -e "${GREEN}${PASS}${NC} $1"
  ((PASS_COUNT++))
}

function print_fail() {
  echo -e "${RED}${FAIL}${NC} $1"
  ((FAIL_COUNT++))
}

function print_warn() {
  echo -e "${YELLOW}${WARN}${NC} $1"
}

function print_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

echo ""
echo "────────────────────────────────────────────────────────────────────"
echo "1. Checking Files"
echo "────────────────────────────────────────────────────────────────────"
echo ""

# Check main process files
if [ -f "$REPO_ROOT/src/main/index.ts" ]; then
  print_pass "src/main/index.ts exists"
  if grep -s "app.getPath('home')" "$REPO_ROOT/src/main/index.ts" >/dev/null 2>&1; then
    print_pass "  → Uses app.getPath('home')"
  else
    print_fail "  → Does NOT use app.getPath('home')"
  fi
  
  if grep -s "writeEarlyLog" "$REPO_ROOT/src/main/index.ts" >/dev/null 2>&1; then
    print_pass "  → Has writeEarlyLog function"
  else
    print_fail "  → Missing writeEarlyLog function"
  fi
else
  print_fail "src/main/index.ts NOT found"
fi

if [ -f "$REPO_ROOT/src/main/backend-manager.ts" ]; then
  print_pass "src/main/backend-manager.ts exists"
  if grep -s "startupTimeoutMs = 20000" "$REPO_ROOT/src/main/backend-manager.ts" >/dev/null 2>&1; then
    print_pass "  → Timeout increased to 20s"
  else
    print_fail "  → Timeout NOT at 20s"
  fi
  
  if grep -s "AbortController" "$REPO_ROOT/src/main/backend-manager.ts" >/dev/null 2>&1; then
    print_pass "  → Uses AbortController for timeouts"
  else
    print_fail "  → Not using AbortController"
  fi
else
  print_fail "src/main/backend-manager.ts NOT found"
fi

echo ""
echo "────────────────────────────────────────────────────────────────────"
echo "2. Checking Build Configuration"
echo "────────────────────────────────────────────────────────────────────"
echo ""

if [ -f "$REPO_ROOT/build/afterPack.js" ]; then
  print_pass "build/afterPack.js exists (NEW FILE)"
  if grep -s "fs.chmodSync" "$REPO_ROOT/build/afterPack.js" >/dev/null 2>&1; then
    print_pass "  → Has chmod fix for binary permissions"
  else
    print_fail "  → Missing chmod fix"
  fi
else
  print_fail "build/afterPack.js NOT found"
fi

if grep -s "afterPack: build/afterPack.js" "$REPO_ROOT/electron-builder.yml" >/dev/null 2>&1; then
  print_pass "electron-builder.yml has afterPack hook configured"
else
  print_fail "electron-builder.yml missing afterPack configuration"
fi

echo ""
echo "────────────────────────────────────────────────────────────────────"
echo "3. Checking Documentation"
echo "────────────────────────────────────────────────────────────────────"
echo ""

DOC_FILES=(
  "MACOS_PACKAGED_APP_FIXES.md"
  "MACOS_FIX_SUMMARY.md"
  "DATA_FOLDER_FIX.md"
  "QUICK_REF.md"
)

for doc in "${DOC_FILES[@]}"; do
  if [ -f "$REPO_ROOT/$doc" ]; then
    print_pass "$doc exists"
  else
    print_fail "$doc NOT found"
  fi
done

echo ""
echo "────────────────────────────────────────────────────────────────────"
echo "4. Checking Syntax"
echo "────────────────────────────────────────────────────────────────────"
echo ""

# Check JavaScript syntax
if node -c "$REPO_ROOT/build/afterPack.js" 2>/dev/null; then
  print_pass "build/afterPack.js has valid syntax"
else
  print_fail "build/afterPack.js has syntax errors"
fi

echo ""
echo "────────────────────────────────────────────────────────────────────"
echo "5. Build Pre-Flight Check"
echo "────────────────────────────────────────────────────────────────────"
echo ""

if [ -d "$REPO_ROOT/node_modules" ]; then
  print_pass "node_modules directory exists"
else
  print_warn "node_modules not found, suggest: npm install"
fi

if [ -f "$REPO_ROOT/package.json" ]; then
  print_pass "package.json exists"
  if grep -s "npm run build.*sync-backend" "$REPO_ROOT/package.json" >/dev/null 2>&1; then
    print_pass "  → Build script includes sync-backend"
  fi
else
  print_fail "package.json NOT found"
fi

echo ""
echo "────────────────────────────────────────────────────────────────────"
echo "6. Next Steps"
echo "────────────────────────────────────────────────────────────────────"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
  echo -e "${GREEN}All checks passed!${NC}"
  echo ""
  echo "Ready to test. Run:"
  echo ""
  echo "  1. Build development app:"
  echo "     npm run build && ./dist/mac-arm64/Helios.app/Contents/MacOS/Helios"
  echo ""
  echo "  2. Package installer:"
  echo "     npm run package:mac && open dist/Helios-1.0.0.pkg"
  echo ""
  echo "  3. Monitor logs:"
  echo "     tail -f ~/Library/Application\ Support/Helios/logs/*.log"
  echo ""
  echo "  4. Verify backend:"
  echo "     lsof -i :8008"
  echo ""
else
  echo -e "${RED}Some checks failed. Review errors above.${NC}"
fi

echo ""
echo "======================================================================"
echo "Summary: ${GREEN}$PASS_COUNT passed${NC}, ${RED}$FAIL_COUNT failed${NC}"
echo "======================================================================"
echo ""

exit $FAIL_COUNT
