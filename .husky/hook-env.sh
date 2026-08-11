# Git hooks often run with a minimal PATH (Git Bash, GUI clients, IDE).
# Ensure Node, npm/npx, pnpm, and global shims are discoverable on Windows + Unix.
export PATH="${PATH}:/c/Program Files/nodejs:/c/Program Files (x86)/nodejs:${HOME}/AppData/Roaming/npm:${HOME}/AppData/Local/pnpm:/usr/local/bin"
