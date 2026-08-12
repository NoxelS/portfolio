/** Project records for the portfolio projects carousel.
 *
 * Each record defines a single case study: a short summary,
 * three narrative steps (Problem / How I solved it / Impact),
 * separate metadata for filtering and display.
 */

export type ProjectStep = {
    label: string;
    content: string;
};

export type Project = {
    title: string;
    summary: string;
    steps: ProjectStep[];
    tags: string[];
    filters: string[];
    logoSrc?: string;
    logoAlt?: string;
    companyUrl?: string;
};

export const projects: Project[] = [
    {
        title: 'On-Premise AI Inference Platform @ NetCom',
        summary:
            'Built the governed AI platform that lets NetCom deploy language and agent systems on sensitive data without relying on external model providers.',
        steps: [
            {
                label: 'Problem',
                content:
                    'European data-protection and client requirements made external AI providers unsuitable for sensitive workloads, leaving teams without a secure, scalable way to bring language AI into daily operations.',
            },
            {
                label: 'How I solved it',
                content:
                    'I planned and implemented the on-premise inference stack, including model routing, load balancing, and operational foundations for reliable internal LLM and agent use.',
            },
            {
                label: 'Impact',
                content:
                    'NetCom gained private, enterprise-ready AI capacity that keeps sensitive workloads under its control, supports regulated use cases, and reduces token costs by 20–30 % compared with hosted models.',
            },
        ],
        tags: ['Private AI', 'LLM Platform'],
        filters: ['Highlighted', 'LLM Systems'],
        logoSrc: '/assets/companies/netcom.svg',
        logoAlt: 'NetCom logo',
        companyUrl: 'https://www.netcom.eu/',
    },
    {
        title: 'Elevator Emergency Dispatch Agent @ NetCom',
        summary:
            'Built an on-premise voice agent that gathers critical incident details outside business hours, giving emergency dispatchers the context they need to respond appropriately.',
        steps: [
            {
                label: 'Problem',
                content:
                    'After hours, elevator emergency calls were either handled by staff or forwarded to authorities with too little incident context to assess whether medical or fire services were needed.',
            },
            {
                label: 'How I solved it',
                content:
                    'I built an on-premise speech-recognition, agent-orchestration, and speech-synthesis pipeline connected to the dispatch control centre, guiding callers through the information responders need.',
            },
            {
                label: 'Impact',
                content:
                    'Dispatchers receive structured, actionable incident metadata before intervention. The system extends emergency coverage beyond working hours while preserving escalation to medical or fire services when required.',
            },
        ],
        tags: ['Voice Agent', 'Critical Operations'],
        filters: ['Highlighted', 'Agent Systems', 'Speech & Voice'],
        logoSrc: '/assets/companies/netcom.svg',
        logoAlt: 'NetCom logo',
        companyUrl: 'https://www.netcom.eu/',
    },
    {
        title: 'HPC Molecular Embedding Pipeline @ Saarland University',
        summary:
            'Built a modular HPC pipeline that turns virtually generated molecules into centrally available chemical-space embeddings for high-throughput drug screening.',
        steps: [
            {
                label: 'Problem',
                content:
                    'Drug-screening simulations generated large numbers of candidate molecules, but embedding them with TopoFormer across several systems created fragmented data ownership and a bottleneck before binding-energy filtering.',
            },
            {
                label: 'How I solved it',
                content:
                    'I built a modular HPC pipeline that distributed TopoFormer embedding jobs, collected the resulting molecular representations centrally, and handed them off consistently to the next screening stage.',
            },
            {
                label: 'Impact',
                content:
                    'Researchers gained a dependable, scalable path from molecule generation to chemical-space analysis, with centrally managed embeddings ready for downstream filtering and decision-making.',
            },
        ],
        tags: ['HPC', 'Drug Discovery'],
        filters: ['Highlighted', 'Research'],
        logoSrc: '/assets/companies/uds.png',
        logoAlt: 'Saarland University logo',
        companyUrl: 'https://www.uni-saarland.de/en/home/',
    },
    {
        title: 'Voting Theory Research Platform @ KPMG',
        summary:
            'Owned the software layer that made high-performance voting-theory simulations easier for a multidisciplinary research team to explore, interpret, and share.',
        steps: [
            {
                label: 'Problem',
                content:
                    'The research team produced large volumes of synthetic simulation data, but lacked a cohesive way to analyse results, exchange findings, and make their implications interpretable across disciplines.',
            },
            {
                label: 'How I solved it',
                content:
                    'I independently designed and built a modular analysis stack around the simulation workflow, giving the team flexible tools to explore outputs and share comparable results.',
            },
            {
                label: 'Impact',
                content:
                    'The team could inspect and communicate simulation outcomes more effectively, improving the interpretability and collaborative value of its social-choice research.',
            },
        ],
        tags: ['Simulation', 'Data Analysis'],
        filters: ['Research', 'Process Automation'],
        logoSrc: '/assets/companies/kpmg.svg',
        logoAlt: 'KPMG logo',
        companyUrl: 'https://kpmg.com/de/de.html',
    },
    {
        title: 'School Grading CMS @ IGS Nieder-Olm',
        summary:
            'Delivered and maintained an on-premise grading CMS that replaced paper-based grade collection with secure, automatic per-student summaries.',
        steps: [
            {
                label: 'Problem',
                content:
                    'Teachers recorded assessments on paper and had to manually collect grades from every subject to determine a student’s term grade—a slow process with sensitive data-governance requirements.',
            },
            {
                label: 'How I solved it',
                content:
                    'For my first freelance engagement, I built and maintained a complete on-premise CMS where teachers record individual assessments and the system generates each student’s consolidated grading overview.',
            },
            {
                label: 'Impact',
                content:
                    'Grade aggregation became structured and automatic, reducing administrative work for teachers while keeping student data within a solution designed for the school’s privacy requirements.',
            },
        ],
        tags: ['Privacy-first', 'Full-stack'],
        filters: ['Process Automation'],
        logoSrc: '/assets/companies/IGS_NiederOlm_farbig.jpg',
        logoAlt: 'IGS Nieder-Olm logo',
        companyUrl: 'https://igsno.de/',
    },
    {
        title: 'CNN-Based Molecular Backmapping @ Saarland University',
        summary:
            'Developed a CNN-based approach for reconstructing atomistic DOPC lipid structures from coarse-grained simulations, reaching a backmapping rate of about 23 molecules per second.',
        steps: [
            {
                label: 'Problem',
                content:
                    'Coarse-grained molecular simulations make larger and longer experiments practical, but translating them back into atom-level detail traditionally requires significant manual oversight and computational effort.',
            },
            {
                label: 'How I solved it',
                content:
                    'For my bachelor’s thesis, I developed and evaluated CNNs that predict molecular internal coordinates from coarse-grained DOPC representations, using a dataset of roughly 160,000 paired structures.',
            },
            {
                label: 'Impact',
                content:
                    'The research demonstrated a viable, efficient backmapping approach that preserves structural detail while reducing manual intervention, creating a foundation for broader molecular-dynamics and drug-discovery research.',
            },
        ],
        tags: ['Deep Learning', 'Biophysics'],
        filters: ['Research'],
        logoSrc: '/assets/companies/uds.png',
        logoAlt: 'Saarland University logo',
        companyUrl: 'https://www.uni-saarland.de/en/home/',
    },
];

/** Returns projects sorted with Highlighted-filtered projects first, preserving relative order. */
export function getSortedProjects(): Project[] {
    return [...projects].sort((a, b) => {
        const aHighlighted = a.filters.includes('Highlighted');
        const bHighlighted = b.filters.includes('Highlighted');
        if (aHighlighted === bHighlighted) return 0;
        return aHighlighted ? -1 : 1;
    });
}

/** Returns a deduplicated, sorted list of all project filters. */
export function getAllTags(): string[] {
    return Array.from(new Set(projects.flatMap((project) => project.filters))).sort((a, b) => {
        if (a === 'Highlighted') return -1;
        if (b === 'Highlighted') return 1;
        return a.localeCompare(b);
    });
}
