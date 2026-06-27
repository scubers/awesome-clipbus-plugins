#!/bin/bash
set -euo pipefail

usage() {
  echo "Usage: $0 <branch-name> [--delete-branch] [--delete-remote]"
  echo "Example: $0 tree/123456"
  echo "         $0 tree/new-feature --delete-branch"
  echo "         $0 tree/new-feature --delete-branch --delete-remote"
}

if [ "$#" -eq 0 ]; then
  usage
  exit 1
fi

BRANCH_NAME=
DELETE_BRANCH=0
DELETE_REMOTE=0
REMOTE_NAME=origin

for ARG in "$@"; do
  case "$ARG" in
    --delete-branch)
      DELETE_BRANCH=1
      ;;
    --delete-remote)
      DELETE_REMOTE=1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --*)
      echo "Unknown flag: $ARG"
      usage
      exit 1
      ;;
    *)
      if [ -n "$BRANCH_NAME" ]; then
        echo "Unexpected argument: $ARG"
        usage
        exit 1
      fi
      BRANCH_NAME=$ARG
      ;;
  esac
done

if [ -z "$BRANCH_NAME" ]; then
  usage
  exit 1
fi

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

WORKTREE_PATH="worktree/$BRANCH_NAME"

echo "=== Archive Worktree: $BRANCH_NAME ==="

# Resolve the actual worktree path tracked by git, in case it differs.
TRACKED_PATH=$(git worktree list --porcelain | awk -v b="refs/heads/$BRANCH_NAME" '
  $1 == "worktree" { path = $2 }
  $1 == "branch" && $2 == b { print path; exit }
')

if [ -n "$TRACKED_PATH" ]; then
  echo "Removing git worktree at '$TRACKED_PATH'..."
  if ! git worktree remove "$TRACKED_PATH" 2>/dev/null; then
    echo "Worktree had local changes or was already gone; forcing removal."
    git worktree remove --force "$TRACKED_PATH" 2>/dev/null || true
  fi
elif [ -d "$WORKTREE_PATH" ]; then
  echo "No git-tracked worktree for '$BRANCH_NAME', but '$WORKTREE_PATH' exists."
  echo "Attempting force removal via git, then cleaning directory..."
  git worktree remove --force "$WORKTREE_PATH" 2>/dev/null || true
  if [ -d "$WORKTREE_PATH" ]; then
    rm -rf "$WORKTREE_PATH"
  fi
else
  echo "No worktree found for branch '$BRANCH_NAME'."
fi

# Prune stale worktree administrative records.
echo "Pruning stale worktree entries..."
git worktree prune

# Clean up the empty parent dir if nothing is left under worktree/.
if [ -d "worktree" ] && [ -z "$(ls -A worktree 2>/dev/null)" ]; then
  rmdir worktree
fi

if [ "$DELETE_BRANCH" = "1" ]; then
  if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
    echo "Deleting branch '$BRANCH_NAME'..."
    if ! git branch -d "$BRANCH_NAME" 2>/dev/null; then
      echo "Branch not fully merged; use 'git branch -D $BRANCH_NAME' to force delete."
    fi
  else
    echo "Branch '$BRANCH_NAME' does not exist locally; nothing to delete."
  fi
fi

if [ "$DELETE_REMOTE" = "1" ]; then
  if ! git remote get-url "$REMOTE_NAME" >/dev/null 2>&1; then
    echo "Remote '$REMOTE_NAME' is not configured; cannot delete remote branch."
    exit 1
  fi

  set +e
  git ls-remote --exit-code --heads "$REMOTE_NAME" "$BRANCH_NAME" >/dev/null 2>&1
  REMOTE_REF_STATUS=$?
  set -e

  if [ "$REMOTE_REF_STATUS" = "0" ]; then
    echo "Deleting remote branch '$REMOTE_NAME/$BRANCH_NAME'..."
    git push "$REMOTE_NAME" --delete "$BRANCH_NAME"
  elif [ "$REMOTE_REF_STATUS" = "2" ]; then
    echo "Remote branch '$REMOTE_NAME/$BRANCH_NAME' does not exist; nothing to delete."
  else
    echo "Failed to check remote branch '$REMOTE_NAME/$BRANCH_NAME'."
    exit "$REMOTE_REF_STATUS"
  fi
fi

echo "Done."
