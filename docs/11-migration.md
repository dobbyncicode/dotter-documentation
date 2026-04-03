---
id: migration
title: Migrating to Dotter
---

If you are coming from another dotfile management approach, this guide helps you transition to Dotter.

## From Manual Symlinks

If you have been using `ln -s` manually or with a shell script.

### Before

```bash
ln -s ~/dotfiles/bashrc ~/.bashrc
ln -s ~/dotfiles/vimrc ~/.vimrc
ln -s ~/dotfiles/gitconfig ~/.gitconfig
```

### After

Create `.dotter/global.toml`:

```toml
[default.files]
"bashrc" = "~/.bashrc"
"vimrc" = "~/.vimrc"
"gitconfig" = "~/.gitconfig"
```

And `.dotter/local.toml`:

```toml
packages = ["default"]
```

Then run:

```bash
# Remove old symlinks first
rm ~/.bashrc ~/.vimrc ~/.gitconfig

# Deploy with Dotter
dotter
```

### Benefits

- No more manual symlink management
- Easy to add machine-specific overrides
- Templating support for dynamic content
- Clean `undeploy` command

## From GNU Stow

GNU Stow uses a different approach: it symlinks entire directory trees.

### Before (Stow)

```text
dotfiles/
├── bash/
│   └── .bashrc
├── vim/
│   └── .vimrc
└── git/
    └── .gitconfig
```

```bash
cd ~/dotfiles
stow bash
stow vim
stow git
```

### After (Dotter)

```text
dotfiles/
├── .dotter/
│   ├── global.toml
│   └── local.toml
├── bashrc
├── vimrc
└── gitconfig
```

```toml
# .dotter/global.toml
[default.files]
"bashrc" = "~/.bashrc"
"vimrc" = "~/.vimrc"
"gitconfig" = "~/.gitconfig"
```

```bash
# .dotter/local.toml
packages = ["default"]
```

### Migration Steps

1. Flatten your Stow directory structure (or keep it and adjust paths)
2. Create the `.dotter/` configuration
3. Remove Stow-managed symlinks: `stow -D <package>`
4. Run `dotter`

### Key Differences

| Feature | Stow | Dotter |
|---------|------|--------|
| Symlinks | Always symlinks | Symlinks or templates |
| Templating | None | Handlebars |
| Machine-specific | Manual directory structure | Variables and conditions |
| Package deps | None | Native support |
| Undo | `stow -D` | `dotter undeploy` |

## From Chezmoi

Chezmoi is the closest competitor to Dotter in terms of features.

### Before (Chezmoi)

```bash
chezmoi init
chezmoi add ~/.bashrc
chezmoi apply
```

Chezmoi uses a different directory structure and template syntax.

### After (Dotter)

Dotter uses a simpler configuration model with TOML instead of Chezmoi's more complex structure.

### Migration Steps

1. Export your dotfiles from Chezmoi's source directory:

```bash
chezmoi source-path
# Copy files from the source path to your new dotfiles repo
```

2. Convert Chezmoi templates to Handlebars:

Chezmoi uses Go templates. These need conversion:

| Chezmoi | Dotter (Handlebars) |
|---------|---------------------|
| `{{ .chezmoi.hostname }}` | `{{dotter.hostname}}` |
| `{{ .chezmoi.os }}` | `{{dotter.os}}` |
| `{{ .variable }}` | `{{variable}}` |
| `{{ if eq .os "linux" }}` | `{{#if dotter.linux}}` |
| `{{ output "whoami" }}` | `{{command_output "whoami"}}` |
| `{{- if hasExecutable "vim" -}}` | `{{#if (is_executable "vim")}}` |

3. Create `.dotter/global.toml` with your file mappings
4. Create `.dotter/local.toml` with your package selection
5. Run `dotter --dry-run` to verify, then `dotter`

### Key Differences

| Feature | Chezmoi | Dotter |
|---------|---------|--------|
| Config format | TOML + Go templates | TOML + Handlebars |
| Encryption | Age/GPG | Not built-in |
| State tracking | `.chezmoistate.boltdb` | `.dotter/cache.toml` |
| Complexity | High | Low |
| Learning curve | Steeper | Gentler |

## From Bare Git Repository

A bare repository approach uses `git --git-dir` to track dotfiles in place.

### Before

```bash
git init --bare $HOME/.cfg
alias config='/usr/bin/git --git-dir=$HOME/.cfg/ --work-tree=$HOME'
config checkout
```

### After

1. Clone or copy your tracked files into a regular directory:

```bash
mkdir ~/dotfiles
# Copy your tracked files here
```

2. Create the `.dotter/` configuration
3. Set up your Git repository:

```bash
cd ~/dotfiles
git init
git add .
git commit -m "Migrate from bare repository"
```

4. Run `dotter`

### Benefits

- Files are in a normal directory, not scattered in your home directory
- Clear separation between repository and deployed state
- Templating support
- Easy to manage multiple machines

## From RCM (rcm)

RCM uses tag-based file management with `rcup` and `rcdn`.

### Before (RCM)

```text
dotfiles/
├── bashrc
├── vimrc
└── rcrc
```

```bash
rcup
```

### After (Dotter)

RCM's tag system maps to Dotter's packages:

```toml
# .dotter/global.toml
[default.files]
"bashrc" = "~/.bashrc"
"vimrc" = "~/.vimrc"
```

```toml
# .dotter/local.toml
packages = ["default"]
```

### Key Differences

| Feature | RCM | Dotter |
|---------|-----|--------|
| Organization | Tags (directories) | Packages (TOML sections) |
| Templating | None | Handlebars |
| Config file | `rcrc` | `.dotter/global.toml` |
| Machine-specific | Host tags | Hostname-based local configs |

## General Migration Tips

### 1. Start Small

Migrate one or two files first. Get comfortable with Dotter before moving everything.

### 2. Keep Your Old Setup Until Confirmed

Do not delete your old dotfile management until you have verified Dotter works correctly on your machine.

### 3. Use Dry Run

```bash
dotter --dry-run -vv
```

This shows you exactly what Dotter will do before it does it.

### 4. Test Undeploy

After deploying, test that undeploy works:

```bash
dotter undeploy
# Verify files are removed
# Then deploy again
dotter
```

### 5. Version Control

Commit your Dotter configuration alongside your dotfiles:

```bash
cd ~/dotfiles
git add .dotter/
git commit -m "Add Dotter configuration"
```

### 6. Machine-Specific Overrides

If your old system had machine-specific files, use Dotter's hostname-based configs:

```text
.dotter/
├── global.toml      # Shared configuration
├── laptop.toml      # Laptop-specific settings
└── desktop.toml     # Desktop-specific settings
```

Each machine automatically picks up its config based on hostname.