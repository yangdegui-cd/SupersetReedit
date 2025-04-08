# 本机使用 rsync
rsync -avh  --exclude='superset-frontend/node_modules/' --exclude='superset-websocket/node_modules/' --exclude='.idea/' --exclude='.git/'  --exclude='superset-frontend/.temp_cache/' --exclude='.svn/' -e ssh /Users/yangdegui/project/superset_reedit/ root@123.207.39.39:/data/superset
