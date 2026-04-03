---
id: overview
title: What is Dotter?
---

:::warning Unofficial Documentation
This is an unofficial documentation site for Dotter. It is not affiliated with or endorsed by the official Dotter project. For the official documentation, visit the [Dotter GitHub repository](https://github.com/SuperCuber/dotter).
:::

Dotter is a dotfile manager and templater. It keeps your configuration files organized, synced across machines, and flexible enough to handle differences between your laptop and desktop.

## Why Use a Dotfile Manager?

You have spent time customizing your shell, editor, and tools. Those settings live in dotfiles scattered around your home directory. You want to back them up in Git and deploy them to new machines.

The naive approach is `ln -s`. It works until:

- You forget what links to where
- Setting up a new machine takes forever
- You want different settings on different machines (battery indicator on laptop, not on desktop)

Dotter solves these problems by giving you a structured way to define where your dotfiles should go and what they should contain.

## Core Concepts

### Files and Targets

Dotter maps your repository files to their target locations. For example, `vimrc` in your repository deploys to `~/.vimrc`.

### Packages

Group related files together. You might have a "vim" package with your Vim configuration, a "shell" package with your Bash and Zsh configs, and a "gui" package with settings for graphical applications. Enable or disable groups per machine.

### Variables and Templates

Dotter templates files using Handlebars. Define variables in your configuration, and Dotter substitutes them before deploying. One source file can produce different results on different machines.

### Symlinks vs. Templates

By default, Dotter decides whether to symlink or template a file:

- **Symlinks**: If a file does not contain any template syntax (no `{{` markers), Dotter creates a symbolic link from the target to the source.
- **Templates**: If a file contains template syntax, Dotter renders it with your variables and copies the result to the target location.

You can also explicitly control this behavior if you prefer.

## What Dotter Does NOT Do

- It does not install software
- It is not a replacement for Ansible or Puppet
- It is not a Git wrapper (you still commit and push yourself)

## How It Works

1. Tell Dotter where your dotfiles live in a repository and where they should go on your system
2. Optionally add variables for machine-specific differences
3. Run `dotter` to deploy

Dotter tracks what it deploys, so `dotter undeploy` cleanly removes everything.

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