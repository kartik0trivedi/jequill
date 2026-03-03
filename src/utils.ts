import { App } from 'obsidian';

export function todayDate(): string {
	const d = new Date();
	const yyyy = d.getFullYear();
	const mm = String(d.getMonth() + 1).padStart(2, '0');
	const dd = String(d.getDate()).padStart(2, '0');
	return `${yyyy}-${mm}-${dd}`;
}

export function todayDateTime(): string {
	const d = new Date();
	const yyyy = d.getFullYear();
	const mm = String(d.getMonth() + 1).padStart(2, '0');
	const dd = String(d.getDate()).padStart(2, '0');
	const hh = String(d.getHours()).padStart(2, '0');
	const min = String(d.getMinutes()).padStart(2, '0');
	const ss = String(d.getSeconds()).padStart(2, '0');
	const offsetMins = -d.getTimezoneOffset();
	const sign = offsetMins >= 0 ? '+' : '-';
	const absOff = Math.abs(offsetMins);
	const offHH = String(Math.floor(absOff / 60)).padStart(2, '0');
	const offMM = String(absOff % 60).padStart(2, '0');
	return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss} ${sign}${offHH}${offMM}`;
}

export function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export function buildFrontMatter(fields: Record<string, unknown>): string {
	const lines = ['---'];
	for (const [key, value] of Object.entries(fields)) {
		if (Array.isArray(value)) {
			if (value.length === 0) continue;
			lines.push(`${key}:`);
			value.forEach(v => lines.push(`  - ${v}`));
		} else if (typeof value === 'string' && /[:#\[\]{},]/.test(value)) {
			lines.push(`${key}: "${value.replace(/"/g, '\\"')}"`);
		} else {
			lines.push(`${key}: ${value}`);
		}
	}
	lines.push('---');
	return lines.join('\n');
}

export async function ensureFolder(app: App, folderPath: string): Promise<void> {
	const parts = folderPath.split('/').filter(p => p.length > 0);
	let current = '';
	for (const part of parts) {
		current = current ? `${current}/${part}` : part;
		if (!app.vault.getAbstractFileByPath(current)) {
			await app.vault.createFolder(current);
		}
	}
}

export function parseTags(input: string): string[] {
	return input
		.split(/[\s,]+/)
		.map(t => t.trim())
		.filter(t => t.length > 0);
}
