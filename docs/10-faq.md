---
id: faq
title: FAQ and Troubleshooting
---

Common questions and solutions for issues you might encounter with Dotter.

## General Questions

### What is the difference between symlinks and templates?

**Symlinks** create a link from the target location to your source file. Any changes to the source immediately appear at the target. Use symlinks for files that do not need to vary between machines.

**Templates** are rendered with your variables and copied to the target. The target file is a regular file, not a link. Use templates for files that need different content on different machines.

By default, Dotter automatically chooses:
- Symlink if the file contains no `{{` template markers
- Template if the file contains template syntax

You can override this with the `type` field in your configuration.

### Can I use Dotter with existing dotfiles?

Yes. Dotter does not require renaming your files. Just point the source path to your existing file:

```toml
[default.files]
".config/nvim/init.vim" = "~/.config/nvim/init.vim"
```

Dotter will symlink or template your file to the correct location.

### Does Dotter work on Windows?

Yes, but with limitations:

1. **Developer Mode required for symlinks**: Without Developer Mode, Dotter falls back to copying files instead of symlinking.

2. **File paths**: Use forward slashes (`/`) in your configuration for cross-platform compatibility. Dotter handles path conversion.

3. **Hooks**: The source file can have any extension; on Windows it is renamed to `.bat` and must contain batch syntax. PowerShell (`.ps1`) files will not work.

4. **Owner field**: The `owner` field is ignored on Windows.

### What happens if I manually edit a deployed file?

**For symlinks**: Your edits go directly to the source file. This is fine and expected.

**For templates**: Your edits are in the deployed copy. Running `dotter` again overwrites your changes with a fresh template render. Either:
- Edit the source file in your repository instead
- Use `--force` if you intentionally want to overwrite

### How do I handle secrets and passwords?

Never commit secrets to version control. Instead:

**Option 1: Local-only variables**

```toml
# In local.toml (add to .gitignore)
[variables]
api_token = "secret123"
```

**Option 2: Environment variables via command output**

```bash
# In your template
export API_KEY={{command_output "printenv API_KEY"}}
```

The `command_output` helper runs the shell command at render time, so the environment variable is read from the current environment. If the variable is not set, the output is empty.

**Option 3: External secret manager**

```bash
# In your template
export API_KEY={{command_output "pass show api/key"}}
```

### Can I run Dotter as root?

Running Dotter as root is not recommended. Files will be owned by root, which causes problems:

- Your regular user cannot edit them
- Applications may fail due to permission issues

If you ran Dotter as root by mistake:

```bash
# As root
dotter undeploy

# Remove the cache
rm -rf .dotter/cache.toml .dotter/cache/

# Re-run as regular user
dotter
```

If you need to deploy system-wide files, use the `owner` field:

```toml
[system.files]
"config" = { target = "/etc/app/config", owner = "root" }
```

## Troubleshooting

### Error: "Configuration already exists"

When running `dotter init`:

```
Configuration already exists. Use --force to overwrite.
```

**Cause**: `.dotter/global.toml` or `.dotter/local.toml` already exists.

**Solution**: Use `--force` to overwrite:

```bash
dotter init --force
```

Or manually remove existing configuration first.

### Files are not being deployed

**Check 1: Package enabled**

Make sure the package is in your `local.toml`:

```toml
packages = ["default", "your-package"]
```

**Check 2: Correct source path**

Verify the source file exists at the path you specified.

**Check 3: Target not empty**

If the target exists with unexpected content, Dotter skips it. Use `--dry-run` to see what would happen, then `--force` to overwrite.

**Check 4: Condition failing**

If you have an `if` condition, it might be evaluating to false:

```toml
[default.files]
"file" = { target = "~/.file", if = "some_condition" }
```

Run with `-vvv` to see condition evaluation.

### Error: "file is not valid UTF-8"

```
WARN File "binary_file" is not valid UTF-8 - detecting as symlink
```

**Cause**: Dotter cannot template binary files.

**Solution**: Explicitly mark the file as a symbolic link:

```toml
[default.files]
"binary" = { target = "~/.binary", type = "symbolic" }
```

### Target is not being updated after source changes

**For symlinks**: Changes should be immediate. Verify the symlink exists:

```bash
ls -la ~/.bashrc
# Should show: ~/.bashrc -> /path/to/repo/bashrc
```

**For templates**: Run `dotter` again to re-render:

```bash
dotter
```

Or use `dotter watch` to auto-deploy on changes.

### Error: "Cannot undeploy without a cache"

```
Error: load cache: Cannot undeploy without a cache.
```

**Cause**: `.dotter/cache.toml` is missing or corrupted.

