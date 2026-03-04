import { App, Notice, TFile } from 'obsidian';
import JequillPlugin from './main';
import { ensureFolder, generateSlug, todayDate } from './utils';

export async function prepareForPublish(app: App, plugin: JequillPlugin, file: TFile) {
	const { settings } = plugin;
	let content = await app.vault.read(file);
	let changed = false;

	// Convert ![[image.png]] → Jekyll image tag
	const newContent1 = content.replace(
		/!\[\[([^\]]+)\]\]/g,
		(_, imgPath: string) => {
			const imgName = imgPath.split('/').pop() ?? imgPath;
			changed = true;
			return `![${imgName}]({{ site.baseurl }}/${settings.assetsFolder}/${imgName})`;
		}
	);
	if (newContent1 !== content) content = newContent1;

	// Convert [[target|alias]] and [[target]] → markdown links
	const newContent2 = content.replace(
		/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
		(_, target: string, alias: string | undefined) => {
			const text = alias?.trim() ?? target.trim();
			const slug = generateSlug(target.trim());
			changed = true;
			return `[${text}]({{ site.baseurl }}/${slug})`;
		}
	);
	if (newContent2 !== content) content = newContent2;

	// Extract date and title from front matter
	let date = todayDate();
	let title = '';

	const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
	if (fmMatch?.[1]) {
		const fm = fmMatch[1];
		const dateMatch = fm.match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})/m);
		if (dateMatch?.[1]) date = dateMatch[1];

		const titleMatch = fm.match(/^title:\s*["']?(.+?)["']?\s*$/m);
		if (titleMatch?.[1]) title = titleMatch[1].trim();
	}

	if (!title) {
		// Fall back to filename, stripping existing date prefix
		title = file.basename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/-/g, ' ');
	}

	const slug = generateSlug(title);
	const jekyllFilename = `${date}-${slug}.md`;
	const targetPath = `${settings.postsFolder}/${jekyllFilename}`;

	// Write converted content first
	if (changed) {
		await app.vault.modify(file, content);
	}

	// Move/rename to _posts if needed
	if (file.path !== targetPath) {
		await ensureFolder(app, settings.postsFolder);
		await app.fileManager.renameFile(file, targetPath);
		new Notice(`Ready to publish: ${jekyllFilename}${changed ? ' (links converted)' : ''}`);
	} else {
		new Notice(changed ? `Links converted in ${jekyllFilename}` : `${jekyllFilename} is already publish-ready`);
	}
}
