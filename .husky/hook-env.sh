# Git hooks often run with a minimal PATH (Git Bash, GUI clients, IDE).
# Ensure Node/npm/npx and global npm shims are discoverable on Windows + Unix.
export PATH="${PATH}:/c/Program Files/nodejs:/c/Program Files (x86)/nodejs:${HOME}/AppData/Roaming/npm:/usr/local/bin"
