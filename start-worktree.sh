#!/bin/bash
set -euo pipefail

# Check if from-branch is provided
if [ -z "${1:-}" ]; then
  echo "Usage: $0 <from-branch> [target-name]"
  echo "Example: $0 master new-feature"
  echo "         $0 develop bug-fix"
  echo "         $0 master   # target defaults to tree/<random6>"
  exit 1
fi

FROM_BRANCH=$1
TARGET_NAME=${2:-}

# Ensure we are in repo root
REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

# Generate default target name if not provided: <word1>_<word2>_<random4>
if [ -z "$TARGET_NAME" ]; then
  WORDS=(
    swift bright bold crisp calm deep vast keen pure sharp
    vivid brave clear dense eager fine glad hazy idle just
    kind lean mild neat open prime quick rapid safe tidy
    warm zen apex beam core dawn echo flux glow hive
    iris jolt knot lens mist node orbit peak quark reef
    shard tide umbra veil wave xenon yoke zeal arc bolt
    crest dune ember forge
  )
  WORD_COUNT=${#WORDS[@]}

  for _ in $(seq 1 20); do
    W1=${WORDS[$((RANDOM % WORD_COUNT))]}
    W2=${WORDS[$((RANDOM % WORD_COUNT))]}
    while [ "$W2" = "$W1" ]; do
      W2=${WORDS[$((RANDOM % WORD_COUNT))]}
    done
    # head -c 提前关闭管道会让 tr 收到 SIGPIPE(141)；在子 shell 内关掉 pipefail，避免 set -e 误退出
    RANDOM_SUFFIX=$(set +o pipefail; LC_ALL=C tr -dc 'a-z0-9' </dev/urandom | head -c 4)
    CANDIDATE_NAME="${W1}_${W2}_${RANDOM_SUFFIX}"
    if ! git show-ref --verify --quiet "refs/heads/tree/$CANDIDATE_NAME"; then
      TARGET_NAME=$CANDIDATE_NAME
      break
    fi
  done

  if [ -z "$TARGET_NAME" ]; then
    echo "Failed to generate a unique branch name after 20 attempts."
    exit 1
  fi
  echo "No target name specified; using generated name '$TARGET_NAME'."
fi

BRANCH_NAME="tree/$TARGET_NAME"

WORKTREE_PATH="worktree/$BRANCH_NAME"

echo "=== Setup Worktree: $BRANCH_NAME (from $FROM_BRANCH) ==="

# 1. Create branch from specified branch if it doesn't exist
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
  echo "Branch '$BRANCH_NAME' already exists. Using existing branch."
else
  echo "Creating branch '$BRANCH_NAME' from '$FROM_BRANCH'..."
  git branch "$BRANCH_NAME" "$FROM_BRANCH"
fi

# 2. Create worktree
if [ -d "$WORKTREE_PATH" ]; then
  echo "Directory '$WORKTREE_PATH' already exists."
else
  echo "Creating git worktree at '$WORKTREE_PATH'..."
  git worktree add "$WORKTREE_PATH" "$BRANCH_NAME"
fi

# 3. Open in default Terminal
echo "Opening Terminal at '$WORKTREE_PATH'..."

open_with_warp() {
  if open -Ra "Warp" 2>/dev/null; then
    open -a "Warp" "$WORKTREE_PATH"
    return 0
  fi
  return 1
}

open_with_iterm() {
  if open -Ra "iTerm" 2>/dev/null; then
    open -a "iTerm" "$WORKTREE_PATH"
    return 0
  fi
  return 1
}

open_with_terminal() {
  if open -Ra "Terminal" 2>/dev/null; then
    open -a "Terminal" "$WORKTREE_PATH"
    return 0
  fi
  return 1
}

# 优先级: iTerm > Warp > Terminal
if open_with_iterm; then
  echo "✅ Opened with iTerm"
elif open_with_warp; then
  echo "✅ Opened with Warp"
elif open_with_terminal; then
  echo "✅ Opened with Terminal"
else
  echo "❌ No supported terminal found (iTerm / Warp / Terminal)"
  exit 1
fi

echo "Done."
