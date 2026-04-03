---
id: getting-started
title: Getting Started
---

This guide walks you through setting up Dotter from scratch. We will build a real dotfiles repository together, step by step. By the end, you will have a working setup you can actually use.

## Before We Start

You need two things:

- **Dotter installed**. If you have not done that yet, go to the [installation guide](installation) first.
- **A directory for your dotfiles**. Anywhere on your system. We will call it `dotfiles/`.

```bash
mkdir ~/dotfiles
cd ~/dotfiles
```

:::tip What if I use fish, Nushell, PowerShell, or another shell?

This guide uses Bash and Zsh for examples because they are the most common. But Dotter does not care what shell you use. The configuration files (TOML) and templates (Handlebars) are shell-agnostic. Whether you use fish, Nushell, PowerShell, Elvish, Oil, or anything else — the concepts are identical. Just replace `.bashrc` with your shell's config file throughout this guide.

A quick reference for common shells:

| Shell | Config file location |
|-------|---------------------|
| Bash | `~/.bashrc` |
| Zsh | `~/.zshrc` |
| fish | `~/.config/fish/config.fish` |
| Nushell | `~/.config/nushell/config.nu` |
| PowerShell | `$PROFILE` (run `$PROFILE` in PowerShell to find it) |
| Elvish | `~/.config/elvish/rc.elv` |
| Oil | `~/.config/oil/oshrc` |

:::

## Step 1: Initialize the Repository

Run this command:

```bash
dotter init
```

Dotter just created a `.dotter/` directory with three files:

```text
dotfiles/
├── .dotter/
│   ├── global.toml    # What packages exist, and what files they contain
│   ├── local.toml     # Which packages to enable on this machine
│   └── cache.toml      # Dotter's memory of what it has deployed
```

Let us look at what `global.toml` says:

```toml
[default.files]
"somefile" = ""
```

This is a placeholder. The `init` command scanned your current directory, found all non-hidden files, and created entries for them. Since your dotfiles directory is empty, it created a dummy entry. We will fix this shortly.

And `local.toml`:

```toml
packages = ["default"]
```

This says: "On this machine, enable the `default` package." Simple enough.

## Step 2: Add Your First Real Config File

Pick a config file you already use. It does not matter which one. Here are some common options:

| If you use... | The file is... | We will call it... |
|---------------|----------------|--------------------|
| Bash | `~/.bashrc` | `bashrc` |
| Zsh | `~/.zshrc` | `zshrc` |
| fish | `~/.config/fish/config.fish` | `fish_config.fish` |
| Nushell | `~/.config/nushell/config.nu` | `config.nu` |
| PowerShell | `$PROFILE` | `profile.ps1` |
| Neovim | `~/.config/nvim/init.lua` | `init.lua` |
| Git | `~/.gitconfig` | `gitconfig` |

Pick one. Copy it into your dotfiles directory:

```bash
# Example for Bash
cp ~/.bashrc ~/dotfiles/bashrc

# Example for fish
cp ~/.config/fish/config.fish ~/dotfiles/fish_config.fish

# Example for Nushell
cp ~/.config/nushell/config.nu ~/dotfiles/config.nu
```

Your directory now looks like this:

```text
dotfiles/
├── .dotter/
│   ├── global.toml
│   ├── local.toml
│   └── cache.toml
└── bashrc          # or whatever file you picked
```

## Step 3: Tell Dotter Where the File Should Go

Open `.dotter/global.toml` in your editor. Replace the dummy entry with your actual file:

```toml
[default.files]
"bashrc" = "~/.bashrc"
```

Or for fish:

```toml
[default.files]
"fish_config.fish" = "~/.config/fish/config.fish"
```

Or for Nushell:

```toml
[default.files]
"config.nu" = "~/.config/nushell/config.nu"
```

That is it. One line. The left side is the filename in your repository. The right side is where it should end up on your system.

## Step 4: Deploy

Run Dotter:

```bash
dotter
```

You should see output like:

```
INFO  [dotter] Deployed file "bashrc" -> "~/.bashrc"
```

Verify it worked:

```bash
ls -la ~/.bashrc
# Output: ~/.bashrc -> /home/you/dotfiles/bashrc
```

Your config file is now a symlink pointing to your repository. Any change you make to `~/dotfiles/bashrc` takes effect immediately.

### Try It

```bash
echo "# Hello from Dotter" >> ~/dotfiles/bashrc
tail -1 ~/.bashrc
# Output: # Hello from Dotter
```

It works. Your dotfile is managed.

## Step 5: Add Templating

Now for the part that makes Dotter different from a simple symlink tool. Let us make your config file adapt to different machines.

### Add a Variable

Edit `.dotter/global.toml`:

