#!/bin/bash -e

# Configuration
MONITORING_ALIAS="monitoring"
LOCAL_PROJECT_DIR=${1:-$(pwd)}
REMOTE_PROJECT_DIR=${2:-"/home/vagrant/learning-platform-nosql"}

echo "🔄 Syncing project from '$LOCAL_PROJECT_DIR' to '$MONITORING_ALIAS:$REMOTE_PROJECT_DIR'"
rsync -avz --delete --exclude=.vagrant --exclude=node_modules -e "ssh" \
    "${LOCAL_PROJECT_DIR}/" \
    "$MONITORING_ALIAS:$REMOTE_PROJECT_DIR/"
echo "✅ Project files synced successfully"

# Define the private network IP addresses for each VM (as set in your Vagrantfile)
declare -A PRIVATE_IPS
PRIVATE_IPS[database]="192.168.56.10"
PRIVATE_IPS[cache]="192.168.56.11"
PRIVATE_IPS[backend]="192.168.56.12"
PRIVATE_IPS[registry]="192.168.56.14"
# (monitoring is the destination VM so no need to add it here)

# Ensure SSH directory exists on the monitoring VM
ssh "$MONITORING_ALIAS" "mkdir -p ~/.ssh"

# Transfer SSH keys for each VM from the host to the monitoring VM
for VM in "${!PRIVATE_IPS[@]}"; do
    KEY_PATH="$HOME/dev/enset_s3/learning-platform-nosql/infra/vagrant/.vagrant/machines/$VM/virtualbox/private_key"
    if [ -f "$KEY_PATH" ]; then
        echo "🔑 Transferring SSH key for $VM..."
        rsync -avz -e "ssh" "$KEY_PATH" "$MONITORING_ALIAS:~/.ssh/${VM}_key"
        ssh "$MONITORING_ALIAS" "chmod 600 ~/.ssh/${VM}_key"
    else
        echo "⚠️  Warning: Private key for $VM not found at $KEY_PATH"
    fi
done

# Create a custom SSH config for the monitoring VM using the private network IPs
TEMP_SSH_CONFIG="/tmp/monitoring_ssh_config.tmp"
cat > "$TEMP_SSH_CONFIG" <<EOF
Host *
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
EOF

for VM in "${!PRIVATE_IPS[@]}"; do
    echo "Host $VM" >> "$TEMP_SSH_CONFIG"
    echo "    HostName ${PRIVATE_IPS[$VM]}" >> "$TEMP_SSH_CONFIG"
    echo "    User vagrant" >> "$TEMP_SSH_CONFIG"
    echo "    IdentityFile ~/.ssh/${VM}_key" >> "$TEMP_SSH_CONFIG"
    echo "    IdentitiesOnly yes" >> "$TEMP_SSH_CONFIG"
done

# Transfer the SSH config to the monitoring VM and set correct permissions
rsync -avz -e "ssh" "$TEMP_SSH_CONFIG" "$MONITORING_ALIAS:~/.ssh/config"
ssh "$MONITORING_ALIAS" "chmod 600 ~/.ssh/config"
rm -f "$TEMP_SSH_CONFIG"

# Test connectivity from the monitoring VM to each VM using the private network IPs
echo "🔍 Testing connections from monitoring VM:"
ssh "$MONITORING_ALIAS" <<'EOF'
declare -A PRIVATE_IPS=( ["database"]="192.168.56.10" ["cache"]="192.168.56.11" ["backend"]="192.168.56.12" ["registry"]="192.168.56.14" )
for host in "${!PRIVATE_IPS[@]}"; do
    echo -n "Testing SSH access to $host (${PRIVATE_IPS[$host]})... "
    ssh -o ConnectTimeout=2 -o BatchMode=yes "$host" true &>/dev/null && echo "✅ Success" || echo "❌ Failed"
done
EOF

echo "🎉 Sync and configuration completed successfully"
