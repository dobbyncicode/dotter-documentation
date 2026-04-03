---
id: usage
title: Command-Line Usage
---

Dotter provides several commands and options for managing your dotfiles. This page covers all available commands and their flags.

## Commands Overview

Dotter has the following subcommands:

| Command | Description |
|---------|-------------|
| `deploy` | Deploy files to their target locations (default) |
| `undeploy` | Remove all deployed files |
| `init` | Initialize a new Dotter configuration |
| `watch` | Continuously watch for changes and auto-deploy |
| `gen-completions` | Generate shell completions |

Running `dotter` without a subcommand is equivalent to `dotter deploy`.

## Deploy Command

Deploy is the default command. It reads your configuration and creates symlinks or template copies.

```bash
dotter deploy
# Or simply:
dotter
```

### How Deployment Works

1. Dotter loads `global.toml` and `local.toml` (or `<hostname>.toml`)
2. It merges the selected packages' files and variables
3. For each file, it determines whether to symlink or template:
   - Files with `{{` template syntax are templated
   - Otherwise, symlinks are created (on Unix; on Windows without Developer Mode, files are copied)
4. Symlinks point from the target to the source
5. Templates are rendered and copied to the target

### Deployment Scenarios

When deploying, Dotter handles several cases:

- **New file**: Creates a symlink or copies the rendered template
- **Existing symlink to source**: Skips (already correctly deployed)
- **Existing symlink to wrong target**: Skips with warning (use `--force` to overwrite)
- **Existing regular file**: Skips with warning (use `--force` to overwrite)
- **Source file missing**: Skips with error

### Cache Behavior

Dotter stores deployment state in `.dotter/cache.toml` and rendered template copies in `.dotter/cache/`. If the cache file is missing, `deploy` continues with an empty cache (emitting a warning) — it assumes nothing was previously deployed. However, `undeploy` requires a valid cache file and will fail without one.

### Deploy Options

#### --dry-run (-d)

Preview what would happen without making changes:

```bash
dotter --dry-run
# or
dotter -d
```

Dry run implies at least one level of verbosity (`-v`).

#### --force (-f)

Overwrite unexpected target files instead of skipping:

```bash
dotter --force
# or
dotter -f
```

Use this when you have modified deployed files and want Dotter to overwrite them.

When files are skipped (without `--force`), Dotter prints an error message suggesting the flag and exits with status code 1.

**Warning**: This overwrites files that have been manually edited. Make sure your source files are up to date.

#### --verbose (-v)

Increase output verbosity. Can be specified multiple times:

```bash
dotter -v      # Info level: shows what Dotter is doing
dotter -vv     # Debug level: more detailed information
dotter -vvv    # Trace level: extremely verbose, for debugging
```

With `-v` or higher, Dotter shows differences between old and new file contents when updating existing templates (not for new file creation or symlinks).

#### --quiet (-q)

Show only errors:

```bash
dotter --quiet
# or
dotter -q
```

Useful in scripts where you only care about success or failure.

#### --noconfirm (-y)

Automatically answer yes to prompts:

```bash
dotter --noconfirm
# or
dotter -y
```

Normally, Dotter asks before deleting empty directories. This flag skips prompts.

#### --patch (-p)

Apply an additional configuration patch from stdin:

```bash
echo '[files]
"extra" = "~/.extra"

[variables]
patch_var = "value"' | dotter --patch
```

The patch is applied after loading `local.toml`. This is useful for:

- Testing configuration changes temporarily
- CI/CD pipelines that need to inject additional variables
- Scripted deployments with runtime configuration

When using `--patch`, `--noconfirm` is implied.

**Note**: `--patch` affects the `deploy` command (and `watch`, which calls deploy internally). It has no effect on `undeploy`, which always passes `None` for the patch parameter.

#### Configuration File Options

Specify custom locations for configuration files:

```bash
dotter --global-config path/to/global.toml
dotter --local-config path/to/local.toml
dotter --cache-file path/to/cache.toml
dotter --cache-directory path/to/cache
```

Defaults:
- Global config: `.dotter/global.toml`
- Local config: `.dotter/local.toml` (or `.dotter/<hostname>.toml`)
- Cache file: `.dotter/cache.toml`
- Cache directory: `.dotter/cache/`

#### Hook Options

Specify locations for hook scripts:

```bash
dotter --pre-deploy path/to/pre_deploy.sh
dotter --post-deploy path/to/post_deploy.sh
dotter --pre-undeploy path/to/pre_undeploy.sh
dotter --post-undeploy path/to/post_undeploy.sh
```

Defaults:
- Pre-deploy: `.dotter/pre_deploy.sh`
- Post-deploy: `.dotter/post_deploy.sh`
- Pre-undeploy: `.dotter/pre_undeploy.sh`
- Post-undeploy: `.dotter/post_undeploy.sh`

#### --diff-context-lines

Control how many lines of context appear in diffs:

```bash
dotter --diff-context-lines 5
```

Default is 3 lines. Only relevant when using verbosity (`-v` or higher).

## Undeploy Command

Remove all deployed files:

```bash
dotter undeploy
```

This command:

