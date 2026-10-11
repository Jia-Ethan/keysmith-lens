#!/usr/bin/env bash
# Pre-commit check: no API keys in the lines being added.
# Install: printf '#!/usr/bin/env bash\nexec "$(git rev-parse --show-toplevel)/scripts/check_secrets.sh"\n' > .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit

PATTERN='(sk-(proj-|ant-|svcacct-)?[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{30,}|(OPENAI|ANTHROPIC|GEMINI|GOOGLE|OPENROUTER)_API_KEY *[=:] *["'"'"']?[A-Za-z0-9_-]{16,}|Bearer +[A-Za-z0-9._-]{30,})'

hits=$(git diff --cached -U0 --no-color | grep '^+' | grep -v '^+++' | grep -nE "$PATTERN")
if [ -n "$hits" ]; then
  echo "Commit blocked: the staged changes look like they contain an API key." >&2
  echo "$hits" | cut -c1-160 | sed -E 's/(sk-[A-Za-z0-9_-]{6})[A-Za-z0-9_-]+/\1…<hidden>/g' >&2
  echo "Remove it and commit again. If it is a false positive, use git commit --no-verify." >&2
  exit 1
fi
exit 0
