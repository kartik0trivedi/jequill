import { MarkdownView, Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, JequillSettings, JequillSettingTab } from './settings';
import { NewPostModal } from './new-post-modal';
import { prepareForPublish } from './prepare-publish';

export default class JequillPlugin extends Plugin {
	settings: JequillSettings;

	async onload() {
		await this.loadSettings();

		// eslint-disable-next-line obsidianmd/ui/sentence-case
		this.addRibbonIcon('feather', 'New Jekyll post', () => {
			new NewPostModal(this.app, this).open();
		});

		this.addCommand({
			id: 'new-post',
			// eslint-disable-next-line obsidianmd/ui/sentence-case
			name: 'New Jekyll post',
			callback: () => {
				new NewPostModal(this.app, this).open();
			},
		});

		this.addCommand({
			id: 'prepare-publish',
			name: 'Prepare for publishing',
			checkCallback: (checking: boolean) => {
				const view = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (view?.file) {
					if (!checking) {
						void prepareForPublish(this.app, this, view.file);
					}
					return true;
				}
				return false;
			},
		});

		this.addSettingTab(new JequillSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<JequillSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
