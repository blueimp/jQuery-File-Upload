#!/bin/sh

#
# Adds TCP/UDP port forwarding rules to the pf firewall (MacOS/BSD).
#
# Adds rules for both TCP and UDP in addition to those from /etc/pf.conf.
# Requires an existing rdr-anchor entry in /etc/pf.conf.
# Only adds rules temporarily, without changing any files.
#
# Usage: ./forward-ports.sh [[nic:]port=[ip:]port [...]]
#
# If no network interface is given, forwards from all interfaces.
# If no IP is given, forwards to 127.0.0.1.
# If no port forwarding rule is given, resets to the rules from /etc/pf.conf.
#
# e.g. forwarding ports 80 and 443 on network interface en0 to ports 8080 and
# 8443 on localhost respectively:
# ./forward-ports.sh en0:80=8080 en0:443=8443
#
# Copyright 2019, Sebastian Tschan
# https://blueimp.net
#
# Licensed under the MIT license:
# https://opensource.org/licenses/MIT
#

set -e

RULES=
NEWLINE='
'

print_usage_exit() {
  if [ -n "$RULES" ]; then
    printf '\nError in custom rules:\n%s\n' "$RULES" >&2
  fi
  echo "Usage: $0 [[nic:]port=[ip:]port [...]]" >&2
  exit 1
}

print_nat_rules() {
  echo
  echo 'Loaded NAT rules:'
  sudo pfctl -s nat 2>/dev/null
  echo
}

# Print usage and exit if option arguments like "-h" are used:
if [ "${1#-}" != "$1" ]; then print_usage_exit; fi

while test $# -gt 0; do
  # Separate the from=to parts:
  from=${1%=*}
  to=${1#*=}
  # If from part has a nic defined, extract it, else forward from all:
  case "$from" in
    *:*) nic="on ${from%:*}";;
      *) nic=;;
  esac
  # Extract the port to forward from:
  from_port=${from##*:}
  # If to part has an IP defined, extract it, else forward to 127.0.0.1:
  case "$to" in
    *:*) to_ip=${to%:*};;
      *) to_ip=127.0.0.1;;
  esac
  # Extract the port to forward to:
  to_port=${to##*:}
  # Create the packet filter (pf) forwarding rule for both TCP and UDP:
  rule=$(
    printf \
      'rdr pass %s inet proto %s from any to any port %s -> %s port %s' \
      "$nic" '{tcp udp}' "$from_port" "$to_ip" "$to_port"
  )
  # Add it to the list of rules:
  RULES="$RULES$rule$NEWLINE"
  shift
done

# Add the rules after the line matching "rdr-anchor" in /etc/pf.conf, print the
# combined rules to STDOUT and load the rules into pf from STDIN.
# Finally, display the loaded NAT rules or print the script usage on failure:
# shellcheck disable=SC2015
printf %s "$RULES" | sed -e '/rdr-anchor/r /dev/stdin' /etc/pf.conf |
sudo pfctl -Ef - 2>/dev/null && print_nat_rules || print_usage_exit
