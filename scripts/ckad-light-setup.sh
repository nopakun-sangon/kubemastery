#!/usr/bin/env bash
# ==============================================================================
# KubeMastery Lightweight CKAD Kubernetes Environment Manager
# Supports:
#   - status      : Check RAM, Docker, Kind, Helm, kubectl mode, and shell/vim setup
#   - setup-shell : Configure ~/.vimrc (YAML 2-space) & ~/.bashrc (k, $do, $now, completion)
#   - mode-sim    : Switch kubectl to KubeMastery Instant Simulator (0 MB RAM)
#   - mode-kind   : Start Docker + Lightweight Kind cluster ("ckad-light") & real kubectl
#   - stop-kind   : Stop Kind container to free ~400-500 MB RAM & switch back to sim mode
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
WORKSPACE_ROOT="$HOME/ckad-workspace"
MODE_FILE="$WORKSPACE_ROOT/.kubectl-mode"
KIND_CONFIG="$SCRIPT_DIR/kind-ckad-light.yaml"
CLUSTER_NAME="ckad-light"
REAL_KUBECTL="/snap/bin/kubectl"

mkdir -p "$WORKSPACE_ROOT"

get_current_mode() {
  if [ -f "$MODE_FILE" ]; then
    tr -d '[:space:]' < "$MODE_FILE"
  else
    echo "sim"
  fi
}

cmd_status() {
  local mode
  mode="$(get_current_mode)"
  echo "============================================================"
  echo "☸️  KubeMastery Lightweight CKAD Environment Status"
  echo "============================================================"
  echo "💻 RAM Usage:"
  free -h | awk 'NR==1 || NR==2 {print "   " $0}'
  echo ""
  echo "🔧 Active kubectl mode : $mode"
  if [ "$mode" = "kind" ] || [ "$mode" = "real" ]; then
    echo "   -> Passthrough to real $REAL_KUBECTL (Kind / Real Cluster)"
  else
    echo "   -> KubeMastery Instant Simulator (0 MB RAM, ~/ckad-workspace/.cluster-state.json)"
  fi
  echo ""
  echo "📦 Installed CKAD Tools:"
  printf "   - kubectl (real) : %s\n" "$([ -x "$REAL_KUBECTL" ] && "$REAL_KUBECTL" version --client 2>/dev/null | head -n 1 || echo "not found")"
  printf "   - kind           : %s\n" "$(command -v kind >/dev/null 2>&1 && kind version 2>/dev/null || echo "not found")"
  printf "   - helm           : %s\n" "$(command -v helm >/dev/null 2>&1 && helm version --short 2>/dev/null || echo "not found")"
  printf "   - docker         : %s (daemon: %s)\n" "$(command -v docker >/dev/null 2>&1 && docker --version 2>/dev/null || echo "not found")" "$(systemctl is-active docker 2>/dev/null || echo "unknown")"
  printf "   - vim & jq       : vim=%s, jq=%s\n" "$(command -v vim >/dev/null 2>&1 && echo OK || echo missing)" "$(command -v jq >/dev/null 2>&1 && echo OK || echo missing)"
  echo ""
  echo "📝 Shell & Vim Exam Setup:"
  printf "   - ~/.vimrc (YAML 2-space) : %s\n" "$(grep -q 'set expandtab' "$HOME/.vimrc" 2>/dev/null && echo "✅ Configured" || echo "⚠️ Not configured (run: setup-shell)")"
  printf "   - ~/.bashrc (\$do / \$now)  : %s\n" "$(grep -q 'export do=' "$HOME/.bashrc" 2>/dev/null && echo "✅ Configured" || echo "⚠️ Not configured (run: setup-shell)")"
  echo ""
  if systemctl is-active --quiet docker 2>/dev/null; then
    local kind_state
    kind_state="$(docker ps -a --filter "name=^/${CLUSTER_NAME}-control-plane$" --format '{{.Status}}' 2>/dev/null || true)"
    if [ -n "$kind_state" ]; then
      echo "🐳 Kind Cluster ($CLUSTER_NAME): $kind_state"
    else
      echo "🐳 Kind Cluster ($CLUSTER_NAME): Not created yet (run: ./scripts/ckad-light-setup.sh mode-kind)"
    fi
  else
    echo "🐳 Docker daemon is stopped (saving RAM!). Run 'mode-kind' when you want a real Kind cluster."
  fi
  echo "============================================================"
}