```toml
[default.files]
"bashrc" = "~/.bashrc"

[default.variables]
editor = "vim"
```

The `[default.variables]` section defines variables you can use inside your files.

### Use the Variable

Open your config file in the repository (`bashrc`, `zshrc`, `config.fish`, whatever you picked) and add this line somewhere:

```bash
export EDITOR={{editor}}
```

:::tip For non-Bash/Zsh users

The template syntax is the same regardless of your shell. Just place `{{editor}}` wherever you need the value:

```fish
# fish config
set -gx EDITOR {{editor}}
```

```nu
# Nushell config
$env.EDITOR = "{{editor}}"
```

```powershell
# PowerShell profile
$env:EDITOR = "{{editor}}"
```

:::

### Deploy Again

```bash
dotter
```

Check the result:

```bash
grep EDITOR ~/.bashrc
# Output: export EDITOR=vim
```

The `{{editor}}` was replaced with `vim`. This is templating.

### Why This Matters

Right now you have one machine. But eventually you will have another — a work laptop, a server, a new desktop. Instead of maintaining separate copies of every config file, you keep one source and let Dotter fill in the differences:

On your laptop:

```toml
# .dotter/laptop.toml
packages = ["default"]

[variables]
editor = "nvim"
```

On your server:

```toml
# .dotter/server.toml
packages = ["default"]

[variables]
editor = "vim"
```

Same source file. Different values. No duplication.

### A Note on Symlinks vs. Templates

Something changed when you added the template syntax. Before, your file was a symlink:

```bash
ls -la ~/.bashrc
# Was: ~/.bashrc -> /home/you/dotfiles/bashrc
```

After adding `{{editor}}`, it is now a regular file:

```bash
ls -la ~/.bashrc
# Now: -rw-r--r-- 1 user user ... ~/.bashrc
```

This is intentional. When a file contains template syntax (`{{...}}`), Dotter renders it and copies the result instead of symlinking. The reason is simple: a symlink always points to the exact same source file, but a template produces different output depending on the variables. Dotter needs to render and copy the result, so it cannot be a symlink.

If you later remove the template syntax from your source file, Dotter will **not** automatically convert it back to a symlink — it tracks the file as a template in its cache. If you want to switch back, you would need to undeploy and deploy again.

## Step 6: Organize with Packages

One file is easy to manage. But as you add more, things get messy. This is where packages help.

Let us say you want to add a second config — maybe your Git configuration.

### Add the File

```bash
cp ~/.gitconfig ~/dotfiles/gitconfig
```

### Create a New Package

Edit `.dotter/global.toml`:

```toml
# Shell package
[shell.files]
"bashrc" = "~/.bashrc"

# Git package
[git.files]
"gitconfig" = "~/.gitconfig"
```

### Enable Both Packages

Edit `.dotter/local.toml`:

```toml
packages = ["shell", "git"]
```

### Deploy

```bash
dotter
```

Both files are now deployed. The `shell` package manages your shell config, the `git` package manages your Git config. They are separate, so you can enable or disable them independently on different machines.

Want Git config on your desktop but not on a shared server? Remove `"git"` from that machine's `local.toml`. That is all.

## Step 7: Add Package Dependencies

Some packages naturally depend on others. Your editor config probably assumes your shell is set up. Your terminal config might assume your fonts are configured.

Dotter handles this with the `depends` field:

```toml
[editor]
depends = ["shell"]

[editor.files]
"init.lua" = "~/.config/nvim/init.lua"

[shell.files]
"bashrc" = "~/.bashrc"
```

Now enabling `editor` automatically enables `shell`:

```toml
# local.toml
packages = ["editor"]
# This also enables "shell" because editor depends on it
```

## What You Have Built

At this point, you have:

```text
dotfiles/
├── .dotter/
│   ├── global.toml    # Package definitions
│   ├── local.toml     # Selected packages for this machine
│   └── cache.toml      # Deployment tracking
├── bashrc             # Your shell config (symlinked)
└── gitconfig          # Your Git config (symlinked)
```

And you understand:

- **Files and targets**: Mapping repository files to system locations
- **Variables**: Values that get substituted into your files
- **Packages**: Groups of related files you can enable/disable
- **Dependencies**: Packages that automatically pull in other packages

## Where to Go Next

- **Want a complete, ready-to-use starting point?** Check the [Starter Config](starter-config) — a full configuration you can copy and customize.
- **Need the full command reference?** See [Usage](usage).
- **Want to understand every configuration option?** Read the [Configuration Structure](config-structure) and [Template Reference](templates).
- **Looking for patterns others use?** Browse the [Examples](examples).
- **Coming from another dotfile manager?** The [Migration Guide](migration) covers Stow, Chezmoi, RCM, and more.
