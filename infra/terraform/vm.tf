resource "virtualbox_vm" "node" {
  count     = 2
  name      = format("node-%02d", count.index + 1)
  image     = "https://cloud-images.ubuntu.com/bionic/current/bionic-server-cloudimg-amd64-vagrant.box" # Official Ubuntu cloud image
  cpus      = 2
  memory    = "512 mib"
  user_data = file("${path.module}/cloud-init.cfg") # Remove the "replace()" hack

  network_adapter {
    type           = "bridged"
    host_interface = "wlp1s0"
  }
}
