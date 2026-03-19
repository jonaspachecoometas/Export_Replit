#!/bin/bash

export MB_JETTY_PORT=8088
export MB_JETTY_HOST=0.0.0.0

export MB_DB_TYPE=h2
export MB_DB_FILE=/home/runner/workspace/metabase/metabase-data

export MB_EMOJI_IN_LOGS=false
export MB_COLORIZE_LOGS=false
export MB_ANON_TRACKING_ENABLED=false
export MB_CHECK_FOR_UPDATES=false
export MB_ENABLE_EMBEDDING=true
export MB_SITE_NAME="Arcádia Insights"
export MB_SITE_LOCALE="pt-BR"

echo "[Metabase] Starting on port $MB_JETTY_PORT..."
echo "[Metabase] Using H2 for metadata, PostgreSQL as data source"

cd /home/runner/workspace/metabase
java --add-opens java.base/java.nio=ALL-UNNAMED \
  -Xmx512m \
  -jar metabase.jar
