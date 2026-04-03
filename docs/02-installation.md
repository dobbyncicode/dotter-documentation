---
id: installation
title: Installation
---

Dotter is available on multiple platforms and through several package managers. Choose the method that works best for your system.

## macOS (Homebrew)

The easiest way to install Dotter on macOS is through Homebrew:

```bash
brew install dotter
```

After installation, verify it works:

```bash
dotter --version
```

## Arch Linux (AUR)

Arch Linux users can choose from three AUR packages:

- **dotter-rs-bin**: Precompiled binary from the latest release. Fastest installation since no compilation is needed.
- **dotter-rs**: Builds the latest release from source on your machine.
- **dotter-rs-git**: Builds from the latest commit on the master branch. Use this if you want the newest features before they are released.

Using an AUR helper like `yay`:

```bash
# Precompiled binary (recommended)
yay -S dotter-rs-bin

# Build from source
yay -S dotter-rs

# Latest development version
yay -S dotter-rs-git
```

Or with `paru`:

```bash
paru -S dotter-rs-bin
```

## Windows (Scoop)

Windows users can install through Scoop:

```bash
scoop install dotter
```

### Windows Requirements

On Windows, creating symbolic links requires Developer Mode to be enabled. Without Developer Mode, Dotter will fall back to copying files instead of symlinking.

To enable Developer Mode:

1. Open Settings
2. Go to Update & Security > For developers
3. Enable Developer Mode

If you do not enable Developer Mode, Dotter will still work, but it will copy template files instead of creating symlinks.

## Other Platforms

If your platform does not have a package manager listed above, you can still install Dotter manually.

### Download Binary

1. Go to the [releases page](https://github.com/SuperCuber/dotter/releases) on GitHub.
2. Download the binary for your platform (e.g., `dotter-linux-x86_64` for 64-bit Linux).
3. Make it executable and place it in your PATH:

```bash
chmod +x dotter-linux-x86_64
sudo mv dotter-linux-x86_64 /usr/local/bin/dotter
```

Or keep it in your dotfiles repository and run it with `./dotter`.

### Install with Cargo

If you have Rust and Cargo installed, you can install Dotter from crates.io:

```bash
cargo install dotter
```

This compiles Dotter from source on your machine. You need Rust 1.85 or later.

## Build from Source

To build the latest version from the Git repository:

```bash
git clone https://github.com/SuperCuber/dotter.git
cd dotter
cargo build --release
```

The binary will be at `target/release/dotter`.

### Build Features

Dotter has optional features that can be enabled at compile time:

- **scripting**: Enables script helpers for Handlebars templates. Allows running external scripts as template helpers.
- **watch**: Enables the `dotter watch` command for continuous file monitoring.

By default, both features are enabled. To disable them:

```bash
# Disable all optional features
cargo build --release --no-default-features

# Enable only specific features
cargo build --release --no-default-features --features scripting
```

## Verify Installation

After installing, verify Dotter is working:

```bash
dotter --version
# Output: dotter 0.13.5 (or your installed version)

dotter --help
# Shows available commands and options
```

## Shell Completions

Dotter can generate shell completions for Bash, Zsh, Fish, Elvish, and PowerShell.

Generate completions to stdout:

```bash
# Bash
dotter gen-completions --shell bash

# Zsh
dotter gen-completions --shell zsh

# Fish
dotter gen-completions --shell fish

# PowerShell
dotter gen-completions --shell powerShell
```

Or write to a file:

```bash
dotter gen-completions --shell bash --to ~/.local/share/bash-completion/completions/dotter
```

Refer to your shell's documentation for where to place completion files.

## Updating

Update Dotter using the same method you used to install:

- **Homebrew**: `brew upgrade dotter`
- **AUR**: `yay -S dotter-rs-bin` or rebuild with your chosen package
- **Scoop**: `scoop update dotter`
- **Cargo**: `cargo install dotter --force`
- **Manual**: Download the new binary and replace the old one