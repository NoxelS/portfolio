import { Marked, type Tokens } from 'marked';
import type { Locale } from '../i18n';
import noticeEn from '../../content/legal/legal-notice.en.md?raw';
import noticeDe from '../../content/legal/legal-notice.de.md?raw';
import privacyEn from '../../content/legal/privacy-and-cookies.en.md?raw';
import privacyDe from '../../content/legal/privacy-and-cookies.de.md?raw';

export const legalPages = ['legal-notice', 'privacy', 'cookies'] as const;
export type LegalPage = (typeof legalPages)[number];

const documents = {
	en: {
		notice: noticeEn,
		privacy: privacyEn,
		cookieHeading: '## Cookies and similar technologies',
		transferHeading: '## Transfers outside the European Economic Area',
	},
	de: {
		notice: noticeDe,
		privacy: privacyDe,
		cookieHeading: '## Cookies und ähnliche Technologien',
		transferHeading: '## Übermittlungen außerhalb des Europäischen Wirtschaftsraums',
	},
} satisfies Record<Locale, { notice: string; privacy: string; cookieHeading: string; transferHeading: string }>;

export function renderLegalContent(page: LegalPage, locale: Locale) {
	const document = documents[locale];
	let source = page === 'legal-notice' ? document.notice : document.privacy;
	if (page === 'cookies') {
		const start = source.indexOf(document.cookieHeading);
		const end = source.indexOf(document.transferHeading, start);
		if (start < 0 || end <= start) throw new Error(`Missing cookie section for ${locale}`);
		source = source.slice(start, end);
	}
	const ids = new Map<string, number>();
	// These Markdown documents are trusted, repository-owned copy, not user input.
	const marked = new Marked({
		renderer: {
			heading({ tokens, depth, text }: Tokens.Heading) {
				const base = text.normalize('NFKD').replace(/\p{M}/gu, '').replace(/ß/g, 'ss')
					.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
				const count = ids.get(base) ?? 0;
				ids.set(base, count + 1);
				const id = count ? `${base}-${count}` : base;
				return `<h${depth} id="${id}" class="scroll-mt-8">${this.parser.parseInline(tokens)}</h${depth}>`;
			},
		},
	});
	// The page template supplies the localized title and revision date.
	const body = source.replace(/^# [^\n]+\n\n/, '')
		.replace(/^(?:Last updated:|Stand:)[^\n]+\n\n/, '');
	return { html: marked.parse(body, { async: false }) };
}
