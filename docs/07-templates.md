---
id: templates
title: Template Reference
---

Dotter uses Handlebars for templating. This page covers syntax, helpers, and all the details of how templates work.

## Strict Mode

Dotter runs Handlebars in **strict mode**. This means referencing an undefined variable is a **hard error**, not silently rendered as an empty string. If you see an error about a missing variable, check your spelling and make sure the variable is defined in your configuration.

## No HTML Escaping

By default, Handlebars escapes HTML entities like `<`, `>`, and `&`. Dotter disables this. Variables output raw content, which is appropriate for configuration files that may contain shell syntax, JSON, or other structured data.

## Basic Syntax

```handlebars
Simple variable: {{variable_name}}
Nested access: {{nested.value}}
Section: {{#if condition}}...{{/if}}
```

## Conditionals

```handlebars
{{#if show_feature}}
Feature is enabled
{{/if}}

{{#unless hide_feature}}
Feature is shown
{{/unless}}
```

## Comparisons

```handlebars
{{#if (eq value "expected")}}
Value matches
{{/if}}

{{#if (ne value "unexpected")}}
Value differs
{{/if}}
```

## Boolean Logic

Use Handlebars subexpressions:

```handlebars
{{#if (and condition1 condition2)}}
Both conditions true
{{/if}}

{{#if (or condition1 condition2)}}
At least one condition true
{{/if}}

{{#unless (not condition)}}
Condition is true
{{/unless}}
```

## Loops

```handlebars
{{#each items}}
Index: {{@index}}, Value: {{this}}
{{/each}}

{{#each nested}}
Key: {{@key}}, Value: {{this}}
{{/each}}
```

## Built-In Variables

Dotter provides several built-in variables available in all templates.

### dotter.packages

A map of package names to whether they are enabled:

```handlebars
{{#if dotter.packages.vim}}
Package vim is enabled
{{/if}}
```

### dotter.files

A map of source files to their target paths:

```handlebars
{{#each dotter.files}}
{{@key}} -> {{this}}
{{/each}}
```

### dotter.os

The operating system type:

```handlebars
{{#if (eq dotter.os "unix")}}
Running on Unix
{{/if}}
```

Values: `"unix"` or `"windows"`

### Platform Booleans

```handlebars
{{dotter.unix}}    # True on Unix systems
{{dotter.windows}} # True on Windows
{{dotter.linux}}   # True on Linux
{{dotter.macos}}   # True on macOS
```

**Important**: `dotter.linux` and `dotter.macos` are determined at **compile time** using Rust's `cfg!` macro. They reflect the OS the binary was compiled for, not the OS it is running on. If you compile Dotter on Linux and copy the binary to another machine, `dotter.linux` will still be `true`. In contrast, `dotter.unix` and `dotter.windows` are also compile-time checks but are broader categories (any Unix-like system vs. Windows).

For runtime OS detection, use the `command_success` helper:

```handlebars
{{#if (command_success "uname -m | grep -q arm")}}
Running on ARM
{{/if}}
```

### dotter.current_dir

The current working directory when Dotter runs:

```handlebars
Current directory: {{dotter.current_dir}}
```

### dotter.hostname

The machine's hostname:

```handlebars
Hostname: {{dotter.hostname}}
```

## Dotter-Provided Helpers

### math

Evaluate mathematical expressions using the `evalexpr` crate.

**Signature**: `{{math expression}}` or `{{math a op b}}`

**Returns**: String containing the result of the expression.

**Error behavior**: Returns an error if the expression is invalid or contains unknown variables.

```handlebars
{{math "5 + 3"}}
{{math "count * 2"}}
{{math 5 "+" 3}}
```

Both the single-string form and the space-separated form produce the same result.

### is_executable

Check if a command exists in your PATH.

**Signature**: `{{is_executable command_name}}`

**Returns**: `"true"` if the command is found, `"false"` otherwise.

**Error behavior**: Returns an error if no argument is given or more than one argument is given.

```handlebars
{{#if (is_executable "vim")}}
Vim is installed
{{/if}}
```

### command_success

Run a shell command and check if it succeeds.

**Signature**: `{{command_success command}}`

**Returns**: `"true"` if the command exits with status 0, `"false"` otherwise.

**Error behavior**: Returns an error if no argument is given or more than one argument is given. The command is run via `sh -c`.

```handlebars
{{#if (command_success "test -f /etc/debian_version")}}
Debian-based system
{{/if}}
```

### command_output

Run a shell command and get its output.

**Signature**: `{{command_output command}}`

**Returns**: String containing the command's stdout, including any trailing newline.

**Error behavior**: Returns an error if no argument is given or more than one argument is given. The command is run via `sh -c`.

```handlebars
Current user: {{command_output "whoami"}}
```

**Note**: The output includes any trailing newline from the command. So `{{command_output "whoami"}}` produces `username\n`, not `username`. Use `{{trim (command_output "whoami")}}` to remove it.

### include_template

Include another template file.

**Signature**: `{{include_template path}}`

**Returns**: The contents of the included file, rendered with the same variables.

**Error behavior**: Returns an error if the file does not exist or cannot be read.

```handlebars
{{include_template "partials/header.tpl"}}
```

The path is resolved relative to the **current working directory** (where you run `dotter`), not relative to the template file containing the call. The included file is also templated with the same variables.

## String Helpers

From `handlebars_misc_helpers` (the `string` feature is enabled by default):

```handlebars
{{uppercase value}}
{{lowercase value}}
{{trim value}}
{{replace value "old" "new"}}
```

Note: Dotter only enables the `string` and `json` features from `handlebars_misc_helpers`. Other available helpers from that library (like `date`, `regex`, `url`, etc.) are **not** available.

## JSON Helpers

From `handlebars_misc_helpers` (the `json` feature is enabled by default):

```handlebars
{{json value}}
{{json value 2}}  # Pretty-printed with 2-space indent
```

## Script Helpers

If you define helper scripts in your configuration:

```toml
[helpers]
my_script = "helpers/my_script.sh"
```

Use them in templates:

```handlebars
{{my_script "argument"}}
```

The helper receives the argument and its output is inserted into the template. Helpers require the `scripting` feature (enabled by default).
