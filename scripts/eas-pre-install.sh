#!/usr/bin/env bash
set -euo pipefail

if [ "$EAS_BUILD_PLATFORM" = "ios" ]; then
  echo "🔧 [pre-install] Resetting CocoaPods spec repo"
  pod repo list
  if pod repo list | grep -q "trunk"; then
    pod repo remove trunk || true
  fi
  pod repo add trunk https://cdn.cocoapods.org/
  pod repo update
else
  echo "ℹ️ Not iOS, skipping CocoaPods repo reset."
fi