**Solution**: The cache tracks what Dotter deployed. Without it, Dotter does not know what to remove. You have two options:

1. **Restore the cache**: If you have a backup or committed the cache file
2. **Manually remove files**: Delete deployed files yourself

### Warning: "No permission to create symbolic links" (Windows)

```
WARN No permission to create symbolic links.
Proceeding by copying instead of symlinking.
```

**Cause**: Developer Mode is not enabled on Windows.

**Solution**: Enable Developer Mode in Windows Settings, or accept that files will be copied instead of symlinked.

### Dotter is deploying files I did not specify

**Check 1: Package dependencies**

Packages can have dependencies. Check if another package you enabled pulls in the unwanted package:

```toml
[vim]
depends = ["default"]  # This enables "default" when "vim" is enabled
```

**Check 2: Directory recursion**

If your source is a directory, all contents are deployed:

```toml
[default.files]
"config" = "~/.config"  # Deploys ALL files in config/
```

Disable recursion:

```toml
[default.files]
"config" = { target = "~/.config", recurse = false }
```

### Template variable is not being replaced

**Check 1: Variable defined**

Ensure the variable exists in your configuration:

```toml
[default.variables]
my_var = "value"
```

**Check 2: Correct syntax**

Handlebars syntax requires double braces:

```handlebars
{{my_var}}  # Correct
{my_var}    # Wrong - single braces
%my_var%    # Wrong - not Handlebars
```

**Check 3: Package selected**

Variables are package-scoped. Make sure the package defining the variable is enabled:

```toml
[vim.variables]
editor = "vim"

[vim.files]
"vimrc" = "~/.vimrc"
```

### Error: "sudo: command not found"

**Cause**: Dotter uses `sudo` for files with `owner` specified, but `sudo` is not installed.

**Solution**: Install `sudo` or remove the `owner` field from your configuration.

### Changes reverted after running Dotter

**Cause**: You edited a template target file. Dotter re-renders it each time you run.

**Solution**: Edit the source file in your repository, not the deployed file.

### Hook script not running

**Check 1: File exists**

Hooks must be at the default location or specified with flags:

```bash
.dotter/pre_deploy.sh
.dotter/post_deploy.sh
.dotter/pre_undeploy.sh
.dotter/post_undeploy.sh
```

**Check 2: Not in dry-run mode**

Hooks are skipped during `--dry-run`. Run without the flag to test hooks.

**Check 3: Script has proper shebang**

```bash
#!/bin/sh
# or
#!/bin/bash
```

**Check 4: No errors in script**

Run the hook manually to debug:

```bash
./.dotter/pre_deploy.sh
```

Note: Hooks do not need to be executable. If the script is not executable, Dotter runs it via `sh script`.

### Watcher not detecting changes

**Check 1: Correct directory**

Run `dotter watch` from your repository root:

```bash
cd ~/dotfiles
dotter watch
```

**Check 2: Ignored paths**

The watcher ignores:
- `.dotter/cache/`
- `.dotter/cache.toml`
- `.git/`
- `DOTTER_SYMLINK_TEST`

**Check 3: File system limits**

Some systems have limits on inotify watchers. Increase the limit:

```bash
# Check current limit
cat /proc/sys/fs/inotify/max_user_watches

# Increase temporarily
echo 100000 | sudo tee /proc/sys/fs/inotify/max_user_watches
```

### Error: "failed to get the computer hostname"

```
Error: failed to get the computer hostname
```

**Cause**: The `hostname` command or system call is not working.

**Solution**: Ensure `hostname` command works:

```bash
hostname
```

If it fails, fix your system's hostname configuration, or use the `-l` flag to specify your local config directly.

## Performance

### Dotter is slow with many files

If you have hundreds or thousands of files:

1. **Use symlinks instead of templates**: Templates require reading and rendering each file.

2. **Disable recursion for large directories**: Explicitly list files instead.

3. **Use packages**: Group related files and only enable what you need per machine.

4. **Avoid expensive helpers**: `command_success` and `command_output` run shell commands for each file.

### Watch mode uses too much CPU

The watcher monitors the entire directory tree. To reduce overhead:

1. **Use packages**: Only enable necessary packages.

2. **Clean up repository**: Remove files you do not actually deploy.

## Getting Help

If your issue is not listed here:

1. **Search existing issues**: [GitHub Issues](https://github.com/SuperCuber/dotter/issues)

2. **Check the wiki**: [Dotter Wiki](https://github.com/SuperCuber/dotter/wiki)

3. **Create a new issue**: Provide:
   - Your configuration files (sanitize sensitive data)
   - Full error message
   - Output of `dotter --version`
   - Output with `-vvv` flag
   - Steps to reproduce