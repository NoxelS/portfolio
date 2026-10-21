#!/usr/bin/env bash
set -euo pipefail

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Production promotion requires a clean working tree." >&2
  exit 1
fi

git fetch origin production --tags
source_sha="$(git rev-parse HEAD)"

# Ignore prerelease and unrelated tags. Respect a higher version already on main.
release_version="$(node --input-type=module <<'NODE'
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const stableVersion = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/;
const current = JSON.parse(readFileSync('frontend/package.json', 'utf8')).version;
if (!stableVersion.test(current)) {
  throw new Error('The application version must be stable SemVer.');
}
const tags = execFileSync('git', ['tag', '--list', 'v*'], { encoding: 'utf8' })
  .trim().split('\n').map((tag) => tag.slice(1)).filter((tag) => stableVersion.test(tag));
const versions = [current, ...tags].map((version) => version.split('.').map(BigInt));
versions.sort((left, right) => {
  for (let index = 0; index < 3; index++) {
    if (left[index] !== right[index]) return left[index] < right[index] ? -1 : 1;
  }
  return 0;
});
const [major, minor, patch] = versions.at(-1);
console.log(`${major}.${minor}.${patch + 1n}`);
NODE
)"
release_branch="release/$release_version"

git switch -c "$release_branch" "$source_sha"
# Preserve main's complete tree while joining previous production history.
# This also avoids version-file conflicts on subsequent promotions.
git merge --strategy=ours origin/production \
  --message "chore(release): reconcile production history"

(
  cd frontend
  npm version "$release_version" --no-git-tag-version --ignore-scripts
)

git add frontend/package.json frontend/package-lock.json
git commit --message "chore(release): promote $release_version"

{
  echo "version=$release_version"
  echo "branch=$release_branch"
  echo "source_sha=$source_sha"
} >> "$GITHUB_OUTPUT"
