#!/bin/bash -e
# sync_project.sh
#
# This script syncs the local project directory to the monitoring VM
# using rsync over SSH. It uses the SSH configuration (alias "monitoring")
# to determine the correct connection parameters.
#
# Usage:
#   ./sync_project.sh [local_project_directory] [remote_project_directory]
#
# If no arguments are given, it defaults to:
#   Local project directory: current working directory (pwd)
#   Remote project directory: /home/vagrant/learning-platform-nosql

# Set the local project directory (defaults to current directory)
LOCAL_PROJECT_DIR=${1:-$(pwd)}

# Set the remote project directory on the monitoring VM
REMOTE_PROJECT_DIR=${2:-"/home/vagrant/learning-platform-nosql"}

echo "Syncing project from '$LOCAL_PROJECT_DIR' to 'monitoring:$REMOTE_PROJECT_DIR'..."

# Use rsync to perform the sync.
# -a: archive mode (preserves permissions, etc.)
# -v: verbose output
# -z: compress data during the transfer
# --delete: delete files in the destination that no longer exist in the source
# The "-e 'ssh'" tells rsync to use SSH for the file transfer.
rsync -avz --delete -e "ssh" "${LOCAL_PROJECT_DIR}/" "monitoring:${REMOTE_PROJECT_DIR}/"

# Check if rsync succeeded
if [ $? -eq 0 ]; then
    echo "Project sync completed successfully."
else
    echo "An error occurred during the project sync." >&2
    exit 1
fi
