import { App, PluginSettingTab, Setting } from 'obsidian';
import JequillPlugin from './main';

export interface CustomField {
	key: string;
	value: string;
}

export interface JequillSettings {
	postsFolder: string;
	draftsFolder: string;
	defaultLayout: string;
	assetsFolder: string;
	defaultAuthor: string;
	customFrontMatter: CustomField[];
}

export const DEFAULT_SETTINGS: JequillSettings = {
	postsFolder: '_posts',
	draftsFolder: '_drafts',
	defaultLayout: 'post',
	assetsFolder: 'assets/img',
	defaultAuthor: '',
	customFrontMatter: [],
};

export class JequillSettingTab extends PluginSettingTab {
	plugin: JequillPlugin;

	constructor(app: App, plugin: JequillPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl).setName('Jequill').setHeading();

		new Setting(containerEl)
			.setName('Posts folder')
			.setDesc('Vault path for published posts')
			.addText(text => text
				// eslint-disable-next-line obsidianmd/ui/sentence-case
				.setPlaceholder('_posts')
				.setValue(this.plugin.settings.postsFolder)
				.onChange(async (value) => {
					this.plugin.settings.postsFolder = value.trim();
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Drafts folder')
			.setDesc('Vault path for draft posts')
			.addText(text => text
				// eslint-disable-next-line obsidianmd/ui/sentence-case
				.setPlaceholder('_drafts')
				.setValue(this.plugin.settings.draftsFolder)
				.onChange(async (value) => {
					this.plugin.settings.draftsFolder = value.trim();
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Default layout')
			.setDesc('Jekyll layout name for new posts')
			.addText(text => text
				// eslint-disable-next-line obsidianmd/ui/sentence-case
				.setPlaceholder('post')
				.setValue(this.plugin.settings.defaultLayout)
				.onChange(async (value) => {
					this.plugin.settings.defaultLayout = value.trim();
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Assets folder')
			.setDesc('Jekyll site path for images (used when converting ![[image]] embeds)')
			.addText(text => text
				// eslint-disable-next-line obsidianmd/ui/sentence-case
				.setPlaceholder('assets/img')
				.setValue(this.plugin.settings.assetsFolder)
				.onChange(async (value) => {
					this.plugin.settings.assetsFolder = value.trim();
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Default author')
			.setDesc('Added to front matter of new posts (leave blank to omit)')
			.addText(text => text
				.setPlaceholder('Your name')
				.setValue(this.plugin.settings.defaultAuthor)
				.onChange(async (value) => {
					this.plugin.settings.defaultAuthor = value.trim();
					await this.plugin.saveSettings();
				}));

		// Custom front matter fields
		new Setting(containerEl).setName('Custom front matter fields').setHeading();
		containerEl.createEl('p', {
			text: 'Extra fields added to every new post. Use {{date}} as a placeholder for today\'s date (YYYY-MM-DD).',
			cls: 'setting-item-description',
		});

		this.renderCustomFields(containerEl);
	}

	private renderCustomFields(containerEl: HTMLElement) {
		// Remove any previously rendered field rows before re-rendering
		containerEl.querySelectorAll('.jequill-custom-field').forEach(el => el.remove());
		containerEl.querySelector('.jequill-add-field')?.remove();

		const fields = this.plugin.settings.customFrontMatter;

		fields.forEach((field, index) => {
			const row = new Setting(containerEl)
				.addText(key => key
					// eslint-disable-next-line obsidianmd/ui/sentence-case
					.setPlaceholder('key')
					.setValue(field.key)
					.onChange(async (value) => {
						this.plugin.settings.customFrontMatter[index]!.key = value.trim();
						await this.plugin.saveSettings();
					}))
				.addText(val => val
					// eslint-disable-next-line obsidianmd/ui/sentence-case
					.setPlaceholder('value')
					.setValue(field.value)
					.onChange(async (value) => {
						this.plugin.settings.customFrontMatter[index]!.value = value;
						await this.plugin.saveSettings();
					}))
				.addButton(btn => btn
					.setIcon('trash')
					.setTooltip('Remove field')
					.onClick(async () => {
						this.plugin.settings.customFrontMatter.splice(index, 1);
						await this.plugin.saveSettings();
						this.display();
					}));
			row.settingEl.addClass('jequill-custom-field');
		});

		const addBtn = new Setting(containerEl)
			.addButton(btn => btn
				.setButtonText('Add field')
				.onClick(async () => {
					this.plugin.settings.customFrontMatter.push({ key: '', value: '' });
					await this.plugin.saveSettings();
					this.display();
				}));
		addBtn.settingEl.addClass('jequill-add-field');
	}
}
