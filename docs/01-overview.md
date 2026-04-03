---
id: overview
title: What is Dotter?
---

:::warning Unofficial Documentation
This is an unofficial documentation site for Dotter. It is not affiliated with or endorsed by the official Dotter project. For the official documentation, visit the [Dotter GitHub repository](https://github.com/SuperCuber/dotter).
:::

Dotter is a dotfile manager and templater that helps you organize, synchronize, and deploy your configuration files across multiple machines.

## Why Use a Dotfile Manager?

If you have ever spent time customizing your development environment, you probably have a collection of configuration files (dotfiles) scattered around your home directory. These files control how your shell behaves, how your editor looks, which keyboard shortcuts your terminal uses, and much more.

Many people back up these files in a Git repository and create symbolic links manually with `ln -s`. This works, but you quickly run into problems:

- **Hard to track**: Once you have more than a handful of dotfiles, remembering what goes where becomes difficult.
- **Tedious setup**: Setting up a new machine means manually creating every symbolic link.
- **No machine-specific differences**: Want your laptop's config to show a battery indicator but hide it on your desktop? You would need separate files or complicated workarounds.

Dotter solves these problems by giving you a structured way to define where your dotfiles should go and what they should contain.

## Core Concepts

### Files and Targets

At the heart of Dotter is a simple mapping: you tell it where your source files live in your repository, and where they should end up on your system. For example, you might have `vimrc` in your repository that should be deployed to `~/.vimrc`.

### Packages

Packages let you group related files together. You might have a "vim" package with your Vim configuration, a "shell" package with your Bash and Zsh configs, and a "gui" package with settings for graphical applications. This makes it easy to enable or disable groups of files per machine.

### Variables and Templates

Dotter can do more than just link files. It can also template them using the Handlebars templating language. Define variables in your configuration, and Dotter will substitute them into your files before deploying. This lets you have one source file that produces different results on different machines.

### Symlinks vs. Templates

By default, Dotter intelligently decides whether to symlink or template a file:

- **Symlinks**: If a file does not contain any template syntax (no `{{` markers), Dotter creates a symbolic link from the target to the source.
- **Templates**: If a file contains template syntax, Dotter renders it with your variables and copies the result to the target location.

You can also explicitly control this behavior if you prefer.

## What Dotter Is Not

- Dotter is not a full configuration management system like Ansible or Puppet. It focuses specifically on dotfiles.
- Dotter does not install software. It only manages configuration files.
- Dotter is not a Git wrapper. You still need to commit and push your repository changes yourself (though the watch mode can auto-deploy on file changes).

## How It Works

1. You write configuration files (`global.toml` and `local.toml`) that define your packages, files, and variables.
2. You run `dotter` from within your dotfiles repository.
3. Dotter reads your configuration, templates files if needed, and creates symlinks or copies files to their target locations.
4. Dotter keeps a cache of what it deployed, so it can cleanly remove files when you run `dotter undeploy`.

## Next Steps

- Grab the [quick reference](quick-reference) if you just need syntax
- Learn how to [install](installation) Dotter on your system
- Follow the [getting started guide](getting-started) to set up your first dotfiles repository
- Want a complete starting point? Grab the [Starter Config](starter-config)
- Understand [how Dotter works](how-dotter-works) before diving in
- Explore the [usage](usage) documentation for command-line options
- Read the [configuration structure](config-structure), [template reference](templates), and [hooks](hooks)
- Check out [examples](examples) for common patterns
- Migrating from another tool? See the [migration guide](migration)