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
        headline: string;
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
    work: { quote: string; subquote: string; title: string; description: string; chapters: { title: string; body: string }[] };
    delivery: { title: string; description: string; steps: { title: string; body: string }[] };
    about: { title: string; body: string };
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
    "en": {
        "seo": {
            "title": "Noel Schwabenland | Freelance AI Engineer",
            "description": "Freelance AI engineer building knowledge systems, RAG, AI agents and custom applications. Architecture, implementation, evaluation and deployment for technical teams.",
            "imageAlt": "Portrait of Noel Pascal Schwabenland"
        },
        "hero": {
            "summaryCompact": "Freelance AI engineer building knowledge systems, agents and custom applications for engineering teams.",
            "summary": "Freelance AI engineer based in the EU. I help engineering teams build knowledge systems, AI agents and custom applications that work with their data and existing software, from architecture and implementation to evaluation and deployment.",
            "exploreWork": "See selected projects",
            "call": "Give me a call",
            "portraitAlt": "Portrait of Noel Pascal Schwabenland",
            "principle": "I build with scalability, <br/> maintainability and performance in mind",
            "performanceLabel": "View site performance details",
            "performanceTooltip": "Server delivery: {server} ms. FCP: {fcp} ms. Yes, I even over-optimized my portfolio website.",
            "socials": "My socials",
            "headline": "AI applications and agents, from idea to production."
        },
        "work": {
            "quote": "Complex problems don't always require complex solutions",
            "subquote": "Sometimes the simplest approach is the best. My background in both technical and business domains allows me to bridge the gap between these worlds.",
            "title": "What I can help you build",
            "description": "I take on defined projects or work alongside an existing engineering team, connecting models, data and software from the first implementation through deployment.",
            "chapters": [
                {
                    "title": "Knowledge systems & RAG",
                    "body": "Make company knowledge accessible through search and AI assistants. I build retrieval pipelines and data integrations, with access permissions, source references and answer evaluation considered from the start."
                },
                {
                    "title": "AI agents & workflows",
                    "body": "Build agents that use tools and APIs to carry out multi-step tasks. I connect them to existing systems and define where validation, human approval and failure handling belong."
                },
                {
                    "title": "Custom AI applications",
                    "body": "Develop an AI feature, internal tool or complete application around a concrete use case. I work across user interfaces, backends, model integration and deployment."
                }
            ]
        },
        "organisations": {
            "quote": "Not only theory, but proven practice",
            "introduction": "I already got the chance to have contributed alongside some awesome organisations:"
        },
        "projects": {
            "title": "Selected work",
            "description": "Selected work in AI infrastructure, agent systems, research and software delivery. Each example outlines the requirements, my contribution and the resulting implementation.",
            "selected": "Have a related challenge? Share the use case, existing systems and the part you need help with.",
            "exploreStack": "View the tech stack",
            "contact": "Discuss your project",
            "filterBy": "Explore by area",
            "filterLabel": "Filter projects by area",
            "carouselLabel": "Projects carousel",
            "noMatches": "No projects match the selection. Choose one or more areas to see projects.",
            "previous": "Previous",
            "next": "Next",
            "shown": (count: number) => `${count} ${count === 1 ? "project" : "projects"} shown`
        },
        "stack": {
            "quote": "From ideas and requirements to reality",
            "subquote": "With a broad skill set and a passion for learning, I help bring ideas to life.",
            "title": "Technologies I work with",
            "description": "A selection of technologies I work with across applications, data and infrastructure. The labels distinguish production experience from research and personal projects.",
            "selectionNote": "These tools reflect my experience. The project requirements determine the stack.",
            "questions": "Need support with your stack?",
            "production": "Used in real production environments",
            "research": "Used in research and personal projects",
            "search": "Search the stack",
            "noMatches": "No technologies match that search.",
            "useProduction": "production use",
            "useResearch": "research and side projects",
            "groups": [
                "Frontend",
                "Backend",
                "Databases",
                "Cloud & Infrastructure",
                "MLOps",
                "Libraries*"
            ]
        },
        "contact": {
            "quote": "Nothing beats a real conversation",
            "subquote": "Even though I work with AI agents, I believe that personal connections are irreplaceable. So I always make time for face-to-face meetings and conversations.",
            "title": "Discuss your AI project",
            "description": "Tell me what you are building, where you are stuck and your target timeline. We will discuss the technical requirements, whether I am a good fit and a practical next step.",
            "directCallTitle": "Call directly",
            "directCallBody": "For a direct conversation, call during European business hours. Use the calendar to arrange a specific time.",
            "emailTitle": "Send a project outline",
            "emailBody": "A short description of the use case, existing software and the help you need is enough to start the conversation.",
            "missingEmail": "Use the calendar to get in touch.",
            "scheduleTitle": "Schedule a conversation",
            "scheduleBody": "Choose a time to discuss the use case, technical constraints and how I could support the project. We can meet by video or phone.",
            "schedule": "Schedule a conversation",
            "language": "Language",
            "rights": "All rights reserved.",
            "agents": "For agents"
        },
        "delivery": {
            "title": "How we work together",
            "description": "Start with a new use case, an existing prototype or a system that needs further development. We agree the scope and responsibilities before implementation.",
            "steps": [
                {
                    "title": "Define the requirements",
                    "body": "We clarify the users, data sources, existing systems and operational constraints, then agree on the scope and how to assess the result."
                },
                {
                    "title": "Build and integrate",
                    "body": "I implement the application and its integrations in reviewable steps. Regular feedback keeps the work aligned with the use case and the engineering team."
                },
                {
                    "title": "Evaluate and hand over",
                    "body": "We check quality and failure cases against the agreed criteria. Deployment, monitoring and documentation are part of the scope, so the team knows how to run and maintain the system."
                }
            ]
        },
        "about": {
            "title": "Engineering background",
            "body": "I bring more than six years of experience building and maintaining software, alongside a background in theoretical physics. That combination helps me turn unclear requirements into concrete implementation steps, test assumptions and work through technically demanding problems."
        }
    },
    "de": {
        "seo": {
            "title": "Noel Schwabenland | Freelance AI Engineer",
            "description": "Freiberuflicher AI Engineer für Wissenssysteme, RAG, KI-Agenten und individuelle Anwendungen. Von Architektur und Entwicklung bis zu Evaluation und Deployment.",
            "imageAlt": "Porträt von Noel Pascal Schwabenland"
        },
        "hero": {
            "summaryCompact": "Freiberuflicher AI Engineer für Wissenssysteme, Agenten und individuelle Anwendungen. Ich unterstütze Entwicklungsteams bei der Umsetzung.",
            "summary": "Als freiberuflicher AI Engineer mit Sitz in der EU unterstütze ich Entwicklungsteams beim Aufbau von Wissenssystemen, KI-Agenten und individuellen Anwendungen. Ich verbinde Modelle mit vorhandenen Daten und Software, von der Architektur und Entwicklung bis zu Evaluation und Deployment.",
            "exploreWork": "Projekte ansehen",
            "call": "Kontakt aufnehmen",
            "portraitAlt": "Porträt von Noel Pascal Schwabenland",
            "principle": "Ich entwickle mit Blick auf Skalierbarkeit, <br/> Wartbarkeit und Performance",
            "performanceLabel": "Website-Performance ansehen",
            "performanceTooltip": "Server-Antwortzeit: {server} ms. FCP: {fcp} ms. Ja, auch diese Portfolio-Website ist bewusst überoptimiert.",
            "socials": "Soziale Medien",
            "headline": "KI-Anwendungen und Agenten, von der Idee bis zum Einsatz."
        },
        "work": {
            "quote": "Komplexe Probleme brauchen nicht immer komplexe Lösungen",
            "subquote": "Manchmal ist die einfachste Lösung die beste. Meine Erfahrung an der Schnittstelle von Technik und Wirtschaft hilft mir, beide Welten zu verbinden.",
            "title": "KI für Wissen, Prozesse und Produkte",
            "description": "Ich übernehme klar abgegrenzte Projekte oder unterstütze bestehende Entwicklungsteams. Dabei verbinde ich Modelle, Daten und Software, von der ersten Umsetzung bis zum Deployment.",
            "chapters": [
                {
                    "title": "Wissenssysteme & RAG",
                    "body": "Unternehmenswissen über Suche und KI-Assistenten zugänglich machen. Ich entwickle Retrieval-Pipelines und Datenanbindungen und berücksichtige Zugriffsrechte, Quellenangaben und die Bewertung der Antwortqualität von Anfang an."
                },
                {
                    "title": "KI-Agenten & Workflows",
                    "body": "Agenten entwickeln, die über Tools und APIs mehrstufige Aufgaben bearbeiten. Ich binde sie in bestehende Systeme ein und definiere, wo Validierung, menschliche Freigaben und Fehlerbehandlung erforderlich sind."
                },
                {
                    "title": "Individuelle KI-Anwendungen",
                    "body": "Eine KI-Funktion, ein internes Werkzeug oder eine vollständige Anwendung für einen konkreten Anwendungsfall entwickeln. Ich arbeite über Benutzeroberflächen, Backends, Modellanbindung und Deployment hinweg."
                }
            ]
        },
        "organisations": {
            "quote": "Nicht nur Theorie, sondern erprobte Praxis",
            "introduction": "Ich durfte bereits mit großartigen Organisationen zusammenarbeiten:"
        },
        "projects": {
            "title": "Ausgewählte Projekte",
            "description": "Einblicke in KI-Infrastruktur, Agentensysteme, Forschung und Softwareentwicklung. Jedes Beispiel zeigt die Anforderungen, meinen Beitrag und die entstandene Lösung.",
            "selected": "Für ein ähnliches Vorhaben helfen ein kurzer Überblick zum Anwendungsfall, zur bestehenden Software und zur gesuchten Unterstützung.",
            "exploreStack": "Tech-Stack ansehen",
            "contact": "Projekt besprechen",
            "filterBy": "Nach Bereich filtern",
            "filterLabel": "Projekte nach Bereich filtern",
            "carouselLabel": "Projektkarussell",
            "noMatches": "Keine Projekte entsprechen der Auswahl. Einen oder mehrere Bereiche auswählen.",
            "previous": "Zurück",
            "next": "Weiter",
            "shown": (count: number) => `${count} ${count === 1 ? "Projekt" : "Projekte"} angezeigt`
        },
        "stack": {
            "quote": "Von der Idee zur Umsetzung",
            "subquote": "Mit einem breiten Skill-Set und großer Lernfreude bringe ich Ideen in die Praxis.",
            "title": "Technologien im Einsatz",
            "description": "Eine Auswahl der Technologien, mit denen ich Anwendungen, Datenverarbeitung und Infrastruktur umsetze. Die Kennzeichnung unterscheidet produktive Erfahrung von Forschung und eigenen Projekten.",
            "selectionNote": "Die Tools zeigen meine Erfahrung. Die Anforderungen des Projekts bestimmen den Tech-Stack.",
            "questions": "Unterstützung im bestehenden Tech-Stack gesucht?",
            "production": "Im produktiven Einsatz",
            "research": "In Forschung und eigenen Projekten eingesetzt",
            "search": "Tech-Stack durchsuchen",
            "noMatches": "Keine Technologien entsprechen der Suche.",
            "useProduction": "produktiver Einsatz",
            "useResearch": "Forschung und eigene Projekte",
            "groups": [
                "Frontend",
                "Backend",
                "Datenbanken",
                "Cloud & Infrastruktur",
                "MLOps",
                "Bibliotheken*"
            ]
        },
        "contact": {
            "quote": "Nichts ersetzt ein persönliches Gespräch",
            "subquote": "Auch wenn ich mit KI-Agenten arbeite: Persönliche Beziehungen sind für mich unersetzlich. Deshalb nehme ich mir immer Zeit für Gespräche und Treffen.",
            "title": "Ein KI-Projekt besprechen",
            "description": "Ein kurzer Überblick zum Vorhaben, zu offenen Fragen und zum Zeitrahmen ist ein guter Einstieg. Im ersten Gespräch klären wir die technischen Anforderungen, die mögliche Zusammenarbeit und einen sinnvollen nächsten Schritt.",
            "directCallTitle": "Direkt anrufen",
            "directCallBody": "Ein direkter Anruf ist während europäischer Geschäftszeiten möglich. Für einen festen Gesprächstermin steht der Kalender zur Verfügung.",
            "emailTitle": "Vorhaben per E-Mail skizzieren",
            "emailBody": "Eine kurze Beschreibung des Anwendungsfalls, der bestehenden Software und der gesuchten Unterstützung genügt für den Einstieg.",
            "missingEmail": "Für die Kontaktaufnahme steht der Kalender zur Verfügung.",
            "scheduleTitle": "Gespräch planen",
            "scheduleBody": "Im Gespräch geht es um den Anwendungsfall, technische Rahmenbedingungen und die mögliche Unterstützung. Der Termin kann per Video oder Telefon stattfinden.",
            "schedule": "Gespräch planen",
            "language": "Sprache",
            "rights": "Alle Rechte vorbehalten.",
            "agents": "Für Agenten"
        },
        "delivery": {
            "title": "So läuft die Zusammenarbeit",
            "description": "Ausgangspunkt kann ein neuer Anwendungsfall, ein vorhandener Prototyp oder die Weiterentwicklung eines bestehenden Systems sein. Umfang und Verantwortlichkeiten klären wir vor der Umsetzung.",
            "steps": [
                {
                    "title": "Anforderungen klären",
                    "body": "Wir klären Nutzer, Datenquellen, bestehende Systeme und betriebliche Rahmenbedingungen. Daraus leiten wir den Umfang und die Kriterien zur Bewertung des Ergebnisses ab."
                },
                {
                    "title": "Entwickeln und integrieren",
                    "body": "Ich setze die Anwendung und ihre Anbindungen in überprüfbaren Schritten um. Regelmäßiges Feedback hält die Entwicklung nah am Anwendungsfall und am Team."
                },
                {
                    "title": "Prüfen und übergeben",
                    "body": "Wir prüfen Qualität und Fehlerfälle anhand der vereinbarten Kriterien. Deployment, Monitoring und Dokumentation gehören zum Umfang, damit das Team das System betreiben und weiterentwickeln kann."
                }
            ]
        },
        "about": {
            "title": "Technischer Hintergrund",
            "body": "Ich bringe über sechs Jahre Erfahrung in der Entwicklung und Wartung von Software sowie einen Hintergrund in theoretischer Physik mit. Diese Verbindung hilft mir, unklare Anforderungen in konkrete Umsetzungsschritte zu übersetzen, Annahmen zu prüfen und technisch anspruchsvolle Probleme zu bearbeiten."
        }
    }
};
