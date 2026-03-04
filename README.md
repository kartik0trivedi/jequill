# Jequill

Write and publish [Jekyll](https://jekyllrb.com/) blog posts directly from your vault — with front matter generation, slug management, and automatic wiki link conversion.

## Features

- **New Jekyll Post** — a quick modal to create a post with correct front matter and filename (`YYYY-MM-DD-slug.md`) in `_posts/` or `_drafts/`
- **Slug + Title separation** — set the URL slug independently from the display title; title auto-fills from slug but can be overridden
- **Live filename preview** — see the exact filename as you type the slug
- **Prepare for Publishing** — converts `[[wiki links]]` and `![[image embeds]]` to Jekyll-compatible markdown, then renames/moves the file to `_posts/`
- **Custom front matter fields** — define extra YAML fields (e.g. `toc`, `image`, `featured`) added to every new post; supports `{{date}}` placeholder
- **Local timezone date** — `date:` field uses your actual local time and timezone offset

## Usage

### Creating a new post

1. Click the feather icon in the ribbon, or run **Jequill: New Jekyll Post** from the command palette
2. Enter a slug (e.g. `my-first-post`) — the title auto-fills, the filename preview updates live
3. Optionally edit the title, add categories/tags, or toggle draft mode
4. Click **Create Post** — the file is created and opened immediately

### Preparing a post for publishing

With a post open, run **Jequill: Prepare for Publishing** from the command palette. It will:

- Convert `[[Note Name]]` → `[Note Name]({{ site.baseurl }}/note-name)`
- Convert `![[image.png]]` → `![image.png]({{ site.baseurl }}/assets/img/image.png)`
- Rename and move the file to `_posts/YYYY-MM-DD-slug.md` if needed

## Works great with Git plugins

Jequill pairs well with Git and GitHub community plugins (such as those that sync your vault to a remote repo). The recommended workflow is:

1. **Write** your post using Jequill's **New Jekyll Post** command
2. **Publish** it with **Prepare for Publishing** — converts links and moves the file to `_posts/`
3. **Push** to your Jekyll site's GitHub repo using your Git plugin of choice

No terminal needed at any step.

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| Posts folder | `_posts` | Vault path for published posts |
| Drafts folder | `_drafts` | Vault path for draft posts |
| Default layout | `post` | Jekyll layout for new posts |
| Assets folder | `assets/img` | Image path used in link conversion |
| Default author | _(blank)_ | Added to front matter if set |
| Custom front matter | _(none)_ | Extra YAML fields for every new post |

### Custom front matter fields

In Settings → Jequill → Custom front matter fields, add key/value pairs to include in every new post. Use `{{date}}` as a placeholder for today's date (`YYYY-MM-DD`).

Example:

```yaml
toc: false
featured: false
image: /assets/img/default.jpg
```

## Installation

### From Obsidian Community Plugins

1. Open Settings → Community Plugins → Browse
2. Search for **Jequill**
3. Install and enable

### Manual

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/kartik0trivedi/jequill/releases/latest)
2. Copy them to `<your-vault>/.obsidian/plugins/jequill/`
3. Enable the plugin in Settings → Community Plugins

## License

[MIT](LICENSE)
