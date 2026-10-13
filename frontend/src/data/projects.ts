import type { Locale } from '../i18n';

const filterLabels = {
    en: {
        Highlighted: 'Selected',
        'LLM Systems': 'AI infrastructure',
        'Agent Systems': 'AI agents',
        'Speech & Voice': 'Speech & voice',
        Research: 'Research',
        'Process Automation': 'Workflow automation',
    },
    de: {
        Highlighted: 'Auswahl',
        'LLM Systems': 'KI-Infrastruktur',
        'Agent Systems': 'KI-Agenten',
        'Speech & Voice': 'Sprachverarbeitung',
        Research: 'Forschung',
        'Process Automation': 'Prozessautomatisierung',
    },
} satisfies Record<Locale, Record<string, string>>;

export type ProjectFilterId = keyof typeof filterLabels.en;
export type ProjectFilterOption = { id: ProjectFilterId; label: string };
export type ProjectStep = { label: string; content: string };

type ProjectContent = {
    title: string;
    context: string;
    summary: string;
    problem: string;
    contribution: string;
    result: string;
    tags: string[];
};

type ProjectMetadata = {
    id: string;
    filters: ProjectFilterId[];
    logoSrc?: string;
    logoAlt?: string;
    companyUrl?: string;
};

type ProjectRecord = ProjectMetadata & { content: Record<Locale, ProjectContent> };
export type Project = ProjectMetadata & Pick<ProjectContent, 'title' | 'context' | 'summary' | 'tags'> & { steps: ProjectStep[] };

