---
id: starter-config
title: Starter Config
---

A complete, ready-to-use Dotter configuration you can copy, paste, and customize. This is the fastest way to get started if you want something that works out of the box.

## What This Gives You

This starter config sets up:

- **Shell package**: Your shell configuration (Bash, Zsh, fish, or Nushell — pick one)
- **Git package**: Your Git configuration with templated user details
- **Editor package**: Neovim configuration (optional, easy to remove)
- **Machine-specific variables**: Different settings per machine using hostname-based configs

## Quick Start

### 1. Create Your Dotfiles Directory

```bash
mkdir ~/dotfiles
cd ~/dotfiles
```

### 2. Create the Directory Structure

```bash
mkdir -p .dotter
mkdir -p shell
mkdir -p git
mkdir -p editor/nvim
```

### 3. Create `global.toml`

Create `.dotter/global.toml`:

```toml
# .dotter/global.toml

# ============================================
# Shell Configuration
# ============================================
[shell]

[shell.files]
# Pick ONE of the following lines and rename the source file to match your shell:
# "shell/bashrc"        = "~/.bashrc"
# "shell/zshrc"         = "~/.zshrc"
# "shell/fish_config"   = "~/.config/fish/config.fish"
# "shell/config_nu"     = "~/.config/nushell/config.nu"

[shell.variables]
# Common shell variables — customize these
shell_prompt = "$ "
enable_colors = true

# ============================================
# Git Configuration
# ============================================
[git]

[git.files]
"git/gitconfig" = { target = "~/.gitconfig", type = "template" }

[git.variables]
# These are overridden in local.toml — leave as placeholders
git_name = "Your Name"
git_email = "your.email@example.com"
git_sign_commits = false

# ============================================
# Editor Configuration (Neovim)
# ============================================
[editor]
depends = ["shell"]

[editor.files]
"editor/nvim" = { target = "~/.config/nvim", type = "symbolic", recurse = false }
```

### 4. Create `local.toml`

Create `.dotter/local.toml` for your current machine:

```toml
# .dotter/local.toml

packages = ["shell", "git", "editor"]

[variables]
# Override the Git placeholders with your real info
git_name = "Your Name"
git_email = "your.email@example.com"

# Machine-specific settings
shell_prompt = "$ "
```

### 5. Create Your Config Files

Now create the actual config files. Pick the ones you need.

#### Shell Config

Create `shell/bashrc` (or `shell/zshrc`, `shell/fish_config`, etc.):

```bash
# ~/.bashrc — managed by Dotter

# Prompt
PS1='{{shell_prompt}}'

# Colors
{{#if enable_colors}}
export LS_COLORS='di=34:fi=37:ln=36'
alias ls='ls --color=auto'
{{/if}}

# Editor
export EDITOR=nvim

# Path additions
export PATH="$HOME/.local/bin:$PATH"
```

For fish, create `shell/fish_config.fish`:

```fish
# ~/.config/fish/config.fish — managed by Dotter

# Prompt
function fish_prompt
    echo -n '{{shell_prompt}}'
end

# Colors
{{#if enable_colors}}
set -g fish_color_normal normal
set -g fish_color_command 005fd7
set -g fish_color_param 00afff
{{/if}}

# Editor
set -gx EDITOR nvim

# Path additions
fish_add_path $HOME/.local/bin
```

For Nushell, create `shell/config_nu`:

```nu
# ~/.config/nushell/config.nu — managed by Dotter

# Editor
$env.EDITOR = "nvim"

# Path additions
$env.PATH = ($env.PATH | split row (char esep) | prepend ($env.HOME | path join ".local" "bin"))
```

#### Git Config

Create `git/gitconfig`:

```ini
# ~/.gitconfig — managed by Dotter

[user]
    name = {{git_name}}
    email = {{git_email}}
{{#if git_sign_commits}}
    signingkey = {{git_signing_key}}
{{/if}}

[core]
    editor = nvim
    autocrlf = input

[init]
    defaultBranch = main

[push]
    default = simple

[alias]
    st = status
    co = checkout
    br = branch
    lg = log --oneline --graph --decorate

{{#if git_sign_commits}}
[commit]
    gpgsign = true
{{/if}}
```

#### Editor Config (Neovim)

If you want the Neovim package, create a minimal `editor/nvim/init.lua`:

```lua
-- ~/.config/nvim/init.lua — managed by Dotter

-- Basic settings
vim.opt.number = true
vim.opt.relativenumber = true
vim.opt.tabstop = 4
vim.opt.shiftwidth = 4
vim.opt.expandtab = true

-- Key mappings
vim.keymap.set('n', '<leader>e', ':Neotree toggle<CR>')
```

### 6. Deploy

```bash
cd ~/dotfiles
dotter
```

That is it. Your dotfiles are now managed.

## Customizing

### Adding a New Machine

On a new machine, clone your dotfiles repo and create a hostname-specific config:

```bash
hostname
# Output: workstation

# Create workstation-specific config
cat > .dotter/workstation.toml << 'EOF'
packages = ["shell", "git", "editor"]

[variables]
git_name = "Your Name"
git_email = "work@email.com"
shell_prompt = "❯ "
EOF

# Deploy
dotter
```

Dotter automatically picks up `workstation.toml` because it matches your hostname.

### Removing a Package

Do not want the editor package on a server? Just remove it from the package list:

```toml
# .dotter/server.toml
packages = ["shell", "git"]
# "editor" is not listed — it will not be deployed
```

### Adding Your Own Package

Want to add a terminal emulator config? Add it to `global.toml`:

```toml
[terminal]

[terminal.files]
"terminal/alacritty.yml" = { target = "~/.config/alacritty/alacritty.yml", type = "template" }

[terminal.variables]
font_size = 12
```

Create the file `terminal/alacritty.yml`:

```yaml
font:
  size: {{font_size}}
  family: "FiraCode Nerd Font"
```

Then enable it in your `local.toml`:

```toml
packages = ["shell", "git", "editor", "terminal"]
```

### Adding Variables Per Machine

Override any variable in your machine-specific config:

```toml
# .dotter/laptop.toml
packages = ["shell", "git"]

[variables]
# Larger font on the laptop screen
font_size = 14

# Show battery indicator
show_battery = true

# Different prompt
shell_prompt = "❯ "
```

## What to Do Next

- Read the [Configuration Structure](config-structure) to understand every option
- Browse the [Examples](examples) for common patterns
- Check the [FAQ](faq) if something goes wrong
