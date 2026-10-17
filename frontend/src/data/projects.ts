import type { Locale } from '../i18n';

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

export type ProjectContent = {
    title: string;
    summary: string;
    steps: ProjectStep[];
    tags: string[];
};

export type ProjectFilterId =
    | 'highlighted'
    | 'llm-systems'
    | 'agent-systems'
    | 'speech-voice'
    | 'research'
    | 'process-automation';

export type ProjectId =
    | 'netcom-inference-platform'
    | 'elevator-dispatch-agent'
    | 'hpc-molecular-embedding'
    | 'voting-theory-platform'
    | 'school-grading-cms'
    | 'molecular-backmapping-cnn';

export type ProjectFilter = { id: ProjectFilterId; label: string };

export type Project = {
    id: ProjectId;
    filters: ProjectFilterId[];
    translations: Record<Locale, ProjectContent>;
    logoSrc?: string;
    logoAlt?: string;
    companyUrl?: string;
};

export type LocalizedProject = Omit<Project, 'translations'> & ProjectContent;
type EnglishProjectSource = Omit<Project, 'translations'> & ProjectContent;

export const projectFilterLabels: Record<Locale, Record<ProjectFilterId, string>> = {
    en: {
        highlighted: 'Highlighted',
        'llm-systems': 'LLM Systems',
        'agent-systems': 'Agent Systems',
        'speech-voice': 'Speech & Voice',
        research: 'Research',
        'process-automation': 'Process Automation',
    },
    de: {
        highlighted: 'Hervorgehoben',
        'llm-systems': 'LLM-Systeme',
        'agent-systems': 'Agentensysteme',
        'speech-voice': 'Sprache & Sprachverarbeitung',
        research: 'Forschung',
        'process-automation': 'Prozessautomatisierung',
    },
};

const englishProjectSources: EnglishProjectSource[] = [
    {
        id: 'netcom-inference-platform',
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
        filters: ['highlighted', 'llm-systems'],
        logoSrc: '/assets/companies/netcom.svg',
        logoAlt: 'NetCom logo',
        companyUrl: 'https://www.netcom.eu/',
    },
    {
        id: 'elevator-dispatch-agent',
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
        filters: ['highlighted', 'agent-systems', 'speech-voice'],
        logoSrc: '/assets/companies/netcom.svg',
        logoAlt: 'NetCom logo',
        companyUrl: 'https://www.netcom.eu/',
    },
    {
        id: 'hpc-molecular-embedding',
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
        filters: ['highlighted', 'research'],
        logoSrc: '/assets/companies/uds.svg.webp',
        logoAlt: 'Saarland University logo',
        companyUrl: 'https://www.uni-saarland.de/en/home/',
    },
    {
        id: 'voting-theory-platform',
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
        filters: ['research', 'process-automation'],
        logoSrc: '/assets/companies/kpmg.svg',
        logoAlt: 'KPMG logo',
        companyUrl: 'https://kpmg.com/de/de.html',
    },
    {
        id: 'school-grading-cms',
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
        filters: ['process-automation'],
        logoSrc: '/assets/companies/IGS_NiederOlm_farbig.jpg',
        logoAlt: 'IGS Nieder-Olm logo',
        companyUrl: 'https://igsno.de/',
    },
    {
        id: 'molecular-backmapping-cnn',
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
        filters: ['research'],
        logoSrc: '/assets/companies/uds.svg.webp',
        logoAlt: 'Saarland University logo',
        companyUrl: 'https://www.uni-saarland.de/en/home/',
    },
];

