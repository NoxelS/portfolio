import type { APIRoute } from 'astro';

import { defaultSeo } from '../data/site';
import { copy } from '../i18n';
import { getSortedProjects, projectFilterLabels } from '../data/projects';
import { setPublicDocumentCache } from '../lib/cache';
import { buildInfo } from '../lib/build-info';
import { getPublicEnv } from '../lib/public-env';
import { legalCopy, operator } from '../data/legal';

// This endpoint is also the target of the root route's content negotiation.
// Keep it on-demand so Astro can rewrite / to /index.md in server output.
export const prerender = false;

export function getIndexMarkdownBody(): string {
	const services = copy.en.services;
	const footerLabels = legalCopy.en;
	const currentYear = new Date().getFullYear();
	const contactEmail = getPublicEnv('PUBLIC_CONTACT_EMAIL');
	const contactPhone = getPublicEnv('PUBLIC_CONTACT_PHONE');
	const contactPhoneSecondary = getPublicEnv('PUBLIC_CONTACT_PHONE_SECONDARY');
	const scheduleUrl = getPublicEnv('PUBLIC_KOALENDAR_URL', 'https://koalendar.com/e/noel-pascal-schwabenland');

	const projects = getSortedProjects('en')
		.map((project) => {
			const company = project.companyUrl ? ` — [organisation](${project.companyUrl})` : '';
			const metadata = [
				project.tags.length ? `Tags: ${project.tags.join(', ')}` : '',
				project.filters.length ? `Categories: ${project.filters.map(filter => projectFilterLabels.en[filter]).join(', ')}` : '',
			].filter(Boolean);
			const steps = project.steps.map((step) => `### ${step.label}\n\n${step.content}`).join('\n\n');

			return `## ${project.title}${company}\n\n${project.summary}\n\n${metadata.join('  \n')}\n\n${steps}`;
		})
		.join('\n\n---\n\n');

	const contact = [
		contactEmail ? `- Email: [${contactEmail}](mailto:${contactEmail})` : `- ${copy.en.contact.missingEmail}`,
		contactPhone ? `- 🇩🇪 ${contactPhone}` : '',
		contactPhoneSecondary ? `- 🇮🇹 ${contactPhoneSecondary}` : '',
		`- [${copy.en.contact.schedule}](${scheduleUrl})`,
	].filter(Boolean).join('\n');

	const body = `# ${defaultSeo.authorName}

**Page title:** ${copy.en.seo.title}

**Page description:** ${copy.en.seo.description}

> ${copy.en.hero.summary}

## ${copy.en.hero.principle.replace(/<br\s*\/?\s*>/gi, ' ')}

[${copy.en.hero.exploreWork}](${defaultSeo.site}/en/#work) · [${copy.en.hero.contact}](${defaultSeo.site}/en/#contact)

${copy.en.hero.socials}: [GitHub](https://github.com/NoxelS) · [LinkedIn](https://www.linkedin.com/in/noel-schwabenland/) · [Malt](https://www.malt.de/profile/noelschwabenland)

${copy.en.hero.performanceTooltip.replace('{fcp}', 'measured at runtime')}

Languages: [English](${defaultSeo.site}/en/) · [German](${defaultSeo.site}/de/)

> ${copy.en.work.quote}
>
> ${copy.en.work.subquote}

## ${services.title}

${services.description}

${services.areas.map((area) => `### ${area.title}\n\n${area.body}\n\n${area.examples.map((example) => `- ${example}`).join('\n')}`).join('\n\n')}

${services.selectionNote}

[${services.cta}](${defaultSeo.site}/en/#projects-details) · [${services.contact}](${defaultSeo.site}/en/#contact)

> ${copy.en.organisations.quote}

${copy.en.organisations.introduction}

### Organisations

- NetCom Sicherheitstechnik
- KPMG
- Saarland University
- GIP Exyr
- IGS Nieder-Olm
- KuppingerCole Analysts
- University of Padua

## ${copy.en.projects.title}

${copy.en.projects.description}

${projects}

${copy.en.projects.selected}

[${copy.en.projects.exploreBackground}](${defaultSeo.site}/en/#background) · [${copy.en.projects.contact}](${defaultSeo.site}/en/#contact)

> ${copy.en.work.banner.quote}
>
> ${copy.en.work.banner.subquote}

## ${copy.en.work.title}

${copy.en.work.description}

${copy.en.work.chapters.map((chapter) => `### ${chapter.title}\n\n${chapter.body}`).join('\n\n')}

[${copy.en.work.exploreStack}](${defaultSeo.site}/en/#tech-stack) · [${copy.en.work.contact}](${defaultSeo.site}/en/#contact)

> ${copy.en.stack.quote}
>
> ${copy.en.stack.subquote}

## ${copy.en.stack.title}

${copy.en.stack.description}

${copy.en.stack.production} (**production**). ${copy.en.stack.research} (**research**).

### Frontend

${['Angular', 'Vue.js', 'HTML', 'CSS', 'SCSS', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'React', 'Astro'].map((technology) => `- ${technology} — production`).join('\n')}
- Next.js — research
- Svelte — research
- Nuxt — research

### Backend

- Python — production
- FastAPI — production
- Node.js — production
- C++ — research
- Java — research
- Deno — research
- Next.js — research
- GraphQL — research

### Databases

- PostgreSQL — production
- MySQL — production
- Redis — production
- Valkey — production
- Qdrant — production
- MongoDB — research
- Firebase — research
- DuckDB — research
- pgvector — research
- Chroma — research
- Snowflake — research

### Cloud & infrastructure

- Azure — production
- Kubernetes — production
- K3s — production
- Docker — production
- Podman — production
- Ansible — production
- Tailscale — production
- RabbitMQ — production
- GitHub — production
- GitLab — production
- Argo CD — production
- Docker Swarm — research
- Apache Airflow — research
- Apache Kafka — research
- RQ — research
- Jenkins — production

### MLOps

- vLLM — production
- llama.cpp — production
- LiteLLM — production
- Langfuse — production
- MLflow — production
- Feast — research
- n8n — research

### Libraries

- LangGraph — production
- LangChain — production
- TensorFlow — production
- SciPy — production
- NumPy — production
- Pandas — production
- Polars — production
- NOOA — research
- AgentOS — research
- PyTorch — research
- Transformers — research

[${copy.en.stack.contact}](${defaultSeo.site}/en/#contact)

${copy.en.stack.selectionNote}

${copy.en.stack.questions}

> ${copy.en.contact.quote}
>
> ${copy.en.contact.subquote}

## ${copy.en.contact.title}

${copy.en.contact.description}

### ${copy.en.contact.directCallTitle}

${copy.en.contact.directCallBody}

### ${copy.en.contact.emailTitle}

${copy.en.contact.emailBody}

### ${copy.en.contact.scheduleTitle}

${copy.en.contact.scheduleBody}

${contact}

## ${footerLabels.title}

${operator.name}

${footerLabels.activity}

${operator.street}

${operator.city}, ${footerLabels.country}

P. IVA ${operator.vat}

### ${footerLabels.contact}

- [${operator.email}](mailto:${operator.email})
- [${operator.phone}](tel:${operator.phoneHref})

### ${footerLabels.title}

- [${footerLabels.notice}](${defaultSeo.site}/en/legal-notice/)
- [${footerLabels.privacy}](${defaultSeo.site}/en/privacy/)
- [${footerLabels.cookies}](${defaultSeo.site}/en/cookies/)
- [${footerLabels.settings}](${defaultSeo.site}/en/cookies/#cookie-settings)

© ${currentYear} ${operator.name}. ${copy.en.contact.rights}

- [${copy.en.contact.agents}](${defaultSeo.site}/index.md)
- v${buildInfo.version}

## Machine-readable resources

- Markdown portfolio: ${defaultSeo.site}/index.md
- LLM-friendly overview: ${defaultSeo.site}/llms.txt
`;

	return body;
}

export const GET: APIRoute = () => {
	const headers = new Headers({
		'Content-Type': 'text/markdown; charset=utf-8',
	});
	setPublicDocumentCache(headers);

	return new Response(getIndexMarkdownBody(), { headers });
};