/** Project facts are shared between HTML and Markdown; every record has both locales. */
export const projects: ProjectRecord[] = [
    {
        "id": "netcom-private-ai",
        "filters": [
            "Highlighted",
            "LLM Systems"
        ],
        "logoSrc": "/assets/companies/netcom.svg",
        "logoAlt": "NetCom",
        "companyUrl": "https://www.netcom.eu/",
        "content": {
            "en": {
                "title": "Private AI infrastructure at NetCom",
                "context": "AI infrastructure · Architecture and implementation",
                "summary": "An on-premises inference platform for language-model applications and agents working with sensitive company data.",
                "problem": "NetCom needed to run language models on its own infrastructure because of data-protection and client requirements.",
                "contribution": "I planned and implemented the inference stack, including model routing, load balancing and integration into internal AI workflows.",
                "result": "The platform provides internal inference capacity for applications and agents, with model selection and routing under the company's control.",
                "tags": [
                    "Private AI",
                    "Model serving"
                ]
            },
            "de": {
                "title": "Private KI-Infrastruktur bei NetCom",
                "context": "KI-Infrastruktur · Architektur und Umsetzung",
                "summary": "Eine On-Premises-Plattform für Sprachmodelle und Agenten, die mit sensiblen Unternehmensdaten arbeiten.",
                "problem": "Aufgrund von Datenschutz- und Kundenanforderungen benötigte NetCom eine Möglichkeit, Sprachmodelle auf eigener Infrastruktur zu betreiben.",
                "contribution": "Ich plante und implementierte den Inferenz-Stack einschließlich Modellrouting, Lastverteilung und Anbindung an interne KI-Workflows.",
                "result": "Die Plattform stellt interne Inferenzkapazität für Anwendungen und Agenten bereit. Modellauswahl und Routing bleiben unter der Kontrolle des Unternehmens.",
                "tags": [
                    "Private KI",
                    "Modellbetrieb"
                ]
            }
        }
    },
    {
        "id": "netcom-dispatch-agent",
        "filters": [
            "Highlighted",
            "Agent Systems",
            "Speech & Voice"
        ],
        "logoSrc": "/assets/companies/netcom.svg",
        "logoAlt": "NetCom",
        "companyUrl": "https://www.netcom.eu/",
        "content": {
            "en": {
                "title": "Emergency-call agent at NetCom",
                "context": "Agent systems · Speech processing and dispatch integration",
                "summary": "An on-premises agent that collects incident details during elevator emergency calls and connects them to the dispatch workflow.",
                "problem": "Emergency calls require consistent collection of incident details and integration with the control centre's existing dispatch software.",
                "contribution": "I built the speech-recognition, agent-orchestration and speech-synthesis pipeline and connected it to the dispatch control centre.",
                "result": "The implementation combines spoken interaction with structured incident information for dispatchers, bringing the agent into an existing operational workflow.",
                "tags": [
                    "Agent orchestration",
                    "System integration"
                ]
            },
            "de": {
                "title": "Agent für Aufzugnotrufe bei NetCom",
                "context": "Agentensysteme · Sprachverarbeitung und Leitstellenanbindung",
                "summary": "Ein On-Premises-Agent, der bei Aufzugnotrufen Vorfalldaten erfasst und in den Leitstellenprozess einbindet.",
                "problem": "Notrufe erfordern eine strukturierte Erfassung der Vorfalldaten und die Anbindung an die bestehende Software der Leitstelle.",
                "contribution": "Ich entwickelte die Pipeline aus Spracherkennung, Agentensteuerung und Sprachsynthese und verband sie mit der Leitstelle.",
                "result": "Die Umsetzung verbindet gesprochene Interaktion mit strukturierten Vorfalldaten für die Disposition. So wird der Agent Teil eines bestehenden betrieblichen Ablaufs.",
                "tags": [
                    "Agentensteuerung",
                    "Systemintegration"
                ]
            }
        }
    },
    {
        "id": "saarland-hpc",
        "filters": [
            "Highlighted",
            "Research"
        ],
        "logoSrc": "/assets/companies/uds.svg.webp",
        "logoAlt": "Saarland University",
        "companyUrl": "https://www.uni-saarland.de/en/home/",
        "content": {
            "en": {
                "title": "Molecular embedding pipeline at Saarland University",
                "context": "Research engineering · HPC pipeline implementation",
                "summary": "A distributed pipeline that prepares molecular embeddings for the next stage of a drug-screening workflow.",
                "problem": "Embedding generated molecules with TopoFormer across several systems left data fragmented and delayed downstream screening.",
                "contribution": "I built a modular HPC pipeline to distribute embedding jobs, collect the representations centrally and pass them to the next screening stage.",
                "result": "Researchers could work with centrally collected embeddings and a consistent handoff between molecule generation, embedding and filtering.",
                "tags": [
                    "HPC",
                    "Data pipelines"
                ]
            },
            "de": {
                "title": "Pipeline für molekulare Embeddings an der Universität des Saarlandes",
                "context": "Forschungssoftware · Umsetzung einer HPC-Pipeline",
                "summary": "Eine verteilte Pipeline, die molekulare Embeddings für den nächsten Schritt eines Wirkstoffscreenings bereitstellt.",
                "problem": "Die Berechnung von TopoFormer-Embeddings auf mehreren Systemen führte zu verteilten Datenbeständen und verzögerte das anschließende Screening.",
                "contribution": "Ich entwickelte eine modulare HPC-Pipeline, die Embedding-Jobs verteilt, die Ergebnisse zentral sammelt und an den nächsten Screening-Schritt übergibt.",
                "result": "Die Forschung konnte mit zentral gesammelten Embeddings und einer einheitlichen Übergabe zwischen Molekülgenerierung, Embedding-Berechnung und Filterung arbeiten.",
                "tags": [
                    "HPC",
                    "Datenpipelines"
                ]
            }
        }
    },
    {
        "id": "kpmg-research",
        "filters": [
            "Research",
            "Process Automation"
        ],
        "logoSrc": "/assets/companies/kpmg.svg",
        "logoAlt": "KPMG",
        "companyUrl": "https://kpmg.com/de/de.html",
        "content": {
            "en": {
                "title": "Voting-theory research tools at KPMG",
                "context": "Research software · Independent design and implementation",
                "summary": "An analysis platform for exploring and comparing results from voting-theory simulations.",
                "problem": "A multidisciplinary team needed a shared way to analyse large volumes of simulation data and communicate findings.",
                "contribution": "I independently designed and built a modular analysis stack around the simulation workflow, with tools for exploring outputs and comparing results.",
                "result": "The team gained a common software workflow for inspecting simulation outcomes and sharing findings across disciplines.",
                "tags": [
                    "Simulation",
                    "Data analysis"
                ]
            },
            "de": {
                "title": "Forschungswerkzeuge für Wahltheorie bei KPMG",
                "context": "Forschungssoftware · Eigenständige Konzeption und Umsetzung",
                "summary": "Eine Analyseplattform zur Untersuchung und zum Vergleich von Ergebnissen aus wahltheoretischen Simulationen.",
                "problem": "Ein interdisziplinäres Team benötigte eine gemeinsame Arbeitsweise, um große Mengen an Simulationsdaten auszuwerten und Erkenntnisse zu teilen.",
                "contribution": "Ich konzipierte und entwickelte eigenständig einen modularen Analyse-Stack rund um die Simulationen, mit Werkzeugen zur Untersuchung und zum Vergleich der Ergebnisse.",
                "result": "Das Team erhielt einen gemeinsamen Software-Workflow, um Simulationsergebnisse zu prüfen und Erkenntnisse über Fachgrenzen hinweg auszutauschen.",
                "tags": [
                    "Simulation",
                    "Datenanalyse"
                ]
            }
        }
    },
    {
        "id": "igs-grading",
        "filters": [
            "Process Automation"
        ],
        "logoSrc": "/assets/companies/IGS_NiederOlm_farbig.jpg",
        "logoAlt": "IGS Nieder-Olm",
        "companyUrl": "https://igsno.de/",
        "content": {
            "en": {
                "title": "Grading application for IGS Nieder-Olm",
                "context": "Freelance project · Full-stack development and maintenance",
                "summary": "An on-premises application that replaced paper-based grade collection with automatic student summaries.",
                "problem": "Teachers had to collect assessments from several subjects manually, while keeping sensitive student data within the school's requirements.",
                "contribution": "I built and maintained the application for recording assessments and generating consolidated grading overviews for each student.",
                "result": "Grade aggregation became automatic, and teachers could work from a consolidated overview within the school's own deployment.",
                "tags": [
                    "Full-stack development",
                    "Workflow automation"
                ]
            },
            "de": {
                "title": "Notenverwaltung für die IGS Nieder-Olm",
                "context": "Freiberufliches Projekt · Full-Stack-Entwicklung und Wartung",
                "summary": "Eine On-Premises-Anwendung, die papierbasierte Notensammlung durch automatische Übersichten pro Schüler ersetzte.",
                "problem": "Lehrkräfte mussten Bewertungen aus mehreren Fächern manuell zusammenführen und dabei die Anforderungen an sensible Schülerdaten berücksichtigen.",
                "contribution": "Ich entwickelte und wartete die Anwendung zur Erfassung von Bewertungen und zur Erstellung zusammengefasster Notenübersichten.",
                "result": "Die Noten wurden automatisch zusammengeführt. Lehrkräfte konnten mit einer zentralen Übersicht im schuleigenen System arbeiten.",
                "tags": [
                    "Full-Stack-Entwicklung",
                    "Prozessautomatisierung"
                ]
            }
        }
    },
    {
        "id": "saarland-backmapping",
        "filters": [
            "Research"
        ],
        "logoSrc": "/assets/companies/uds.svg.webp",
        "logoAlt": "Saarland University",
        "companyUrl": "https://www.uni-saarland.de/en/home/",
        "content": {
            "en": {
                "title": "Molecular reconstruction with CNNs at Saarland University",
                "context": "Bachelor's thesis · Model development and evaluation",
                "summary": "A deep-learning approach to reconstructing atomistic lipid structures from coarse-grained molecular simulations.",
                "problem": "Coarse-grained simulations make larger experiments possible, but reconstructing atom-level structures adds computational effort and manual work.",
                "contribution": "For my bachelor's thesis, I developed and evaluated CNNs on roughly 160,000 paired DOPC structures to predict molecular internal coordinates.",
                "result": "The thesis evaluation achieved a backmapping rate of about 23 molecules per second and demonstrated the approach for the studied DOPC structures.",
                "tags": [
                    "Deep learning",
                    "Model evaluation"
                ]
            },
            "de": {
                "title": "Molekulare Rekonstruktion mit CNNs an der Universität des Saarlandes",
                "context": "Bachelorarbeit · Modellentwicklung und Evaluation",
                "summary": "Ein Deep-Learning-Ansatz zur Rekonstruktion atomarer Lipidstrukturen aus vergröberten molekularen Simulationen.",
                "problem": "Vergröberte Simulationen ermöglichen größere Experimente. Die Rückführung auf atomare Strukturen verursacht jedoch zusätzlichen Rechenaufwand und manuelle Arbeit.",
                "contribution": "In meiner Bachelorarbeit entwickelte und evaluierte ich CNNs anhand von rund 160.000 gepaarten DOPC-Strukturen, um interne molekulare Koordinaten vorherzusagen.",
                "result": "Die Evaluation erreichte etwa 23 rekonstruierte Moleküle pro Sekunde und zeigte die Umsetzbarkeit des Ansatzes für die untersuchten DOPC-Strukturen.",
                "tags": [
                    "Deep Learning",
                    "Modellevaluation"
                ]
            }
        }
    }
];

/** Keep featured projects first, preserving the relative order within each group. */
export function getSortedProjects(locale: Locale = 'en'): Project[] {
    const labels = locale === 'de'
        ? ['Ausgangslage', 'Mein Beitrag', 'Ergebnis']
        : ['Problem', 'My contribution', 'Result'];
    return [...projects]
        .sort((a, b) => Number(b.filters.includes('Highlighted')) - Number(a.filters.includes('Highlighted')))
        .map(({ content, ...metadata }) => {
            const { title, context, summary, tags, problem, contribution, result } = content[locale];
            return {
                ...metadata, title, context, summary, tags,
                steps: [problem, contribution, result].map((text, index) => ({ label: labels[index]!, content: text })),
            };
        });
}

/** Stable filter IDs drive selection; only the visitor-facing labels are translated. */
export function getAllTags(locale: Locale = 'en'): ProjectFilterOption[] {
    return Array.from(new Set(projects.flatMap(project => project.filters)))
        .sort((a, b) => {
            if (a === b) return 0;
            if (a === 'Highlighted') return -1;
            if (b === 'Highlighted') return 1;
            return filterLabels[locale][a].localeCompare(filterLabels[locale][b], locale);
        })
        .map(id => ({ id, label: filterLabels[locale][id] }));
}
