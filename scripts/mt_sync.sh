#!/usr/bin/env zsh

# synchronize the mt repository by committing local changes,
# pulling updates from the remote repository, and pushing local commits if any.

emulate -L zsh
setopt nounset pipefail err_return

repo_dir="$HOME/mt"

cd "$repo_dir" || {
  print -P "%F{red}mts:%f repo dir not found: %B$repo_dir%b"
  exit 1
}

# commit local changes if any
if [[ -n "$(git status --porcelain)" ]]; then
  print -P "%F{yellow}mts:%f committing local changes"
  git add . || exit 1
  git commit -m "wip: local changes" || exit 1
else
  print -P "%F{cyan}mts:%f working tree clean"
fi

# pull
print -P "%F{blue}mts:%f pulling (rebase)"
git pull --rebase || exit 1

# push if needed
if [[ -n "$(git log --branches --not --remotes)" ]]; then
  print -P "%F{green}mts:%f pushing"
  git push || exit 1
else
  print -P "%F{cyan}mts:%f nothing to push"
fi
