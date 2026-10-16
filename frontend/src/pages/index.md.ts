import type { APIRoute } from 'astro';

import { defaultSeo } from '../data/site';
import { copy } from '../i18n';
import { getSortedProjects } from '../data/projects';
import { setPublicDocumentCache } from '../lib/cache';
import { getPublicEnv } from '../lib/public-env';

// This endpoint is also the target of the root route's content negotiation.
// Keep it on-demand so Astro can rewrite / to /index.md in server output.
export const prerender = false;

export function getIndexMarkdownBody(): string {
	const services = copy.en.services;
	const contactEmail = getPublicEnv('PUBLIC_CONTACT_EMAIL');
	const contactPhone = getPublicEnv('PUBLIC_CONTACT_PHONE');
	const contactPhoneSecondary = getPublicEnv('PUBLIC_CONTACT_PHONE_SECONDARY');
	const scheduleUrl = getPublicEnv('PUBLIC_KOALENDAR_URL', 'https://koalendar.com/e/noel-pascal-schwabenland');

	const projects = getSortedProjects()
		.map((project) => {
			const company = project.companyUrl ? ` — [organisation](${project.companyUrl})` : '';
			const metadata = [
				project.tags.length ? `Tags: ${project.tags.join(', ')}` : '',
				project.filters.length ? `Categories: ${project.filters.join(', ')}` : '',
			].filter(Boolean);
			const steps = project.steps.map((step) => `### ${step.label}\n\n${step.content}`).join('\n\n');

			return `## ${project.title}${company}\n\n${project.summary}\n\n${metadata.join('  \n')}\n\n${steps}`;
		})
		.join('\n\n---\n\n');

	const contact = [
		contactEmail ? `- Email: [${contactEmail}](mailto:${contactEmail})` : '',
		contactPhone ? `- Germany: ${contactPhone}` : '',
		contactPhoneSecondary ? `- Italy: ${contactPhoneSecondary}` : '',
		`- Schedule: [book a call](${scheduleUrl})`,
	].filter(Boolean).join('\n');

	const body = `# ${defaultSeo.authorName}

> ${copy.en.hero.summary}

I am currently available for 20 hours per week.

## ${services.title}

${services.description}

${services.areas.map((area) => `### ${area.title}\n\n${area.body}\n\n[${area.cta}](${defaultSeo.site}/en/#projects)`).join('\n\n')}

- Website: ${defaultSeo.site}/
- GitHub: https://github.com/NoxelS
- LinkedIn: https://www.linkedin.com/in/noel-schwabenland/

## Machine-readable resources

- Markdown portfolio: ${defaultSeo.site}/index.md
- LLM-friendly overview: ${defaultSeo.site}/llms.txt

## Selected work

From private AI platforms and voice agents to high-performance research pipelines, these projects solve real operational constraints with systems teams can use, govern, and scale.

${projects}

[${copy.en.projects.exploreBackground}](${defaultSeo.site}/en/#background) · [${copy.en.projects.contact}](${defaultSeo.site}/en/#contact)

> ${copy.en.work.banner.quote}
>
> ${copy.en.work.banner.subquote}

## ${copy.en.work.title}

${copy.en.work.description}

${copy.en.work.chapters.map((chapter) => `### ${chapter.title}\n\n${chapter.body}`).join('\n\n')}

[${copy.en.work.exploreStack}](${defaultSeo.site}/en/#tech-stack) · [${copy.en.work.contact}](${defaultSeo.site}/en/#contact)

## Organisations I have worked alongside

- NetCom Sicherheitstechnik
- KPMG
- Saarland University
- GIP Exyr
- IGS Nieder-Olm
- KuppingerCole Analysts
- University of Padua

## Tech stack

Technologies marked **production** have been used in real production environments. Technologies marked **research** have been used in research and personal projects. This is a selection of the libraries and tools I use regularly.

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

## Start a conversation

The first conversation is free and comes with no obligation. We can talk through your goals, see whether we are a good fit, and explore how to create something valuable together. I am available during European business hours, 08:00–18:00 CET.

${contact}

Nothing beats a real conversation. Even though I work with AI agents, I believe personal connections are irreplaceable, so I always make time for face-to-face meetings and conversations.
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
