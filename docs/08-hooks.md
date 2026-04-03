---
id: hooks
title: Hooks and Helpers
---

Hooks are scripts that run before or after specific operations. Helpers are custom template functions you define as scripts.

## Hook Execution Order

For `dotter deploy`:

1. `pre_deploy.sh` runs
2. Files are deployed
3. Cache is updated
4. `post_deploy.sh` runs

For `dotter undeploy`:

1. `pre_undeploy.sh` runs
2. Files are removed
3. Cache is updated
4. `post_undeploy.sh` runs

## Hook Files

Place hook scripts at:

- `.dotter/pre_deploy.sh`
- `.dotter/post_deploy.sh`
- `.dotter/pre_undeploy.sh`
- `.dotter/post_undeploy.sh`

You can override these locations with command-line flags:

```bash
dotter --pre-deploy path/to/script.sh
dotter --post-deploy path/to/script.sh
```

## Hook Templating

Hooks are templated before execution. Your hook script can use template syntax:

```bash
#!/bin/sh
# pre_deploy.sh
echo "Deploying for user: {{username}}"
```

## Hook Requirements

- Hooks do not need to be executable. If the script is not executable, it is run via the shell interpreter (`sh script` on Unix).
- On Windows, Dotter automatically changes the hook file extension to `.bat` when copying it to the cache directory. Your hook source file can have any extension, but its contents should be valid batch syntax.
- If a hook fails (non-zero exit), Dotter aborts the operation.
- Hooks run in the repository's root directory.
- Hooks are **skipped** during `--dry-run` mode.

## Example Hook

```bash
#!/bin/sh
# .dotter/pre_deploy.sh
# Backup existing configs before deploying

BACKUP_DIR="$HOME/.dotfiles-backup/$(date +%Y%m%d_%H%M%S)"

for file in ~/.bashrc ~/.vimrc; do
    if [ -f "$file" ] && [ ! -L "$file" ]; then
        mkdir -p "$BACKUP_DIR"
        cp -v "$file" "$BACKUP_DIR/"
    fi
done
```

## Custom Script Helpers

You can define custom Handlebars helpers as scripts in your configuration:

```toml
[helpers]
my_helper = "scripts/my_helper.sh"
```

The helper can then be used in templates:

```handlebars
{{my_helper "argument"}}
```

The helper receives the argument as a command-line argument and its stdout is inserted into the template.

Helpers require the `scripting` feature (enabled by default).
