import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface DueWhenSettings {
	thisWeekTag: string;
	nextWeekTag: string;
}

const DEFAULT_SETTINGS: DueWhenSettings = {
	thisWeekTag: "#thisweek",
	nextWeekTag: "#ongoing",
}

export default class DueWhen extends Plugin {
	settings: DueWhenSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// My insert date command
		this.addCommand({
			id: 'end-of-this-week',
			name: 'Due end of this week',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				let date = new Date();

				const dow = date.getDay();
				const dom = date.getDate();

				let add_days = (12 - dow) % 7;
				
				date.setDate(dom + add_days);
				
				editor.replaceSelection("[due:: " + date.toISOString().split('T')[0] + "] " + this.settings.thisWeekTag);
			}
		});
		// My insert date next week command
		this.addCommand({
			id: 'end-of-next-week',
			name: 'Due end of next week',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				let date = new Date();
				
				const dow = date.getDay();
				const dom = date.getDate();
				
				let add_days = (12 - dow) % 7;
				
				date.setDate(dom + add_days + 7);

				editor.replaceSelection("[due:: " + date.toISOString().split('T')[0] + "] " + this.settings.nextWeekTag);
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new DueWhenSettingsTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class DueWhenSettingsTab extends PluginSettingTab {
	plugin: DueWhen;

	constructor(app: App, plugin: DueWhen) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for the Due When plugin.'});

		new Setting(containerEl)
			.setName('This week tag')
			.setDesc('Tag to add to due dates set at the end of this week')
			.addText(text => text
				.setPlaceholder('#thisweek')
				.setValue(this.plugin.settings.thisWeekTag)
				.onChange(async (value) => {
					console.log('New tag for this week: ' + value);
					this.plugin.settings.thisWeekTag = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Next week tag')
			.setDesc('Tag to add to due dates set at the end of next week')
			.addText(text => text
				.setPlaceholder('#ongoing')
				.setValue(this.plugin.settings.nextWeekTag)
				.onChange(async (value) => {
					console.log('New tag for next week: ' + value);
					this.plugin.settings.nextWeekTag = value;
					await this.plugin.saveSettings();
				}));
	}
}
