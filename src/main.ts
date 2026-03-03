import { MarkdownView, Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, JequillSettings, JequillSettingTab } from './settings';
import { NewPostModal } from './new-post-modal';
import { prepareForPublish } from './prepare-publish';

export default class JequillPlugin extends Plugin {
	settings: JequillSettings;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon('feather', 'New Jekyll Post', () => {
			new NewPostModal(this.app, this).open();
		});

		this.addCommand({
			id: 'new-post',
			name: 'New Jekyll Post',
			callback: () => {
				new NewPostModal(this.app, this).open();
			},
		});

		this.addCommand({
			id: 'prepare-publish',
			name: 'Prepare for Publishing',
			checkCallback: (checking: boolean) => {
				const view = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (view?.file) {
					if (!checking) {
						prepareForPublish(this.app, this, view.file);
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
