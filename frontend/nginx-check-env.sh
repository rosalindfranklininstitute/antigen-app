#!/bin/sh
[ "$ENVIRONMENT" == "preproduction" ] && sed -i -e 's/<html lang="en" class="/<html lang="en" class="preproduction /' /usr/share/nginx/html/index.html
