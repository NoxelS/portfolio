import type { APIRoute } from 'astro';

import { defaultSeo } from '../data/site';
import { getSortedProjects } from '../data/projects';
import { getStackGroups } from '../data/tech-stack';
import { copy, type Locale } from '../i18n';
import { setPublicDocumentCache } from '../lib/cache';
import { getPublicEnv } from '../lib/public-env';

// Keep root content negotiation and locale-specific Markdown on the same copy.
export const prerender = false;

export function getIndexMarkdownBody(locale: Locale = 'en'): string {
    const c = copy[locale];
    const contactEmail = getPublicEnv('PUBLIC_CONTACT_EMAIL');
    const contactPhone = getPublicEnv('PUBLIC_CONTACT_PHONE');
    const contactPhoneSecondary = getPublicEnv('PUBLIC_CONTACT_PHONE_SECONDARY');
    const scheduleUrl = getPublicEnv('PUBLIC_KOALENDAR_URL', 'https://koalendar.com/e/noel-pascal-schwabenland');
    const website = `${defaultSeo.site}/${locale}/`;
    const paragraphs = (items: { title: string; body: string }[]) =>
        items.map(item => `### ${item.title}\n\n${item.body}`).join('\n\n');
    const banner = (quote: string, subquote = '') =>
        `> ${quote}${subquote ? `\n>\n> ${subquote}` : ''}`;

    const projects = getSortedProjects(locale).map(project => {
        const steps = project.steps.map(step => `**${step.label}**\n\n${step.content}`).join('\n\n');
        return `### ${project.title}\n\n${project.context}\n\n${project.summary}\n\n${steps}\n\n${project.tags.join(' · ')}`;
    }).join('\n\n---\n\n');

    const stack = getStackGroups(c.stack.groups).map(group => {
        const tools = group.technologies.map(technology =>
            `- ${technology.name} — ${technology.productionUse ? c.stack.useProduction : c.stack.useResearch}`
        ).join('\n');
        return `### ${group.name.replace('*', '')}\n\n${tools}`;
    }).join('\n\n');

    const contact = [
        `### ${c.contact.scheduleTitle}\n\n${c.contact.scheduleBody}\n\n[${c.contact.schedule}](${scheduleUrl})`,
        contactEmail ? `### ${c.contact.emailTitle}\n\n${c.contact.emailBody}\n\n[${contactEmail}](mailto:${contactEmail})` : '',
        contactPhone || contactPhoneSecondary ? [
            `### ${c.contact.directCallTitle}\n\n${c.contact.directCallBody}`,
            contactPhone ? `- ${locale === 'de' ? 'Deutschland' : 'Germany'}: ${contactPhone}` : '',
            contactPhoneSecondary ? `- ${locale === 'de' ? 'Italien' : 'Italy'}: ${contactPhoneSecondary}` : '',
        ].filter(Boolean).join('\n\n') : '',
    ].filter(Boolean).join('\n\n');

    return [
        `# ${defaultSeo.authorName}`,
        `> ${c.hero.headline}`,
        c.hero.summary,
        `[${c.projects.contact}](${website}#project-contact) · [${c.hero.exploreWork}](${website}#my-projects)`,
        banner(c.work.quote, c.work.subquote),
        `## ${c.work.title}\n\n${c.work.description}`,
        paragraphs(c.work.chapters),
        banner(c.organisations.quote),
        c.organisations.introduction,
        '- NetCom Sicherheitstechnik\n- KPMG\n- Saarland University\n- GIP Exyr\n- IGS Nieder-Olm\n- KuppingerCole Analysts\n- University of Padua',
        `## ${c.projects.title}\n\n${c.projects.description}`,
        projects,
        c.projects.selected,
        `## ${c.delivery.title}\n\n${c.delivery.description}`,
        paragraphs(c.delivery.steps),
        `### ${c.about.title}\n\n${c.about.body}`,
        banner(c.stack.quote, c.stack.subquote),
        `## ${c.stack.title}\n\n${c.stack.description}`,
        stack,
        c.stack.selectionNote,
        banner(c.contact.quote, c.contact.subquote),
        `## ${c.contact.title}\n\n${c.contact.description}`,
        contact,
        `- Website: ${website}\n- GitHub: https://github.com/NoxelS\n- LinkedIn: https://www.linkedin.com/in/noel-schwabenland/`,
    ].join('\n\n') + '\n';
}

export function getIndexMarkdownResponse(locale: Locale = 'en'): Response {
    const headers = new Headers({
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Language': locale,
    });
    setPublicDocumentCache(headers);
    return new Response(getIndexMarkdownBody(locale), { headers });
}

export const GET: APIRoute = () => getIndexMarkdownResponse();
