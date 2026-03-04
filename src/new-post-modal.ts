import { App, Modal, Notice, Setting } from 'obsidian';
import JequillPlugin from './main';
import { buildFrontMatter, ensureFolder, parseTags, todayDate, todayDateTime } from './utils';

export class NewPostModal extends Modal {
	plugin: JequillPlugin;

	private title = '';
	private slug = '';
	private titleManuallyEdited = false;
	private categories = '';
	private tags = '';
	private isDraft = false;

	constructor(app: App, plugin: JequillPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		// eslint-disable-next-line obsidianmd/ui/sentence-case
		contentEl.createEl('h2', { text: 'New Jekyll post' });

		const date = todayDate();

		const preview = contentEl.createEl('p', {
			text: `${date}-.md`,
			cls: 'jequill-filename-preview',
		});

		let slugInput: HTMLInputElement;
		let titleInput: HTMLInputElement;

		new Setting(contentEl)
			.setName('Slug')
			.setDesc('Used for the filename and URL')
			.addText(text => {
				// eslint-disable-next-line obsidianmd/ui/sentence-case
				text.setPlaceholder('my-first-post')
					.onChange(value => {
						this.slug = value;
						preview.setText(value ? `${date}-${value}.md` : `${date}-.md`);
						// Auto-fill title from slug unless user has edited it
						if (!this.titleManuallyEdited) {
							const autoTitle = slugToTitle(value);
							this.title = autoTitle;
							if (titleInput) titleInput.value = autoTitle;
						}
					});
				slugInput = text.inputEl;
				slugInput.addEventListener('keydown', (e) => {
					if (e.key === 'Enter') void this.submit();
				});
			});

		new Setting(contentEl)
			.setName('Title')
			.setDesc('Display title in front matter — auto-fills from slug, edit to customise')
			.addText(text => {
				text.setPlaceholder('My post: a deep dive')
					.onChange(value => {
						this.title = value;
						this.titleManuallyEdited = true;
					});
				titleInput = text.inputEl;
				titleInput.addEventListener('keydown', (e) => {
					if (e.key === 'Enter') void this.submit();
				});
			});

		new Setting(contentEl)
			.setName('Categories')
			.setDesc('Space or comma separated')
			.addText(text => text
				// eslint-disable-next-line obsidianmd/ui/sentence-case
				.setPlaceholder('tech')
				.onChange(value => { this.categories = value; }));

		new Setting(contentEl)
			.setName('Tags')
			.setDesc('Space or comma separated')
			.addText(text => text
				// eslint-disable-next-line obsidianmd/ui/sentence-case
				.setPlaceholder('jekyll blog')
				.onChange(value => { this.tags = value; }));

		new Setting(contentEl)
			.setName('Save as draft')
			.setDesc(`Saves to ${this.plugin.settings.draftsFolder} instead of ${this.plugin.settings.postsFolder}`)
			.addToggle(toggle => toggle
				.setValue(false)
				.onChange(value => { this.isDraft = value; }));

		new Setting(contentEl)
			.addButton(btn => btn
				.setButtonText('Create post')
				.setCta()
				.onClick(() => void this.submit()));

		setTimeout(() => slugInput?.focus(), 50);
	}

	private async submit() {
		if (!this.slug.trim()) {
			new Notice('Slug is required.');
			return;
		}

		const { settings } = this.plugin;
		const date = todayDate();
		const slug = this.slug.trim();
		const title = this.title.trim() || slugToTitle(slug);
		const filename = `${date}-${slug}.md`;
		const folder = this.isDraft ? settings.draftsFolder : settings.postsFolder;
		const path = `${folder}/${filename}`;

		// Custom fields go first so native fields always win
		const frontMatterFields: Record<string, unknown> = {};
		for (const { key, value } of settings.customFrontMatter) {
			if (key.trim()) {
				frontMatterFields[key.trim()] = value.replace(/\{\{date\}\}/g, date);
			}
		}

		// Native fields — always override custom fields with the same key
		frontMatterFields.layout = settings.defaultLayout;
		frontMatterFields.title = title;
		frontMatterFields.date = todayDateTime();

		const categories = parseTags(this.categories);
		if (categories.length > 0) frontMatterFields.categories = categories;

		const tags = parseTags(this.tags);
		if (tags.length > 0) frontMatterFields.tags = tags;

		if (settings.defaultAuthor) frontMatterFields.author = settings.defaultAuthor;

		if (this.app.vault.getAbstractFileByPath(path)) {
			new Notice(`A post already exists at ${path}. Change the slug or delete the existing file.`);
			return;
		}

		const content = buildFrontMatter(frontMatterFields) + '\n';

		try {
			await ensureFolder(this.app, folder);
			const file = await this.app.vault.create(path, content);
			this.close();
			await this.app.workspace.getLeaf().openFile(file);
			new Notice(`Created: ${filename}`);
		} catch (e) {
			new Notice(`Failed to create post: ${e instanceof Error ? e.message : String(e)}`);
		}
	}

	onClose() {
		this.contentEl.empty();
	}
}

function slugToTitle(slug: string): string {
	return slug
		.replace(/-/g, ' ')
		.replace(/\b\w/g, c => c.toUpperCase());
}
