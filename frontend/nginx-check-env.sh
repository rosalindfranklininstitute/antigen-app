#!/bin/sh
if [ "$ENVIRONMENT" ] &&  [ "$ENVIRONMENT" != "production" ]; then
  sed -i -e 's/<html lang="en" class="/<html lang="en" class="preproduction /' /usr/share/nginx/html/index.html
  sed -i -e "s/window._environment=\"production\"/window._environment=\"$ENVIRONMENT\"/" /usr/share/nginx/html/index.html
fi
exit 0
