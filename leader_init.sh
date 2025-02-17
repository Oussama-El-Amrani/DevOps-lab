#!/bin/bash -e

# Configuration
leader_ALIAS="leader"
LOCAL_PROJECT_DIR=${1:-$(pwd)}
REMOTE_PROJECT_DIR=${2:-"/home/vagrant/learning-platform-nosql"}

echo "🔄 Syncing project from '$LOCAL_PROJECT_DIR' to '$leader_ALIAS:$REMOTE_PROJECT_DIR'"
rsync -avz --delete --exclude=.vagrant --exclude=node_modules -e "ssh" \
    "${LOCAL_PROJECT_DIR}/" \
    "$leader_ALIAS:$REMOTE_PROJECT_DIR/"
echo "✅ Project files synced successfully"

# Define the private network IP addresses for each VM (as set in your Vagrantfile)
declare -A PRIVATE_IPS
PRIVATE_IPS[database]="192.168.56.10"
PRIVATE_IPS[cache]="192.168.56.11"
PRIVATE_IPS[backend]="192.168.56.12"
PRIVATE_IPS[registry]="192.168.56.14"

# Ensure SSH directory exists on the leader VM
ssh "$leader_ALIAS" "mkdir -p ~/.ssh"

# Transfer SSH keys for each VM from the host to the leader VM
for VM in "${!PRIVATE_IPS[@]}"; do
    KEY_PATH="$HOME/dev/enset_s3/learning-platform-nosql/infra/vagrant/.vagrant/machines/$VM/virtualbox/private_key"
    if [ -f "$KEY_PATH" ]; then
        echo "🔑 Transferring SSH key for $VM..."
        rsync -avz -e "ssh" "$KEY_PATH" "$leader_ALIAS:~/.ssh/${VM}_key"
        ssh "$leader_ALIAS" "chmod 600 ~/.ssh/${VM}_key"
    else
        echo "⚠️  Warning: Private key for $VM not found at $KEY_PATH"
    fi
done

# Create a custom SSH config for the leader VM using the private network IPs
TEMP_SSH_CONFIG="/tmp/leader_ssh_config.tmp"
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

# Transfer the SSH config to the leader VM and set correct permissions
rsync -avz -e "ssh" "$TEMP_SSH_CONFIG" "$leader_ALIAS:~/.ssh/config"
ssh "$leader_ALIAS" "chmod 600 ~/.ssh/config"
rm -f "$TEMP_SSH_CONFIG"

# Check and Install Ansible on leader VM if needed
echo "🔍 Checking Ansible installation on leader VM..."
ssh "$leader_ALIAS" << 'ENDSSH'
if command -v ansible >/dev/null 2>&1; then
    ansible_version=$(ansible --version | head -n1)
    echo "✅ Ansible is already installed: $ansible_version"
else
    echo "🔧 Installing Ansible..."
    # Update package list
    sudo apt-get update

    # Install software-properties-common if not present
    sudo apt-get install -y software-properties-common

    # Add Ansible repository
    sudo apt-add-repository --yes --update ppa:ansible/ansible

    # Install Ansible
    sudo apt-get install -y ansible

    # Verify installation
    ansible_version=$(ansible --version | head -n1)
    echo "✅ Ansible installed successfully: $ansible_version"
fi
ENDSSH

# Create hosts file for Ansible
TEMP_HOSTS_FILE="/tmp/ansible_hosts.tmp"
cat > "$TEMP_HOSTS_FILE" <<EOF
[database]
database

[cache]
cache

[backend]
backend

[leader]
localhost ansible_host=127.0.0.1 ansible_connection=local

[registry]
registry
EOF

# Transfer and set up Ansible files
echo "📁 Setting up Ansible configuration..."
ssh "$leader_ALIAS" "mkdir -p $REMOTE_PROJECT_DIR/infra/ansible"
rsync -avz -e "ssh" "$TEMP_HOSTS_FILE" "$leader_ALIAS:$REMOTE_PROJECT_DIR/infra/ansible/hosts"
rm -f "$TEMP_HOSTS_FILE"

# Test connectivity from the leader VM to each VM
echo "🔍 Testing connections from leader VM:"
ssh "$leader_ALIAS" <<'EOF'
declare -A PRIVATE_IPS=( ["database"]="192.168.56.10" ["cache"]="192.168.56.11" ["backend"]="192.168.56.12" ["registry"]="192.168.56.14" )
for host in "${!PRIVATE_IPS[@]}"; do
    echo -n "Testing SSH access to $host (${PRIVATE_IPS[$host]})... "
    ssh -o ConnectTimeout=2 -o BatchMode=yes "$host" true &>/dev/null && echo "✅ Success" || echo "❌ Failed"
done
EOF

# Run Ansible playbook
echo "🚀 Running Ansible playbook..."
ssh "$leader_ALIAS" << EOF
cd $REMOTE_PROJECT_DIR/infra/ansible
ansible-playbook -i hosts playbook.yml
EOF

echo "🎉 Sync, configuration, and Ansible playbook execution completed successfully"