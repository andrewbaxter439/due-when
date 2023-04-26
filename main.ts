import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface DueWhenSettings {
	thisWeekTag: string;
	nextWeekTag: string;
	thisMonthTag: string;
	neverTag: string;
	lastWeekday: boolean
}

const DEFAULT_SETTINGS: DueWhenSettings = {
	thisWeekTag: "#thisweek",
	nextWeekTag: "#upcoming",
	thisMonthTag: "#ongoing",
	neverTag: "#abandoned",
	lastWeekday: false
}

export default class DueWhen extends Plugin {
	settings: DueWhenSettings;

	async onload() {
		await this.loadSettings();

		// Insert due date end of week
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
		
		// Insert due date end of next week
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
		
		// Insert due date end of this month
		this.addCommand({
			id: 'end-of-this-month',
			name: 'Due end of this month',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				let date = new Date();
				
				const month = date.getMonth();

				
				date.setMonth(month + 1);
				date.setDate(0);

				const dow = date.getDay()
				
				if (this.settings.lastWeekday) {
					if (dow == 0) {
						date.setDate(date.getDate() - 2)
					} else if (dow == 6) {
						date.setDate(date.getDate() - 1)
					}
				}
				
				editor.replaceSelection("[due:: " + date.toISOString().split('T')[0] + "] " + this.settings.thisMonthTag);
			}
		});
		
		// Insert due never
		this.addCommand({
			id: 'never-gonna-happen',
			name: 'Due after I\'m gone',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				let date = new Date();
				
				const year = date.getFullYear();
				
				date.setFullYear(year + 100);
				
				editor.replaceSelection("[due:: " + date.toISOString().split('T')[0] + "] " + this.settings.neverTag);
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
				.setPlaceholder('#upcoming')
				.setValue(this.plugin.settings.nextWeekTag)
				.onChange(async (value) => {
					console.log('New tag for next week: ' + value);
					this.plugin.settings.nextWeekTag = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('This month tag')
			.setDesc('Tag to add to due dates set at the end of this month')
			.addText(text => text
				.setPlaceholder('#ongoing')
				.setValue(this.plugin.settings.thisMonthTag)
				.onChange(async (value) => {
					console.log('New tag for this month: ' + value);
					this.plugin.settings.thisMonthTag = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Never tag')
			.setDesc('Tag to add to due dates set after you\'re gone and it\'s no longer your problem')
			.addText(text => text
				.setPlaceholder('#abandoned')
				.setValue(this.plugin.settings.neverTag)
				.onChange(async (value) => {
					console.log('New tag for this month: ' + value);
					this.plugin.settings.neverTag = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Last Weekday')
			.setDesc('Set end-of-month to last weekday of month (instead of last day?)')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.lastWeekday)
				.onChange(async (value) => {
					this.plugin.settings.lastWeekday = value;
					await this.plugin.saveSettings();
				}))
	}
}
