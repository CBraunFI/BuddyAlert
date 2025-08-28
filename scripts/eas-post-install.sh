#!/usr/bin/env bash
set -euo pipefail

if [ "$EAS_BUILD_PLATFORM" = "ios" ] && [ -d "ios" ]; then
  echo "🔧 [post-install] Forcing pod install with --repo-update in ios/"
  cd ios
  pod install --repo-update
else
  echo "ℹ️ Not iOS or no ios folder, skipping post-install pod step."
fi