1. Reads the cache file to know what was deployed
2. Removes each deployed symlink or template
3. Deletes empty parent directories (prompts unless `--noconfirm`)
4. Updates or removes the cache file

### Undeploy Options

Undeploy accepts the same global options as deploy:

```bash
dotter undeploy --dry-run    # Preview what would be removed
dotter undeploy --force      # Remove files even if they changed
dotter undeploy --quiet      # Only show errors
dotter undeploy --noconfirm  # Do not prompt for directory deletion
```

**Note**: You need a valid cache file to undeploy. If the cache is missing or corrupted, Dotter cannot know what to remove.

## Init Command

Initialize a new Dotter repository:

```bash
dotter init
```

This creates:
- `.dotter/global.toml` with a "default" package containing all non-hidden files in the current directory
- `.dotter/local.toml` selecting the "default" package
- `.dotter/cache.toml` (empty)

It also removes the existing cache directory (`.dotter/cache/`) if it exists.

### Init Options

```bash
dotter init --force    # Overwrite existing configuration
```

The file targets are set to empty strings, which you should edit to proper paths.

## Watch Command

Continuously monitor your repository and auto-deploy on changes:

```bash
dotter watch
```

This is useful during development when you are actively editing your dotfiles and want changes to deploy automatically.

### How Watch Works

1. Dotter monitors the current directory and all subdirectories
2. When a file changes, it triggers a deploy
3. The following are ignored:
   - `.dotter/cache/` directory
   - `.dotter/cache.toml` file
   - `.git/` directory
   - `DOTTER_SYMLINK_TEST` file (used internally for symlink capability testing on Windows)

### Watch Options

```bash
dotter watch --dry-run    # Preview each deploy without making changes
dotter watch -vv         # Show detailed output for each deploy
```

Note: Watch requires the `watch` feature to be enabled at compile time (enabled by default).

### Stopping Watch

Press `Ctrl+C` to stop watching.

## Gen-Completions Command

Generate shell completion scripts:

```bash
# Print to stdout
dotter gen-completions --shell bash

# Write to a file
dotter gen-completions --shell bash --to ~/.local/share/bash-completion/completions/dotter
```

Supported shells:
- `bash`
- `zsh`
- `fish`
- `elvish`
- `powerShell`

## Options

Options fall into two categories: **global** options (work anywhere on the command line) and **positional** options (must come before the subcommand).

### Global Options

These work with any subcommand and can appear anywhere:

| Option | Short | Description |
|--------|-------|-------------|
| `--global-config` | `-g` | Location of global config |
| `--local-config` | `-l` | Location of local config |
| `--dry-run` | `-d` | Preview without making changes |
| `--verbose` | `-v` | Increase verbosity (up to 3) |
| `--quiet` | `-q` | Only show errors |
| `--force` | `-f` | Overwrite unexpected files |
| `--noconfirm` | `-y` | Skip confirmation prompts |
| `--patch` | `-p` | Apply patch from stdin |
| `--help` | `-h` | Show help |
| `--version` | `-V` | Show version |

### Pre-Command Options

These must appear **before** the subcommand (e.g., `dotter --cache-file x deploy`, not `dotter deploy --cache-file x`):

| Option | Default | Description |
|--------|---------|-------------|
| `--cache-file` | `.dotter/cache.toml` | Location of cache file |
| `--cache-directory` | `.dotter/cache/` | Directory for cached templates |
| `--pre-deploy` | `.dotter/pre_deploy.sh` | Pre-deploy hook location |
| `--post-deploy` | `.dotter/post_deploy.sh` | Post-deploy hook location |
| `--pre-undeploy` | `.dotter/pre_undeploy.sh` | Pre-undeploy hook location |
| `--post-undeploy` | `.dotter/post_undeploy.sh` | Post-undeploy hook location |
| `--diff-context-lines` | `3` | Lines of context in diffs |

## Exit Codes

Dotter exits with:

- `0`: Success
- `1`: Error occurred

## Warnings

### Running as Root

If you run Dotter as `root` (detected via the `USER` environment variable) and your global config file is owned by a different user, Dotter emits a warning:

```
WARN It is not recommended to run Dotter as root, since the cache files and all files not marked with an `owner` field will default to being owned by root.
```

If you are genuinely logged in as root, this is safe to ignore. Otherwise, run `dotter undeploy` as root, remove the cache files, and use Dotter as a regular user.

This makes it easy to use in scripts:

```bash
#!/bin/bash
if dotter; then
    echo "Dotfiles deployed successfully"
else
    echo "Deployment failed"
    exit 1
fi
```

## Common Patterns

### Quick Deployment

```bash
dotter
```

That is all you need for most cases.

### Preview Before Deploying

```bash
dotter --dry-run
```

### Force Update After Manual Changes

If you edited a deployed file and want to reset it:

```bash
dotter --force
```

### Debugging Configuration Issues

```bash
dotter -vvv --dry-run
```

Maximum verbosity with dry run shows exactly what Dotter is thinking.

### Scripted Deployment

```bash
dotter --noconfirm --quiet
```

No prompts, minimal output. Suitable for automated setups.