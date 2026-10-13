export type Technology = {
	name: string;
	href: string;
	productionUse: boolean;
	icon?: string;
	logoUrl?: string;
	emoji?: string;
};

export type StackGroup = {
	name: string;
	accent: string;
	technologies: Technology[];
};

/** Shared by the visual portfolio and its Markdown representation. */
export function getStackGroups(groupNames: string[]): StackGroup[] {
    return [
	{
		name: groupNames[0],
		accent: 'bg-secondary',
		technologies: [
			{ name: 'Angular', logoUrl: 'https://cdn.simpleicons.org/angular/0F0F11', href: 'https://angular.dev/', productionUse: true },
			{ name: 'Vue.js', logoUrl: 'https://cdn.simpleicons.org/vuedotjs/4FC08D', href: 'https://vuejs.org/', productionUse: true },
			{ name: 'HTML', logoUrl: 'https://cdn.simpleicons.org/html5/0696DE', href: 'https://developer.mozilla.org/docs/Web/HTML', productionUse: true },
			{ name: 'CSS', logoUrl: 'https://cdn.simpleicons.org/css/663399', href: 'https://developer.mozilla.org/docs/Web/CSS', productionUse: true },
			{ name: 'SCSS', logoUrl: 'https://cdn.simpleicons.org/sass/CC6699', href: 'https://sass-lang.com/', productionUse: true },
			{ name: 'JavaScript', logoUrl: 'https://cdn.simpleicons.org/javascript/F7DF1E', href: 'https://developer.mozilla.org/docs/Web/JavaScript', productionUse: true },
			{ name: 'TypeScript', logoUrl: 'https://cdn.simpleicons.org/typescript/3178C6', href: 'https://www.typescriptlang.org/', productionUse: true },
			{ name: 'Tailwind CSS', logoUrl: 'https://cdn.simpleicons.org/tailwindcss/06B6D4', href: 'https://tailwindcss.com/', productionUse: true },
			{ name: 'React', logoUrl: 'https://cdn.simpleicons.org/react/61DAFB', href: 'https://react.dev/', productionUse: true },
			{ name: 'Astro', logoUrl: 'https://cdn.simpleicons.org/astro/BC52EE', href: 'https://astro.build/', productionUse: true },
			{ name: 'Next.js', logoUrl: 'https://cdn.simpleicons.org/nextdotjs/000000', href: 'https://nextjs.org/', productionUse: false },
			{ name: 'Svelte', logoUrl: 'https://cdn.simpleicons.org/svelte/FF3E00', href: 'https://svelte.dev/', productionUse: false },
			{ name: 'Nuxt', logoUrl: 'https://cdn.simpleicons.org/nuxt/00DC82', href: 'https://nuxt.com/', productionUse: false },
		],
	},
	{
		name: groupNames[1],
		accent: 'bg-secondary',
		technologies: [
			{ name: 'Python', logoUrl: 'https://cdn.simpleicons.org/python/3776AB', href: 'https://www.python.org/', productionUse: true },
			{ name: 'FastAPI', logoUrl: 'https://cdn.simpleicons.org/fastapi/009688', href: 'https://fastapi.tiangolo.com/', productionUse: true },
			{ name: 'C++', logoUrl: 'https://isocpp.org/files/img/cpp_logo.png', href: 'https://isocpp.org/', productionUse: false },
			{ name: 'Java', logoUrl: 'https://icon.icepanel.io/Technology/svg/Java.svg', href: 'https://dev.java/', productionUse: false },
			{ name: 'Node.js', logoUrl: 'https://cdn.simpleicons.org/node.js/339933', href: 'https://nodejs.org/', productionUse: true },
			{ name: 'Deno', logoUrl: 'https://cdn.simpleicons.org/deno/000000', href: 'https://deno.com/', productionUse: false },
			{ name: 'Next.js', logoUrl: 'https://cdn.simpleicons.org/nextdotjs/000000', href: 'https://nextjs.org/', productionUse: false },
			{ name: 'GraphQL', logoUrl: 'https://cdn.simpleicons.org/graphql/E10098', href: 'https://graphql.org/', productionUse: false },
		],
	},
	{
		name: groupNames[2],
		accent: 'bg-secondary',
		technologies: [
			{ name: 'PostgreSQL', logoUrl: 'https://cdn.simpleicons.org/postgresql/4169E1', href: 'https://www.postgresql.org/', productionUse: true },
			{ name: 'MySQL', logoUrl: 'https://cdn.simpleicons.org/mysql/4479A1', href: 'https://www.mysql.com/', productionUse: true },
			{ name: 'MongoDB', logoUrl: 'https://cdn.simpleicons.org/mongodb/47A248', href: 'https://www.mongodb.com/', productionUse: false },
			{ name: 'Firebase', logoUrl: 'https://cdn.simpleicons.org/firebase/FFCA28', href: 'https://firebase.google.com/', productionUse: false },
			{ name: 'Redis', logoUrl: 'https://cdn.simpleicons.org/redis/FF4438', href: 'https://redis.io/', productionUse: true },
			{ name: 'Valkey', logoUrl: 'https://valkey.io/img/valkey-horizontal.svg', href: 'https://valkey.io/', productionUse: true },
			{ name: 'DuckDB', logoUrl: 'https://cdn.simpleicons.org/duckdb/FFF000', href: 'https://duckdb.org/', productionUse: false },
			{ name: 'Qdrant', logoUrl: 'https://cdn.simpleicons.org/qdrant/DC244C', href: 'https://qdrant.tech/', productionUse: true },
			{ name: 'pgvector', href: 'https://github.com/pgvector/pgvector', productionUse: false },
			{ name: 'Chroma', logoUrl: 'https://www.trychroma.com/favicon.ico', href: 'https://www.trychroma.com/', productionUse: false },
			{ name: 'Snowflake', logoUrl: 'https://cdn.simpleicons.org/snowflake/000000', href: 'https://www.snowflake.com/', productionUse: false },
		],
	},
	{
		name: groupNames[3],
		accent: 'bg-secondary',
		technologies: [
			{ name: 'Azure', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Microsoft_Azure_Logo.svg', href: 'https://azure.microsoft.com/', productionUse: true },
			{ name: 'Kubernetes', logoUrl: 'https://cdn.simpleicons.org/kubernetes/326CE5', href: 'https://kubernetes.io/', productionUse: true },
			{ name: 'K3s', logoUrl: 'https://cdn.simpleicons.org/k3s/FFC61C', href: 'https://k3s.io/', productionUse: true },
			{ name: 'Docker', logoUrl: 'https://cdn.simpleicons.org/docker/2496ED', href: 'https://www.docker.com/', productionUse: true },
			{ name: 'Docker Swarm', logoUrl: 'https://cdn.simpleicons.org/docker/2496ED', href: 'https://docs.docker.com/engine/swarm/', productionUse: false },
			{ name: 'Podman', logoUrl: 'https://cdn.simpleicons.org/podman/892CA0', href: 'https://podman.io/', productionUse: true },
			{ name: 'Apache Airflow', logoUrl: 'https://airflow.apache.org/images/airflow-logo.svg', href: 'https://airflow.apache.org/', productionUse: false },
			{ name: 'Apache Kafka', logoUrl: 'https://kafka.apache.org/images/apache-kafka.png', href: 'https://kafka.apache.org/', productionUse: false },
			{ name: 'Ansible', logoUrl: 'https://cdn.simpleicons.org/ansible/EE0000', href: 'https://www.ansible.com/', productionUse: true },
			{ name: 'Tailscale', logoUrl: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/tailscale.svg', href: 'https://tailscale.com/', productionUse: true },
			{ name: 'RabbitMQ', logoUrl: 'https://cdn.simpleicons.org/rabbitmq/FF6600', href: 'https://www.rabbitmq.com/', productionUse: true },
			{ name: 'RQ', logoUrl: 'https://python-rq.org/favicon.png', href: 'https://github.com/rq/rq', productionUse: false },
			{ name: 'GitHub', logoUrl: 'https://cdn.simpleicons.org/github/181717', href: 'https://github.com/', productionUse: true },
			{ name: 'GitLab', logoUrl: 'https://cdn.simpleicons.org/gitlab/FC6D26', href: 'https://about.gitlab.com/', productionUse: true },
			{ name: 'Argo CD', logoUrl: 'https://cdn.simpleicons.org/argo/EF7B4D', href: 'https://argo-cd.readthedocs.io/', productionUse: true },
			{ name: 'Jenkins', logoUrl: 'https://cdn.simpleicons.org/jenkins/D24939', href: 'https://www.jenkins.io/', productionUse: true },
		],
	},
	{
		name: groupNames[4],
		accent: 'bg-secondary',
		technologies: [
			{ name: 'vLLM', logoUrl: 'https://cdn.simpleicons.org/vllm/30A2FF', href: 'https://docs.vllm.ai/', productionUse: true },
			{ name: 'llama.cpp', logoUrl: 'https://ollama.com/public/ollama.png', href: 'https://github.com/ggml-org/llama.cpp', productionUse: true },
			{ name: 'LiteLLM', emoji: '🚅', href: 'https://www.litellm.ai/', productionUse: true },
			{ name: 'Langfuse', logoUrl: 'https://langfuse.com/langfuse-wordart.svg', href: 'https://langfuse.com/', productionUse: true },
			{ name: 'MLflow', logoUrl: 'https://cdn.simpleicons.org/mlflow/0194E2', href: 'https://mlflow.org/', productionUse: true },
			{ name: 'Feast', logoUrl: 'https://feast.dev/images/feast_icon-black.png', href: 'https://feast.dev/', productionUse: false },
			{ name: 'n8n', logoUrl: 'https://cdn.simpleicons.org/n8n/EA4B71', href: 'https://n8n.io/', productionUse: false },
		],
	},
	{
		name: groupNames[5],
		accent: 'bg-secondary',
		technologies: [
			{ name: 'LangGraph', logoUrl: 'https://cdn.simpleicons.org/langgraph/7FC8FF', href: 'https://langchain-ai.github.io/langgraph/', productionUse: true },
			{ name: 'LangChain', logoUrl: 'https://cdn.simpleicons.org/langchain/7FC8FF', href: 'https://www.langchain.com/', productionUse: true },
			{ name: 'NOOA', href: 'https://github.com/NVIDIA-NeMo/labs-OO-Agents', productionUse: false },
			{ name: 'AgentOS', href: 'https://docs.agno.com/agent-os', productionUse: false },
			{ name: 'TensorFlow', logoUrl: 'https://cdn.simpleicons.org/tensorflow/FF6F00', href: 'https://www.tensorflow.org/', productionUse: true },
			{ name: 'PyTorch', logoUrl: 'https://cdn.simpleicons.org/pytorch/EE4C2C', href: 'https://pytorch.org/', productionUse: false },
			{ name: 'SciPy', logoUrl: 'https://cdn.simpleicons.org/scipy/8CAAE6', href: 'https://scipy.org/', productionUse: true },
			{ name: 'NumPy', logoUrl: 'https://cdn.simpleicons.org/numpy/013243', href: 'https://numpy.org/', productionUse: true },
			{ name: 'Pandas', logoUrl: 'https://cdn.simpleicons.org/pandas/150458', href: 'https://pandas.pydata.org/', productionUse: true },
			{ name: 'Polars', logoUrl: 'https://cdn.simpleicons.org/polars/0075FF', href: 'https://pola.rs/', productionUse: true },
			{ name: 'Transformers', logoUrl: 'https://cdn.simpleicons.org/huggingface/FFD21E', href: 'https://huggingface.co/docs/transformers/index', productionUse: false },
		],
	},
];
}
