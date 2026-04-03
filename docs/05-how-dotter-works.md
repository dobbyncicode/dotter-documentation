---
id: how-dotter-works
title: How Dotter Works
---

This page explains how Dotter thinks about your dotfiles. Understanding the mental model will help you debug issues, design your configuration, and know what to expect when things go wrong.

## The Big Picture

Dotter sits between your dotfiles repository and your system. It reads configuration files, processes templates, and creates symlinks or copies at the target locations.

```
Your dotfiles repository          Dotter              Your system
┌─────────────────────┐     ┌──────────────┐     ┌─────────────────────┐
│                     │     │              │     │                     │
│  bashrc ────────────┼─────► symlink ─────┼─────► ~/.bashrc ──────────┤
│                     │     │              │     │                     │
│  gitconfig ─────────┼─────► template ────┼─────► ~/.gitconfig ───────┤
│  (with {{vars}})    │     │ (rendered)   │     │                     │
│                     │     │              │     │                     │
│  .dotter/           │     │              │     │                     │
│    global.toml ─────┼─────► config loader│     │                     │
│    local.toml ──────┼────► package filter│     │                     │
│    cache.toml ◄─────┼───── deploy tracker│     │                     │
│                     │     │              │     │                     │
└─────────────────────┘     └──────────────┘     └─────────────────────┘
```

## What Dotter Owns vs. What It Does Not

**Dotter owns:**
- The symlinks it creates (from target to source)
- The template copies it deploys (rendered output at target locations)
- The cache file and directory (`.dotter/cache.toml` and `.dotter/cache/`)

**Dotter does NOT own:**
- Your source files in the repository (it never modifies them)
- Files you manually created at target locations
- Files deployed by other tools

This distinction matters for `undeploy`. Dotter only removes what it knows about (from the cache). It will not touch files it did not create.

## The Two-Phase System

Dotter operates in two distinct phases:

### Phase 1: Configuration Loading

Dotter reads and merges configuration files. This produces a single, flat list of files to deploy and a single set of variables for templating.

The loading order is: `global.toml` → includes → package filtering → package merging → `default_target_type` → `local.toml` patches → stdin patch → cleanup (empty targets, directory expansion, tilde expansion, condition filtering).

At the end of this phase, Dotter knows exactly what to deploy and with what variables. Nothing has been written to disk yet.

### Phase 2: Deployment

For each file in the list:

1. **Determine type**: Is it a symlink or a template?
   - If the type is explicit in the config, use that.
   - If `default_target_type` says `automatic`, check the file contents for `{{`.
   - Binary files and directories are always symlinks.

2. **Deploy**:
   - **Symlink**: Create a symbolic link from the target to the source. If the target already exists as a symlink pointing to the same source, skip it.
   - **Template**: Render the file with variables. Compare against the cached copy. If different, write to the target. Update the cache.

3. **Track**: Record the deployment in the cache file.

After all files are deployed, the cache is saved to disk.

## The Cache Is Dotter's Memory

The cache (`.dotter/cache.toml` and `.dotter/cache/`) is how Dotter remembers what it deployed. Without it, `undeploy` cannot function — Dotter does not scan your system to find deployed files.

The cache contains two maps:

- **symlinks**: Source path → target path for each symlink
- **templates**: Source path → target path for each template

The cache directory (`.dotter/cache/`) stores rendered copies of template files. This allows Dotter to compare the current deployed file against what it last rendered, so it only writes when the content actually changed.

## Symlinks vs. Templates: Why the Distinction Matters

A symlink is a pointer. The target always reflects the current state of the source. Edit the source, the target changes immediately.

A template is a snapshot. The target is a rendered copy with variables substituted. Edit the source, the target does not change until you run `dotter` again.

This is why Dotter cannot use symlinks for templates: the source file contains `{{variable}}` but the target should contain the actual value. A symlink would show the template syntax, not the rendered result.

### The Conversion Gotcha

When you first deploy a file without template syntax, it becomes a symlink. If you later add `{{variable}}` to the source file, the next deploy converts it to a template copy. But if you later remove the template syntax, Dotter will NOT convert it back to a symlink — it tracks the file as a template in its cache.

To convert a template back to a symlink, you need to undeploy and deploy again.

## What Happens When Things Go Wrong

### Target file already exists

If the target is a symlink pointing to a different source, or a regular file that Dotter did not create, Dotter skips it with a warning. Use `--force` to overwrite.

### Source file is missing

Dotter skips the file with an error. It does not create empty targets.

### Template variable is undefined

Hard error. Dotter runs Handlebars in strict mode. Check your variable name and make sure it is defined in your configuration.

### Hook fails

Dotter aborts the entire operation. The cache is not updated, and no further files are deployed.

## Platform Differences

### Unix

- Symlinks work as expected.
- The `owner` field uses `sudo` to create files as a different user.
- Hooks run via `sh` if not executable, or directly if executable.

### Windows

- Symlinks require Developer Mode. Without it, all files are deployed as template copies (not symlinks).
- Hook files are automatically renamed to `.bat` extension in the cache.
- The `owner` field is ignored.
