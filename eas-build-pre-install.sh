# eas-build-pre-install.sh
#!/usr/bin/env bash
set -euo pipefail

echo "🔧 Running CocoaPods repo update before install..."
pod repo update
