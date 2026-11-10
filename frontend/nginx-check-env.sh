#!/bin/sh
# Rewrites index.html on the fly for non-production environments, so that the
# site can be served from a read-only filesystem.
set -e

config=/tmp/nginx-environment.conf
: > "$config"

if [ "$ENVIRONMENT" ] && [ "$ENVIRONMENT" != "production" ]; then
  case "$ENVIRONMENT" in
    *[!A-Za-z0-9_-]*) echo "Invalid ENVIRONMENT: $ENVIRONMENT" >&2; exit 1 ;;
  esac
  cat > "$config" <<CONF
sub_filter '<html lang="en" class="' '<html lang="en" class="preproduction ';
sub_filter 'window._environment = "production"' 'window._environment = "$ENVIRONMENT"';
sub_filter_once on;
CONF
fi
exit 0
