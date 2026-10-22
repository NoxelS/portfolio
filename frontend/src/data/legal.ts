import type { Locale } from '../i18n';
import { professionalTitle } from './site';

export const operator = {
	name: 'Noel Pascal Schwabenland',
	vat: 'IT05812690286',
	street: 'Via Felice Mendelssohn 1',
	city: '35132 Padova (PD)',
	email: 'contact@noel.fyi',
	phone: '+39 352 275 4346',
	phoneHref: '+393522754346',
} as const;

export const legalRevisionDate = '2026-10-16';

export const legalCopy = {
	en: {
		home: 'Back to portfolio',
		title: 'Legal information',
		notice: 'Legal notice',
		privacy: 'Privacy policy',
		cookies: 'Cookies',
		settings: 'Cookie information',
		contact: 'Contact',
		country: 'Italy',
		activity: professionalTitle,
		language: 'Language',
		contents: 'On this page',
		updated: 'Last updated',
		cookieTitle: 'Cookies on this website',
		cookieDescription: 'Cookies can remember your language and support website delivery and security.',
		necessary: 'Technical cookies',
		alwaysActive: 'Always active',
		necessaryDescription: 'The language cookie is set when you choose a language. Cloudflare may set additional cookies for enabled security and availability features.',
		details: 'Read the cookie notice',
		close: 'Done',
	},
	de: {
		home: 'Zurück zum Portfolio',
		title: 'Rechtliche Informationen',
		notice: 'Impressum',
		privacy: 'Datenschutz',
		cookies: 'Cookies',
		settings: 'Cookie-Hinweise',
		contact: 'Kontakt',
		country: 'Italien',
		activity: professionalTitle,
		language: 'Sprache',
		contents: 'Auf dieser Seite',
		updated: 'Stand',
		cookieTitle: 'Cookies auf dieser Website',
		cookieDescription: 'Cookies können die Sprachwahl speichern und die Bereitstellung und Sicherheit der Website unterstützen.',
		necessary: 'Technische Cookies',
		alwaysActive: 'Immer aktiv',
		necessaryDescription: 'Das Sprach-Cookie wird bei der Sprachwahl gesetzt. Cloudflare kann weitere Cookies für aktivierte Sicherheits- und Verfügbarkeitsfunktionen setzen.',
		details: 'Cookie-Hinweise lesen',
		close: 'Fertig',
	},
} satisfies Record<Locale, Record<string, string>>;
