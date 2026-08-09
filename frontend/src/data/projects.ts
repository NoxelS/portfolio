/** Project records for the portfolio projects carousel.
 *
 * Each record defines a single case study: a short summary,
 * three narrative steps (Problem / How I solved it / Impact),
 * and metadata for filtering and display.
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
    logoSrc?: string;
    logoAlt?: string;
};

export const projects: Project[] = [
    {
        title: 'AI Transformation @ NetCom',
        summary:
            'Led AI-driven process automation across NetCom operations, reducing manual workload by ~30 % and shortening processing time from hours to minutes.',
        steps: [
            {
                label: 'Problem',
                content:
                    'NetCom\'s operations relied on repetitive, error-prone manual tasks that consumed hours of engineer time each week. Scaling was blocked by bottleneck workflows and inconsistent data entry.',
            },
            {
                label: 'How I solved it',
                content:
                    'I designed and integrated an AI-based automation pipeline: audit the workflow, identify automation candidates, and deploy lightweight models with human-in-the-loop guardrails.',
            },
            {
                label: 'Impact',
                content:
                    'Process turnaround dropped from hours to minutes. Manual effort fell by roughly 30 %, freeing teams to focus on higher-value work. Errors and rework decreased measurably.',
            },
        ],
        tags: ['Highlighted', 'AI', 'Automation'],
        logoSrc: '/assets/companies/netcom.svg',
        logoAlt: 'NetCom logo',
    },
    {
        title: 'Data & AI Consulting @ KPMG',
        summary:
            'Delivered data-driven advisory engagements that enabled clients to unlock actionable insights from complex datasets and make faster decisions.',
        steps: [
            {
                label: 'Problem',
                content:
                    'KPMG clients struggled with siloed data, inconsistent quality, and low analytics adoption across business units — making reliable insights hard to obtain.',
            },
            {
                label: 'How I solved it',
                content:
                    'I guided analytics delivery end-to-end: data discovery, prototyping analytical models, and building reusable pipelines that translated raw data into strategic recommendations.',
            },
            {
                label: 'Impact',
                content:
                    'Clients gained faster access to reliable insights. Analytics adoption grew within business units, and the delivered frameworks became reusable templates for future engagements.',
            },
        ],
        tags: ['Highlighted', 'Data & Analytics'],
        logoSrc: '/assets/companies/kpmg.svg',
        logoAlt: 'KPMG logo',
    },
    {
        title: 'CNN Model Development for Drug Discovery @ UDS',
        summary:
            'Built and validated a CNN research prototype to support drug discovery pipelines at Saarland University, bridging deep learning and bioinformatics.',
        steps: [
            {
                label: 'Problem',
                content:
                    'Drug discovery research at UDS required rapid screening of chemical structures — a task too slow for traditional manual analysis and too novel for off-the-shelf tools.',
            },
            {
                label: 'How I solved it',
                content:
                    'I developed a CNN-based research prototype trained on domain-specific data, iterated on validation metrics, and packaged the model for reproducibility and further experimentation.',
            },
            {
                label: 'Impact',
                content:
                    'The prototype provided a viable screening pathway for the research team, accelerating candidate identification and establishing a foundation for subsequent computational chemistry work.',
            },
        ],
        tags: ['AI', 'Research'],
        logoSrc: '/assets/companies/uds.png',
        logoAlt: 'Saarland University logo',
    },
    {
        title: 'CMS Product Ownership',
        summary:
            'Owned the product lifecycle of a content management system at GIP Exyr, aligning technical delivery with business requirements and user needs.',
        steps: [
            {
                label: 'Problem',
                content:
                    'The CMS lacked a clear product roadmap and reliable feature delivery cadence. Stakeholder requests competed without prioritisation, leading to scope creep.',
            },
            {
                label: 'How I solved it',
                content:
                    'I structured the product backlog, defined clear acceptance criteria, and established sprint-based delivery cycles with regular stakeholder syncs to keep scope aligned.',
            },
            {
                label: 'Impact',
                content:
                    'Feature delivery became predictable and stakeholder satisfaction improved. The team shipped releases on time and the CMS adoption grew across end users.',
            },
        ],
        tags: ['Product'],
        logoSrc: '/assets/companies/gip_logo_neg.png',
        logoAlt: 'GIP Exyr logo',
    },
];

/** Returns projects sorted with Highlighted-tagged projects first, preserving relative order. */
export function getSortedProjects(): Project[] {
    return [...projects].sort((a, b) => {
        const aHighlighted = a.tags.includes('Highlighted');
        const bHighlighted = b.tags.includes('Highlighted');
        if (aHighlighted === bHighlighted) return 0;
        return aHighlighted ? -1 : 1;
    });
}

/** Returns a deduplicated, sorted list of all unique tags across projects. */
export function getAllTags(): string[] {
    return Array.from(new Set(projects.flatMap((project) => project.tags))).sort();
}
