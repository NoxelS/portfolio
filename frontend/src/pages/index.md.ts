import type { APIRoute } from 'astro';

import { defaultSeo } from '../data/site';
import { getSortedProjects } from '../data/projects';
import { setPublicDocumentCache } from '../lib/cache';

// This endpoint is also the target of the root route's content negotiation.
// Keep it on-demand so Astro can rewrite / to /index.md in server output.
export const prerender = false;

export function getIndexMarkdownBody(): string {
	const contactEmail = import.meta.env.PUBLIC_CONTACT_EMAIL ?? '';
	const contactPhone = import.meta.env.PUBLIC_CONTACT_PHONE ?? '';
	const contactPhoneSecondary = import.meta.env.PUBLIC_CONTACT_PHONE_SECONDARY ?? '';
	const scheduleUrl = import.meta.env.PUBLIC_KOALENDAR_URL ?? 'https://koalendar.com/e/noel-pascal-schwabenland';

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

> Freelance full-stack AI engineer based in the EU, building governed, production-ready RAG, voice, and AI agent systems for industrial and technology companies.

I help industrial and technology companies turn internal knowledge and complex workflows into production-ready RAG, voice, and AI agent solutions. I build with governed data and European regulatory requirements in mind.

I am currently available for 20 hours per week.

- Website: ${defaultSeo.site}/
- GitHub: https://github.com/NoxelS
- LinkedIn: https://www.linkedin.com/in/noel-schwabenland/

## How I work

I combine scientific curiosity with practical software engineering to build AI systems that hold up in real operations. Complex problems do not always require complex solutions. My background in technical and business domains helps me bridge the gap between these worlds.

### Theoretical Physics — a rigorous foundation

Physics taught me to turn ambiguous problems into structured development and validation steps. It also taught me to stay calm when requirements change or technical depth becomes demanding. I work my way into difficult problems until I understand what needs to be built and how to validate it.

### Software Development — ideas made real

With more than six years of experience building and maintaining software for real users, I know that an application is only as strong as its foundations. I bring cloud infrastructure experience, sound engineering principles, and software architecture to create robust, maintainable systems. Coding agents can accelerate delivery, but they need clear architecture and informed direction.

### AI Systems — built for production

I build production AI systems for real users, with a focus on on-premises, open-source solutions for European companies. My work includes agent systems, time-series analysis and forecasting, speech pipelines, and the infrastructure behind them. The goal is useful insight and tangible outcomes while keeping models, data, and operations under the company’s control.

## Selected work

From private AI platforms and voice agents to high-performance research pipelines, these projects solve real operational constraints with systems teams can use, govern, and scale.

${projects}

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