const germanProjectTranslations: Record<ProjectId, ProjectContent> = {
    'netcom-inference-platform': {
        title: 'On-Premises-KI-Inferenzplattform bei NetCom',
        summary:
            'Entwicklung einer kontrollierten KI-Plattform, mit der NetCom Sprachmodelle und Agentensysteme auf sensiblen Daten ohne externe Modellanbieter betreiben kann.',
        steps: [
            {
                label: 'Herausforderung',
                content:
                    'Europäische Datenschutzanforderungen und Kundenvorgaben schlossen externe KI-Anbieter für sensible Anwendungen aus. Den Teams fehlte damit eine sichere, skalierbare Möglichkeit, Sprachmodelle in den Arbeitsalltag einzubinden.',
            },
            {
                label: 'Umsetzung',
                content:
                    'Ich plante und implementierte die On-Premises-Inferenzplattform mit Modell-Routing, Lastverteilung und den betrieblichen Grundlagen für einen zuverlässigen internen Einsatz von LLMs und Agenten.',
            },
            {
                label: 'Ergebnis',
                content:
                    'NetCom erhielt eine private, unternehmenstaugliche KI-Plattform, die sensible Anwendungen unter eigener Kontrolle hält und regulierte Anwendungsfälle unterstützt. Im Vergleich zu gehosteten Modellen sinken die Tokenkosten um 20–30 %.',
            },
        ],
        tags: ['Private KI', 'LLM-Plattform'],
    },
    'elevator-dispatch-agent': {
        title: 'Notruf-Agent für Aufzugsstörungen bei NetCom',
        summary:
            'Entwicklung eines On-Premises-Sprachagenten, der außerhalb der Geschäftszeiten wichtige Angaben zu einem Vorfall erfasst und der Notrufzentrale eine fundierte Reaktion ermöglicht.',
        steps: [
            {
                label: 'Herausforderung',
                content:
                    'Außerhalb der Geschäftszeiten nahmen Mitarbeitende Aufzugsnotrufe entgegen oder leiteten sie mit zu wenigen Informationen an Behörden weiter. Dadurch ließ sich oft nicht einschätzen, ob medizinische Hilfe oder die Feuerwehr benötigt wurde.',
            },
            {
                label: 'Umsetzung',
                content:
                    'Ich entwickelte eine On-Premises-Pipeline aus Spracherkennung, Agenten-Orchestrierung und Sprachsynthese, die an die Leitstelle angebunden ist und Anrufende durch die für Einsatzkräfte wichtigen Fragen führt.',
            },
            {
                label: 'Ergebnis',
                content:
                    'Die Leitstelle erhält vor dem Einsatz strukturierte, relevante Angaben zum Vorfall. Das System erweitert die Notrufabdeckung über die Geschäftszeiten hinaus und ermöglicht bei Bedarf weiterhin die Eskalation an Rettungsdienst oder Feuerwehr.',
            },
        ],
        tags: ['Sprachagent', 'Kritischer Betrieb'],
    },
    'hpc-molecular-embedding': {
        title: 'HPC-Pipeline für Molekül-Embeddings an der Universität des Saarlandes',
        summary:
            'Entwicklung einer modularen HPC-Pipeline, die virtuell erzeugte Moleküle in zentral verfügbare chemische Embeddings für das Hochdurchsatz-Screening überführt.',
        steps: [
            {
                label: 'Herausforderung',
                content:
                    'Simulationen für das Wirkstoff-Screening erzeugten große Mengen möglicher Moleküle. Die Berechnung ihrer TopoFormer-Embeddings auf mehreren Systemen verteilte jedoch die Datenhaltung und schuf einen Engpass vor der Filterung nach Bindungsenergie.',
            },
            {
                label: 'Umsetzung',
                content:
                    'Ich entwickelte eine modulare HPC-Pipeline, die TopoFormer-Aufträge verteilt, die entstehenden Molekülrepräsentationen zentral sammelt und zuverlässig an den nächsten Schritt des Screenings übergibt.',
            },
            {
                label: 'Ergebnis',
                content:
                    'Das Forschungsteam erhielt einen zuverlässigen, skalierbaren Weg von der Molekülerzeugung bis zur Analyse des chemischen Raums. Die zentral verwalteten Embeddings stehen für nachgelagerte Filterung und Entscheidungen bereit.',
            },
        ],
        tags: ['HPC', 'Wirkstoffforschung'],
    },
    'voting-theory-platform': {
        title: 'Forschungsplattform zur Wahltheorie bei KPMG',
        summary:
            'Verantwortung für die Softwareebene, mit der ein interdisziplinäres Forschungsteam Simulationen zur Wahltheorie einfacher untersuchen, interpretieren und teilen konnte.',
        steps: [
            {
                label: 'Herausforderung',
                content:
                    'Das Forschungsteam erzeugte große Mengen synthetischer Simulationsdaten. Es fehlte jedoch eine zusammenhängende Möglichkeit, die Ergebnisse zu analysieren, Erkenntnisse auszutauschen und ihre Bedeutung für verschiedene Fachrichtungen verständlich zu machen.',
            },
            {
                label: 'Umsetzung',
                content:
                    'Ich entwarf und entwickelte eigenständig eine modulare Analyselösung rund um den Simulationsablauf. Sie bietet flexible Werkzeuge zur Untersuchung der Ergebnisse und zum Austausch vergleichbarer Resultate.',
            },
            {
                label: 'Ergebnis',
                content:
                    'Das Team konnte Simulationsergebnisse besser untersuchen und vermitteln. Dadurch stiegen die Verständlichkeit und der gemeinsame Nutzen der Forschung zu sozialer Wahltheorie.',
            },
        ],
        tags: ['Simulation', 'Datenanalyse'],
    },
    'school-grading-cms': {
        title: 'Notenverwaltungssystem für die IGS Nieder-Olm',
        summary:
            'Entwicklung und Wartung eines On-Premises-Systems, das die papierbasierte Notenerfassung durch sichere, automatische Übersichten für jede Schülerin und jeden Schüler ersetzte.',
        steps: [
            {
                label: 'Herausforderung',
                content:
                    'Lehrkräfte erfassten Bewertungen auf Papier und mussten die Noten aller Fächer manuell zusammentragen, um die Zeugnisnote zu ermitteln. Das war aufwendig und betraf zugleich besonders schützenswerte Daten.',
            },
            {
                label: 'Umsetzung',
                content:
                    'Bei meinem ersten freiberuflichen Auftrag entwickelte und betreute ich ein vollständiges On-Premises-CMS. Lehrkräfte erfassen darin einzelne Bewertungen; das System erstellt daraus automatisch eine zusammengeführte Notenübersicht pro Schülerin und Schüler.',
            },
            {
                label: 'Ergebnis',
                content:
                    'Die Notenzusammenstellung wurde strukturiert und automatisiert. Das reduziert den Verwaltungsaufwand der Lehrkräfte und hält Schülerdaten in einer Lösung, die auf die Datenschutzanforderungen der Schule ausgelegt ist.',
            },
        ],
        tags: ['Datenschutzorientiert', 'Full-Stack'],
    },
    'molecular-backmapping-cnn': {
        title: 'CNN-basiertes Molecular Backmapping an der Universität des Saarlandes',
        summary:
            'Entwicklung eines CNN-Ansatzes zur Rekonstruktion atomistischer DOPC-Lipidstrukturen aus grobkörnigen Simulationen mit einer Geschwindigkeit von rund 23 Molekülen pro Sekunde.',
        steps: [
            {
                label: 'Herausforderung',
                content:
                    'Grobkörnige Molekülsimulationen ermöglichen größere und längere Experimente. Die Rückübersetzung in atomare Details erfordert traditionell jedoch erheblichen manuellen Aufwand und Rechenleistung.',
            },
            {
                label: 'Umsetzung',
                content:
                    'Für meine Bachelorarbeit entwickelte und evaluierte ich CNNs, die molekulare interne Koordinaten aus grobkörnigen DOPC-Darstellungen vorhersagen. Grundlage war ein Datensatz mit rund 160.000 gepaarten Strukturen.',
            },
            {
                label: 'Ergebnis',
                content:
                    'Die Forschung zeigte einen tragfähigen und effizienten Ansatz für das Backmapping, der strukturelle Details erhält und manuelle Eingriffe reduziert. Damit entstand eine Grundlage für weiterführende Forschung zu Molekulardynamik und Wirkstoffentwicklung.',
            },
        ],
        tags: ['Deep Learning', 'Biophysik'],
    },
};