cmd_setup_shell() {
  echo "⚙️  Configuring ~/.vimrc for Kubernetes YAML editing..."
  touch "$HOME/.vimrc"
  if ! grep -q "KubeMastery CKAD Vim Config" "$HOME/.vimrc" 2>/dev/null; then
    cat << 'EOF' >> "$HOME/.vimrc"

" KubeMastery CKAD Vim Config
set tabstop=2
set shiftwidth=2
set expandtab
set number
set autoindent
EOF
    echo "   ✅ Added YAML-safe 2-space indentation to ~/.vimrc"
  else
    echo "   ℹ️  ~/.vimrc already configured."
  fi

  echo "⚙️  Configuring ~/.bashrc with CKAD exam shortcuts (k, \$do, \$now, autocompletion)..."
  touch "$HOME/.bashrc"
  if ! grep -q "KubeMastery CKAD Exam Shortcuts" "$HOME/.bashrc" 2>/dev/null; then
    cat << 'EOF' >> "$HOME/.bashrc"

# KubeMastery CKAD Exam Shortcuts
export do="--dry-run=client -o yaml"
export now="--force --grace-period=0"
alias k=kubectl
if [ -x /snap/bin/kubectl ]; then
  source <(/snap/bin/kubectl completion bash 2>/dev/null) || true
  complete -o default -F __start_kubectl k 2>/dev/null || true
fi
EOF
    echo "   ✅ Added \$do, \$now, alias k=kubectl, and bash completion to ~/.bashrc"
  else
    echo "   ℹ️  ~/.bashrc already has KubeMastery CKAD Exam Shortcuts."
  fi

  echo ""
  echo "🎉 Done! Run the following in your current terminal to apply immediately:"
  echo "   source ~/.bashrc"
}

cmd_mode_sim() {
  echo "sim" > "$MODE_FILE"
  echo "✅ Switched kubectl to [KubeMastery Instant Simulator Mode] (RAM: 0 MB)"
  echo "   - Works 100% with http://localhost:3080/#/ckad-labs without starting Docker."
}

cmd_mode_kind() {
  if ! systemctl is-active --quiet docker 2>/dev/null; then
    echo "🐳 Starting Docker daemon (may ask for your sudo password)..."
    sudo systemctl start docker
  fi

  local existing
  existing="$(docker ps -a --filter "name=^/${CLUSTER_NAME}-control-plane$" --format '{{.Names}}' 2>/dev/null || true)"
  if [ -n "$existing" ]; then
    echo "🚀 Starting existing lightweight Kind cluster '$CLUSTER_NAME'..."
    docker start "${CLUSTER_NAME}-control-plane" >/dev/null
    sleep 3
  else
    echo "🚀 Creating lightweight single-node Kind cluster '$CLUSTER_NAME' (~400 MB RAM)..."
    kind create cluster --name "$CLUSTER_NAME" --config "$KIND_CONFIG"
  fi

  echo "kind" > "$MODE_FILE"
  "$REAL_KUBECTL" config use-context "kind-${CLUSTER_NAME}" >/dev/null 2>&1 || true
  echo ""
  echo "✅ Switched kubectl to [Real Kind Cluster Mode: kind-${CLUSTER_NAME}]!"
  "$REAL_KUBECTL" get nodes -o wide
  echo ""
  echo "💡 When finished practicing on real Kind, free RAM immediately with:"
  echo "   ./scripts/ckad-light-setup.sh stop-kind"
}

cmd_stop_kind() {
  if systemctl is-active --quiet docker 2>/dev/null; then
    if docker ps --filter "name=^/${CLUSTER_NAME}-control-plane$" --format '{{.Names}}' | grep -q "${CLUSTER_NAME}-control-plane"; then
      echo "🛑 Stopping Kind container '${CLUSTER_NAME}-control-plane' to free RAM..."
      docker stop "${CLUSTER_NAME}-control-plane" >/dev/null
      echo "   ✅ Kind cluster paused (state preserved, RAM freed!)."
    else
      echo "   ℹ️  Kind cluster '${CLUSTER_NAME}' is already stopped."
    fi
  else
    echo "   ℹ️  Docker daemon is already stopped."
  fi
  echo "sim" > "$MODE_FILE"
  echo "✅ Switched kubectl back to [KubeMastery Instant Simulator Mode] (0 MB RAM)."
}

case "${1:-status}" in
  status)
    cmd_status
    ;;
  setup-shell)
    cmd_setup_shell
    ;;
  mode-sim)
    cmd_mode_sim
    ;;
  mode-kind)
    cmd_mode_kind
    ;;
  stop-kind)
    cmd_stop_kind
    ;;
  *)
    echo "Usage: $0 {status|setup-shell|mode-sim|mode-kind|stop-kind}"
    exit 1
    ;;
esac
