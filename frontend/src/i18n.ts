export const locales = ['en', 'de'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export function isLocale(value: string | undefined): value is Locale {
    return value !== undefined && (locales as readonly string[]).includes(value);
}

export function localePath(locale: Locale, path = ''): string {
    return `/${locale}/${path}`.replace(/\/$/, '/') || `/${locale}/`;
}

export type Copy = {
    seo: { title: string; description: string; imageAlt: string };
    hero: {
        summaryCompact: string;
        summary: string;
        exploreWork: string;
        call: string;
        portraitAlt: string;
        principle: string;
        performanceLabel: string;
        performanceTooltip: string;
        socials: string;
    };
    work: { quote: string; subquote: string; title: string; description: string; chapters: { title: string; body: string; cta: string }[] };
    organisations: { quote: string; introduction: string };
    projects: {
        title: string;
        description: string;
        selected: string;
        exploreStack: string;
        contact: string;
        filterBy: string;
        filterLabel: string;
        carouselLabel: string;
        noMatches: string;
        previous: string;
        next: string;
        shown: (count: number) => string;
    };
    stack: {
        quote: string;
        subquote: string;
        title: string;
        description: string;
        selectionNote: string;
        questions: string;
        production: string;
        research: string;
        search: string;
        noMatches: string;
        useProduction: string;
        useResearch: string;
        groups: string[];
    };
    contact: {
        quote: string;
        subquote: string;
        title: string;
        description: string;
        directCallTitle: string;
        directCallBody: string;
        emailTitle: string;
        emailBody: string;
        missingEmail: string;
        scheduleTitle: string;
        scheduleBody: string;
        schedule: string;
        language: string;
        rights: string;
        agents: string;
    };
};

export const copy: Record<Locale, Copy> = {
    en: {
        seo: {
            title: 'Noel Schwabenland | Freelance Full-Stack AI Engineer',
            description:
                'Noel Schwabenland is an EU-based freelance full-stack AI engineer building governed, production-ready RAG, voice, and AI agent systems for industrial and technology companies.',
            imageAlt: 'Portrait of Noel Pascal Schwabenland'
        },
        hero: {
            summaryCompact:
                'EU-based full-stack AI Engineer helping industrial and technology teams turn internal knowledge and complex workflows into governed, production-ready RAG, voice, and AI agent systems.',
            summary:
                'EU-based full-stack AI Engineer helping industrial and technology companies turn internal knowledge and complex workflows into governed, production-ready RAG, voice, and AI agent solutions. I build with governed data and European regulatory requirements in mind.',
            exploreWork: 'Explore my work',
            call: 'Give me a call',
            portraitAlt: 'Portrait of Noel Pascal Schwabenland',
            principle: 'I build with scalability, maintainability and performance in mind',
            performanceLabel: 'View site performance details',
            performanceTooltip: 'Server delivery: {server} ms. FCP: {fcp} ms. Yes, I even over-optimized my portfolio website.',
            socials: 'My socials'
        },
        work: {
            quote: "Complex problems don't always require complex solutions",
            subquote:
                'Sometimes the simplest approach is the best. My background in both technical and business domains allows me to bridge the gap between these worlds.',
            title: 'How I work',
            description: 'I combine scientific curiosity with practical software engineering to build AI systems that hold up in real operations.',
            chapters: [
                {
                    title: 'Theoretical Physics',
                    body: 'Physics taught me to turn ambiguous problems into structured development and validation steps. It also taught me to stay calm when requirements change or technical depth becomes demanding. I work my way into difficult problems until I understand what needs to be built and how to validate it.',
                    cta: 'Explore my problem solving approach'
                },
                {
                    title: 'Software Development',
                    body: 'With more than six years of experience building and maintaining software for real users, I know that an application is only as strong as its foundations. I bring cloud infrastructure experience, sound engineering principles, and software architecture to create robust, maintainable systems. Coding agents can accelerate delivery, but they need clear architecture and informed direction.',
                    cta: 'Check out the software I built for real users'
                },
                {
                    title: 'AI Systems',
                    body: 'I build production AI systems for real users, with a focus on on-premises, open-source solutions for European companies. My work includes agent systems, time-series analysis and forecasting, speech pipelines, and the infrastructure behind them. The goal is useful insight and tangible outcomes while keeping models, data, and operations under the company’s control.',
                    cta: 'Explore production AI systems I worked on'
                }
            ]
        },
        organisations: {
            quote: 'Not only theory, but proven practice',
            introduction: 'I already got the chance to have contributed alongside some awesome organisations:'
        },
        projects: {
            title: 'My Projects',
            description:
                'From private AI platforms and voice agents to high-performance research pipelines, these projects solve real operational constraints with systems teams can use, govern, and scale.',
            selected: 'These are selected projects only. If you are looking for experience in a specific area, feel free to get in touch with me.',
            exploreStack: 'Explore my tech stack',
            contact: 'Get in touch',
            filterBy: 'Filter by',
            filterLabel: 'Filter projects by tag',
            carouselLabel: 'Projects carousel',
            noMatches: 'No projects match the selected tags. Select one or more tags to see projects.',
            previous: 'Previous',
            next: 'Next',
            shown: count => `${count} ${count === 1 ? 'project' : 'projects'} shown`
        },
        stack: {
            quote: 'From ideas and requirements to reality',
            subquote: 'With a broad skill set and a passion for learning, I help bring ideas to life.',
            title: 'My Tech Stack',
            description:
                "Quickly check whether our tech stacks already align. If a technology is missing, that's no issue. I only list technologies I'm comfortable with. I'm always ready to learn and can quickly find my way around a new stack.",
            selectionNote: 'Only a selection of the libraries and tools I use regularly is listed here.',
            questions: 'Any more questions?',
            production: 'Used in real production environments',
            research: 'Used in research and personal projects',
            search: 'Search the stack',
            noMatches: 'No technologies match that search.',
            useProduction: 'production use',
            useResearch: 'research and side projects',
            groups: ['Frontend', 'Backend', 'Databases', 'Cloud & Infrastructure', 'MLOps', 'Libraries*']
        },
        contact: {
            quote: 'Nothing beats a real conversation',
            subquote:
                'Even though I work with AI agents, I believe that personal connections are irreplaceable. So I always make time for face-to-face meetings and conversations.',
            title: "Let's build awesome things together",
            description:
                "Have a project, idea, or opportunity in mind? Let's talk and see whether we're a good fit, and explore how we can create something valuable together.",
            directCallTitle: 'Give me a direct call',
            directCallBody: "I'm always available during European business hours (8–18 CET), so feel free to give me a direct call.",
            emailTitle: 'Send an email',
            emailBody:
                'Please include your contact details and the reason for your inquiry. With more information, I can provide a more accurate and helpful response.',
            missingEmail: 'An email address will appear here once configured.',
            scheduleTitle: 'Schedule a call or meeting',
            scheduleBody:
                'Choose a convenient time for a quick chat directly in my calendar. I will either call you by phone or we can meet by video conference.',
            schedule: 'Schedule a call',
            language: 'Language',
            rights: 'All rights reserved.',
            agents: 'For agents'
        }
    },
    de: {
        seo: {
            title: 'Noel Schwabenland | Freelance Full-Stack AI Engineer',
            description:
                'Noel Schwabenland ist ein freiberuflicher Full-Stack AI Engineer aus der EU. Er entwickelt steuerbare, produktionsreife RAG-, Sprach- und KI-Agenten-Systeme für Industrie- und Technologieunternehmen.',
            imageAlt: 'Porträt von Noel Pascal Schwabenland'
        },
        hero: {
            summaryCompact:
                'Full-Stack AI Engineer aus der EU. Ich helfe Industrie- und Technologieunternehmen, internes Wissen und komplexe Abläufe in steuerbare, produktionsreife RAG-, Sprach- und KI-Agenten-Systeme zu überführen.',
            summary:
                'Full-Stack AI Engineer aus der EU. Ich helfe Industrie- und Technologieunternehmen, internes Wissen und komplexe Abläufe in steuerbare, produktionsreife RAG-, Sprach- und KI-Agenten-Lösungen zu überführen. Dabei berücksichtige ich Daten-Governance und europäische regulatorische Anforderungen.',
            exploreWork: 'Meine Arbeit entdecken',
            call: 'Rufen Sie mich an',
            portraitAlt: 'Porträt von Noel Pascal Schwabenland',
            principle: 'Ich entwickle mit Blick auf Skalierbarkeit, Wartbarkeit und Performance',
            performanceLabel: 'Details zur Website-Performance anzeigen',
            performanceTooltip: 'Server-Auslieferung: {server} ms. FCP: {fcp} ms. Ja, ich habe sogar meine Portfolio-Website überoptimiert.',
            socials: 'Meine Profile'
        },
        work: {
            quote: 'Komplexe Probleme brauchen nicht immer komplexe Lösungen',
            subquote:
                'Manchmal ist der einfachste Ansatz der beste. Mein Hintergrund in technischen und wirtschaftlichen Bereichen hilft mir, beide Welten zu verbinden.',
            title: 'So arbeite ich',
            description: 'Ich verbinde wissenschaftliche Neugier mit praxisnaher Softwareentwicklung, um KI-Systeme zu bauen, die im Betrieb bestehen.',
            chapters: [
                {
                    title: 'Theoretische Physik',
                    body: 'Die Physik hat mich gelehrt, mehrdeutige Probleme in strukturierte Entwicklungs- und Validierungsschritte zu übersetzen. Sie hat mir auch geholfen, bei sich ändernden Anforderungen oder hoher technischer Tiefe ruhig zu bleiben. Ich arbeite mich in schwierige Themen ein, bis ich verstehe, was gebaut und wie es validiert werden muss.',
                    cta: 'Meinen Problemlösungsansatz entdecken'
                },
                {
                    title: 'Softwareentwicklung',
                    body: 'Mit mehr als sechs Jahren Erfahrung in der Entwicklung und Pflege von Software für reale Nutzer weiß ich: Eine Anwendung ist nur so stark wie ihre Grundlagen. Ich verbinde Erfahrung mit Cloud-Infrastruktur, solide Engineering-Prinzipien und Softwarearchitektur zu robusten, wartbaren Systemen. Coding Agents können die Umsetzung beschleunigen, brauchen aber eine klare Architektur und fundierte Führung.',
                    cta: 'Software für reale Nutzer ansehen'
                },
                {
                    title: 'KI-Systeme',
                    body: 'Ich entwickle produktive KI-Systeme für reale Nutzer, mit Fokus auf On-Premises- und Open-Source-Lösungen für europäische Unternehmen. Meine Arbeit umfasst Agentensysteme, Zeitreihenanalyse und -prognosen, Sprachpipelines und die zugrunde liegende Infrastruktur. Das Ziel sind nutzbare Erkenntnisse und greifbare Ergebnisse bei voller Kontrolle über Modelle, Daten und Betrieb.',
                    cta: 'Produktive KI-Systeme entdecken'
                }
            ]
        },
        organisations: {
            quote: 'Nicht nur Theorie, sondern erprobte Praxis',
            introduction: 'Ich hatte bereits die Gelegenheit, mit großartigen Organisationen zusammenzuarbeiten:'
        },
        projects: {
            title: 'Meine Projekte',
            description:
                'Von privaten KI-Plattformen und Sprachagenten bis zu leistungsfähigen Forschungspipelines: Diese Projekte lösen reale betriebliche Anforderungen mit Systemen, die Teams nutzen, steuern und skalieren können.',
            selected: 'Dies ist nur eine Auswahl. Wenn Sie Erfahrung in einem bestimmten Bereich suchen, melden Sie sich gerne bei mir.',
            exploreStack: 'Meinen Tech-Stack entdecken',
            contact: 'Kontakt aufnehmen',
            filterBy: 'Filtern nach',
            filterLabel: 'Projekte nach Tags filtern',
            carouselLabel: 'Projektkarussell',
            noMatches: 'Keine Projekte entsprechen den ausgewählten Tags. Wählen Sie einen oder mehrere Tags aus.',
            previous: 'Zurück',
            next: 'Weiter',
            shown: count => `${count} ${count === 1 ? 'Projekt' : 'Projekte'} angezeigt`
        },
        stack: {
            quote: 'Von Ideen und Anforderungen zur Realität',
            subquote: 'Mit einem breiten Skill-Set und Freude am Lernen helfe ich dabei, Ideen in die Praxis zu bringen.',
            title: 'Mein Tech-Stack',
            description:
                'Prüfen Sie schnell, ob unsere Tech-Stacks bereits zusammenpassen. Fehlt eine Technologie, ist das kein Problem: Ich liste nur Technologien auf, mit denen ich sicher arbeite. Ich lerne gern und finde mich schnell in neuen Stacks zurecht.',
            selectionNote: 'Hier ist nur eine Auswahl der Bibliotheken und Werkzeuge aufgeführt, die ich regelmäßig nutze.',
            questions: 'Noch Fragen?',
            production: 'In realen Produktionsumgebungen eingesetzt',
            research: 'In Forschung und persönlichen Projekten eingesetzt',
            search: 'Tech-Stack durchsuchen',
            noMatches: 'Keine Technologien entsprechen der Suche.',
            useProduction: 'Produktionseinsatz',
            useResearch: 'Forschung und persönliche Projekte',
            groups: ['Frontend', 'Backend', 'Datenbanken', 'Cloud & Infrastruktur', 'MLOps', 'Bibliotheken*']
        },
        contact: {
            quote: 'Nichts ersetzt ein echtes Gespräch',
            subquote:
                'Auch wenn ich mit KI-Agenten arbeite, sind persönliche Beziehungen für mich unersetzlich. Deshalb nehme ich mir immer Zeit für persönliche Treffen und Gespräche.',
            title: 'Lassen Sie uns gemeinsam großartige Dinge bauen',
            description:
                'Sie haben ein Projekt, eine Idee oder eine Gelegenheit im Kopf? Lassen Sie uns sprechen, herausfinden, ob wir gut zusammenpassen, und gemeinsam etwas Wertvolles schaffen.',
            directCallTitle: 'Direkt anrufen',
            directCallBody: 'Ich bin während der europäischen Geschäftszeiten (8–18 Uhr CET) erreichbar. Rufen Sie mich gerne direkt an.',
            emailTitle: 'E-Mail senden',
            emailBody: 'Bitte nennen Sie Ihre Kontaktdaten und den Grund Ihrer Anfrage. Mit mehr Informationen kann ich präziser und hilfreicher antworten.',
            missingEmail: 'Sobald eine E-Mail-Adresse konfiguriert ist, erscheint sie hier.',
            scheduleTitle: 'Gespräch oder Termin vereinbaren',
            scheduleBody:
                'Wählen Sie direkt in meinem Kalender einen passenden Termin für ein kurzes Gespräch. Ich rufe Sie an oder wir treffen uns per Videokonferenz.',
            schedule: 'Gespräch vereinbaren',
            language: 'Sprache',
            rights: 'Alle Rechte vorbehalten.',
            agents: 'Für Agenten'
        }
    }
};
