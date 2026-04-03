---
id: quick-reference
title: Quick Reference
---

When you know what you are doing and just need the syntax.

## Commands

```bash
dotter              # Deploy (default subcommand)
dotter undeploy     # Remove all deployed files
dotter init         # Initialize a new repository
dotter watch        # Auto-deploy on file changes
dotter gen-completions --shell bash  # Shell completions
```

## Common Flags

```bash
dotter --dry-run        # Preview without changes
dotter --force          # Overwrite unexpected targets
dotter -vvv             # Maximum verbosity
dotter --quiet          # Only errors
dotter --noconfirm      # Skip prompts
dotter --patch          # Read additional config from stdin
```

## Configuration File Locations

| File | Default | Purpose |
|------|---------|---------|
| Global config | `.dotter/global.toml` | Define packages, files, variables |
| Local config | `.dotter/local.toml` | Select packages, override variables |
| Hostname config | `.dotter/<hostname>.toml` | Machine-specific local config (fallback) |
| Cache | `.dotter/cache.toml` | Tracks deployed files |
| Cache dir | `.dotter/cache/` | Rendered template copies |

## File Target Syntax

```toml
# Simple (automatic detection)
[default.files]
"bashrc" = "~/.bashrc"

# Explicit symlink
"bashrc" = { target = "~/.bashrc", type = "symbolic" }

# Explicit template
"bashrc" = { target = "~/.bashrc", type = "template" }

# Template with prepend/append
"bashrc" = { target = "~/.bashrc", type = "template", prepend = "# Header\n", append = "\n# Footer" }

# Symlink with owner (Unix)
"config" = { target = "/etc/app.conf", type = "symbolic", owner = "root" }

# Conditional deployment
"linuxrc" = { target = "~/.bashrc", if = "dotter.linux" }

# Disable recursion for directories
"config" = { target = "~/.config", type = "symbolic", recurse = false }

# Exclude a file (set target to empty string)
"old_file" = ""
```

## Package Syntax

```toml
# Define a package
[my_package]
depends = ["other_package"]

[my_package.files]
"source" = "~/.target"

[my_package.variables]
key = "value"
```

## Variable Types

```toml
[default.variables]
# Scalars
name = "value"
count = 42
flag = true

# Nested tables
nested = { key = "value" }
[default.variables.theme]
background = "#282a36"
```

## Template Syntax (Handlebars)

```handlebars
{{variable}}
{{nested.value}}
{{#if condition}}...{{/if}}
{{#unless condition}}...{{/unless}}
{{#if (eq value "expected")}}...{{/if}}
{{#if (and cond1 cond2)}}...{{/if}}
{{#if (or cond1 cond2)}}...{{/if}}
{{#each items}}{{this}}{{/each}}
{{math "5 + 3"}}
{{is_executable "vim"}}
{{command_success "test -f /etc/debian_version"}}
{{command_output "whoami"}}
{{include_template "partials/header.tpl"}}
```

## Built-In Variables

```handlebars
{{dotter.os}}            # "unix" or "windows"
{{dotter.unix}}          # true/false
{{dotter.windows}}       # true/false
{{dotter.linux}}         # true/false
{{dotter.macos}}         # true/false
{{dotter.hostname}}      # Machine hostname
{{dotter.current_dir}}   # Working directory
{{dotter.packages.pkg}}  # true/false for each package
{{dotter.files}}         # Map of source→target for each file
```

## Settings

```toml
[settings]
default_target_type = "automatic"   # "automatic" | "symbolic" | "template"
```

## Hooks

```text
.dotter/pre_deploy.sh      # Runs before deploy
.dotter/post_deploy.sh     # Runs after deploy (cache updated)
.dotter/pre_undeploy.sh    # Runs before undeploy
.dotter/post_undeploy.sh   # Runs after undeploy
```

Hooks are templated before execution. If not executable, they are run via the shell interpreter.

## Override Priority

Variables merge in this order (later overrides earlier):

1. `global.toml` package variables
2. `includes = [...]` files (in order)
3. `local.toml` variables
4. `--patch` stdin

Files merge similarly:

1. `global.toml` package files
2. `includes = [...]` files
3. `local.toml` `[files]` section
4. `--patch` stdin

## Common Patterns

```bash
# Quick deploy
dotter

# Preview changes
dotter --dry-run -vv

# Force overwrite modified files
dotter --force

# Debug deployment
dotter -vvv --dry-run

# Add temporary config
echo '[variables]
extra = "value"' | dotter --patch

# Watch mode
dotter watch
```