/** Each catalog entry keeps its English and German copy together with shared metadata. */
export const projects: Project[] = englishProjectSources.map(({ id, title, summary, steps, tags, ...metadata }) => ({
    ...metadata,
    id,
    translations: {
        en: { title, summary, steps, tags },
        de: germanProjectTranslations[id],
    },
}));

/** Returns localized projects, with highlighted projects first in either locale. */
export function getSortedProjects(locale: Locale = 'en'): LocalizedProject[] {
    return [...projects]
        .sort((a, b) => {
            const aHighlighted = a.filters.includes('highlighted');
            const bHighlighted = b.filters.includes('highlighted');
            if (aHighlighted === bHighlighted) return 0;
            return aHighlighted ? -1 : 1;
        })
        .map(({ translations, ...metadata }) => ({ ...metadata, ...translations[locale] }));
}

/** Returns localized labels for the project filters used by the current records. */
export function getAllTags(locale: Locale = 'en'): ProjectFilter[] {
    return Array.from(new Set(projects.flatMap(project => project.filters)))
        .sort((a, b) => {
            if (a === 'highlighted') return -1;
            if (b === 'highlighted') return 1;
            return projectFilterLabels[locale][a].localeCompare(projectFilterLabels[locale][b], locale);
        })
        .map(id => ({ id, label: projectFilterLabels[locale][id] }));
}
