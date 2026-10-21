import { defaultSeo } from './data/site';

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
    ui: {
        language: string;
        mesh: string;
        profile: string;
        principle: string;
        organisations: string;
        technologyLegend: string;
        technologyWebsite: string;
    };
    hero: {
        summaryCompact: string;
        summary: string;
        exploreWork: string;
        contact: string;
        portraitAlt: string;
        principle: string;
        performanceLabel: string;
        performanceTooltip: string;
        socials: string;
    };
    services: {
        title: string;
        description: string;
        areas: { illustration: 'agents' | 'infrastructure' | 'pipelines' | 'transformation'; title: string; body: string; examples: string[] }[];
        selectionNote: string;
        cta: string;
        contact: string;
    };
    work: {
        quote: string;
        subquote: string;
        banner: { quote: string; subquote: string };
        exploreStack: string;
        contact: string;
        title: string;
        description: string;
        chapters: { title: string; body: string }[];
    };
    organisations: { quote: string; introduction: string };
    projects: {
        title: string;
        description: string;
        selected: string;
        exploreBackground: string;
        contact: string;
        filterBy: string;
        filterLabel: string;
        carouselLabel: string;
        stepsLabel: string;
        tagsLabel: string;
        logoLabel: string;
        openCompanyWebsite: string;
        noMatches: string;
        previous: string;
        next: string;
        previousAriaLabel: string;
        nextAriaLabel: string;
        shownSingular: string;
        shownPlural: string;
        shown: (count: number) => string;
    };
    stack: {
        quote: string;
        subquote: string;
        title: string;
        description: string;
        selectionNote: string;
        questions: string;
        contact: string;
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
        cvDownloads: { text: string; footerText: string; english: string; german: string };
        language: string;
        rights: string;
        agents: string;
    };
};

export const copy: Record<Locale, Copy> = {
    en: {
        seo: {
            title: defaultSeo.title,
            description:
                defaultSeo.description,
            imageAlt: 'Portrait of Noel Pascal Schwabenland'
        },
        ui: {
            language: 'Language',
            mesh: 'Abstract liquid halftone mesh',
            profile: '{platform} profile',
            principle: 'Portfolio principle',
            organisations: 'Companies and institutions I’ve worked with',
            technologyLegend: 'Technology experience legend',
            technologyWebsite: 'Open {technology} website in a new tab'
        },
        hero: {
            summaryCompact:
                `I’m an EU-based freelance Applied AI Engineer building and deploying production AI systems, from inference infrastructure to autonomous agents and enterprise applications, with a focus on reliability, open technologies, and data sovereignty.`,
            summary:
                `I’m an EU-based freelance Applied AI Engineer specialising in building and deploying production AI systems. I work across the AI stack, from model serving and inference infrastructure to autonomous agents and enterprise applications, with a focus on reliability, open technologies, and data sovereignty.`,
            exploreWork: 'Explore how I can help',
            contact: 'Get in touch',
            portraitAlt: 'Portrait of Noel Pascal Schwabenland',
            principle: 'I build with scalability, <br/> maintainability and performance in mind',
            performanceLabel: 'View site performance details',
            performanceTooltip: /* 'Server delivery: {server} ms. ' + */ 'FCP: {fcp} ms. Yes, I even over-optimized my portfolio website.',
            socials: 'My socials'
        },
        services: {
            title: 'How I can help',
            description:
                'I help companies identify useful applications for AI, build reliable systems around them, and prepare their teams and technology for adoption.',
            areas: [
                {
                    illustration: 'agents',
                    title: 'AI agents & applications',
                    body: 'I build AI applications that help teams access knowledge, automate work and improve everyday operations. This includes agents and multi-agent systems that fit existing processes, with visibility into how tasks are carried out.',
                    examples: [
                        'AI agents & multi-agent systems',
                        'Voice agents & conversational applications',
                        'Workflow & process automation',
                        'Knowledge assistants & search',
                        'Agent Observability',
                        'Integration with existing systems'
                    ]
                },
                {
                    illustration: 'infrastructure',
                    title: 'AI platforms & infrastructure',
                    body: 'I build the foundations companies need to run AI reliably, expand its use and retain control of their data. The platform fits the organisation’s existing systems, operating requirements and preferred deployment model.',
                    examples: [
                        'Private AI platforms',
                        'Cloud & on-premises deployment',
                        'Shared access to AI models',
                        'Data control & access management',
                        'Monitoring & reliable operations',
                        'Scalability & cost management'
                    ]
                },
                {
                    illustration: 'pipelines',
                    title: 'Data & machine learning',
                    body: 'I help teams turn data and experimental models into dependable tools for analysis, forecasting and operational use. The work covers preparing data, evaluating results and connecting models to existing applications.',
                    examples: [
                        'Data preparation & processing',
                        'Model development & evaluation',
                        'Forecasting & data analysis',
                        'Automated data workflows',
                        'Research & scientific computing',
                        'Integration into business applications'
                    ]
                },
                {
                    illustration: 'transformation',
                    title: 'AI Transformation',
                    body: 'I help companies understand where AI can improve their business and what they need to adopt it. Together, we assess readiness, prioritise opportunities and define a practical path from initial projects to wider use.',
                    examples: [
                        'AI readiness assessments',
                        'Use-case discovery & prioritisation',
                        'Business process improvement',
                        'Data & technology readiness',
                        'Adoption roadmaps & pilot planning',
                        'Team enablement & knowledge transfer'
                    ]
                }
            ],
            selectionNote: 'This is only a selection of what I offer. If you have a different challenge in mind, let’s talk.',
            cta: 'See what I’ve delivered',
            contact: 'Let’s talk about your challenges'
        },
        work: {
            quote: 'From business challenge to AI that works in practice.',
            subquote:
                'I help teams find where AI can improve a process, then design and build a system that fits their people, data, and infrastructure.',
            banner: {
                quote: 'Good engineering starts with good questions.',
                subquote: 'I combine scientific curiosity with practical experience to understand problems, question assumptions, and choose a useful approach.'
            },
            exploreStack: 'Explore my tech stack',
            contact: 'Get in touch',
            title: 'My background',
            description: 'Physics taught me to question assumptions. Software development taught me to build for real users and maintain what I ship. I bring both to AI projects, turning promising ideas into reliable systems that teams can understand, operate, and improve.',
            chapters: [
                {
                    title: 'Theoretical Physics',
                    body: 'Physics taught me to turn ambiguous problems into structured development and validation steps. It also taught me to stay calm when requirements change or problems become technically demanding. I work my way into difficult problems until I understand what needs to be built and how to validate it.',
                },
                {
                    title: 'Software Development',
                    body: 'For more than six years, I’ve built and maintained software used by real people. I work across the stack, from application code and architecture to deployment and operations, with a focus on systems that remain reliable and maintainable over time. Coding agents help me move faster, but I set the direction, review the work, and take responsibility for the result.',
                },
                {
                    title: 'AI Systems',
                    body: 'I build AI systems that teams can run and improve themselves. For European companies, I often favour open-source and on-premises solutions that keep models, data and operations under their control. I judge the work by whether these systems deliver useful results in practice.',
                }
            ]
        },
        organisations: {
            quote: 'Not only theory, but proven practice.',
            introduction: 'I’ve worked with these companies and institutions:'
        },
        projects: {
            title: 'Case studies',
            description:
                'From private AI platforms and voice agents to high-performance research pipelines, these projects address real operational constraints with systems teams can use, govern, and scale.',
            selected: 'These are selected projects only. If you are looking for experience in a specific area, feel free to get in touch with me.',
            exploreBackground: 'About my background',
            contact: 'Get in touch',
            filterBy: 'Filter by',
            filterLabel: 'Filter projects by category',
            carouselLabel: 'Projects carousel',
            stepsLabel: 'case-study steps',
            tagsLabel: 'project tags',
            logoLabel: 'Company logo',
            openCompanyWebsite: 'Open company website in a new tab',
            noMatches: 'No projects match the selected categories. Select one or more categories to see projects.',
            previous: 'Previous',
            next: 'Next',
            previousAriaLabel: 'Show previous project',
            nextAriaLabel: 'Show next project',
            shownSingular: '{count} project shown',
            shownPlural: '{count} projects shown',
            shown: count => `${count} ${count === 1 ? 'project' : 'projects'} shown`
        },
        stack: {
            quote: 'I choose the technologies that best fit the challenge.',
            subquote: 'I assess each technology for reliability, maintainability, and how well it holds up under real production demands.',
            title: 'My Tech Stack',
            description:
                "Quickly check whether our tech stacks already align. If a technology is missing, that's no issue. I only list technologies I'm comfortable with. I'm always ready to learn and can quickly find my way around a new stack.",
            selectionNote: 'Only a selection of the libraries and tools I use regularly is listed here.',
            questions: 'Any more questions?',
            contact: 'Discuss your project',
            production: 'Used in real production environments',
            research: 'Used in research and personal projects',
            search: 'Search the stack',
            noMatches: 'No technologies match that search.',
            useProduction: 'production use',
            useResearch: 'research and side projects',
            groups: ['Frontend', 'Backend', 'Databases', 'Cloud & Infra', 'MLOps', 'Libraries*']
        },
        contact: {
            quote: 'Nothing beats a real conversation.',
            subquote:
                'Even though I work with AI agents, I believe that personal connections are irreplaceable. So I always make time for face-to-face meetings and conversations.',
            title: 'Let’s put ideas into practice',
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
            cvDownloads: {
                text: 'For a concise overview of my professional experience and technical expertise, my CV is available as a PDF in {english} and {german}.',
                footerText: 'CV ({english} / {german})',
                english: 'English',
                german: 'German'
            },
            language: 'Language',
            rights: 'All rights reserved.',
            agents: 'For agents'
        }
    },
    de: {
        seo: {
            title: defaultSeo.title,
            description:
                `Noel Schwabenland ist freiberuflicher Applied AI Engineer mit Sitz in der EU. Er entwickelt produktive KI-Systeme, von Inferenzinfrastruktur bis zu autonomen Agenten, mit Fokus auf Zuverlässigkeit und Datensouveränität.`,
            imageAlt: 'Porträt von Noel Pascal Schwabenland'
        },
        ui: {
            language: 'Sprache',
            mesh: 'Abstraktes Punktmuster',
            profile: '{platform}-Profil',
            principle: 'Leitsatz',
            organisations: 'Unternehmen und Institutionen, mit denen ich zusammengearbeitet habe',
            technologyLegend: 'Legende zur Technologieerfahrung',
            technologyWebsite: 'Website von {technology} in einem neuen Tab öffnen'
        },
        hero: {
            summaryCompact:
                `Ich bin freiberuflicher Applied AI Engineer mit Sitz in der EU und entwickle KI-Systeme für den produktiven Einsatz, von Inferenzinfrastruktur bis zu autonomen Agenten und Unternehmensanwendungen. Dabei lege ich Wert auf Zuverlässigkeit, offene Technologien und Datensouveränität.`,
            summary:
                `Ich bin freiberuflicher Applied AI Engineer mit Sitz in der EU, spezialisiert auf die Entwicklung und Bereitstellung von KI-Systemen für den produktiven Einsatz. Meine Arbeit umfasst den gesamten KI-Stack, von Model Serving und Inferenzinfrastruktur bis hin zu autonomen Agenten und Unternehmensanwendungen. Dabei lege ich Wert auf Zuverlässigkeit, offene Technologien und Datensouveränität.`,
            exploreWork: 'Meine Leistungen entdecken',
            contact: 'Kontakt aufnehmen',
            portraitAlt: 'Porträt von Noel Pascal Schwabenland',
            principle: 'Ich entwickle Lösungen, <br/> die skalierbar, wartbar und performant bleiben.',
            performanceLabel: 'Details zur Website-Performance anzeigen',
            performanceTooltip: /* 'Server-Auslieferung: {server} ms. ' + */ 'FCP: {fcp} ms. Ja, ich habe sogar meine Portfolio-Website überoptimiert.',
            socials: 'Meine Socials'
        },
        services: {
            title: 'Meine Leistungen',
            description:
                'Ich unterstütze Unternehmen dabei, sinnvolle KI-Anwendungen zu identifizieren, zuverlässige Systeme dafür zu entwickeln sowie Teams und technische Infrastruktur auf die Einführung vorzubereiten.',
            areas: [
                {
                    illustration: 'agents',
                    title: 'KI-Agenten & Anwendungen',
                    body: 'Ich entwickle KI-Anwendungen, die Teams den Zugang zu Wissen erleichtern, Aufgaben automatisieren und Abläufe im Alltag verbessern. Dazu gehören Agenten und Multi-Agenten-Systeme, die sich in bestehende Prozesse einfügen und deren Arbeitsschritte nachvollziehbar bleiben.',
                    examples: [
                        'KI-Agenten & Multi-Agenten-Systeme',
                        'Sprachagenten & Dialoganwendungen',
                        'Workflow- & Prozessautomatisierung',
                        'Wissensassistenten & Suche',
                        'Monitoring & Analyse von Agentenabläufen',
                        'Integration in bestehende Systeme'
                    ]
                },
                {
                    illustration: 'infrastructure',
                    title: 'KI-Plattformen & Infrastruktur',
                    body: 'Ich schaffe die technischen Grundlagen, damit Unternehmen KI zuverlässig betreiben, ihren Einsatz ausweiten und die Kontrolle über ihre Daten behalten können. Die Plattform passt zu bestehenden Systemen, betrieblichen Anforderungen und dem gewünschten Bereitstellungsmodell.',
                    examples: [
                        'Private KI-Plattformen',
                        'Cloud- & On-Premises-Bereitstellung',
                        'Zentraler Zugriff auf KI-Modelle',
                        'Datenkontrolle & Zugriffsverwaltung',
                        'Monitoring & zuverlässiger Betrieb',
                        'Skalierbarkeit & Kostenmanagement'
                    ]
                },
                {
                    illustration: 'pipelines',
                    title: 'Daten & maschinelles Lernen',
                    body: 'Ich unterstütze Teams dabei, Daten und experimentelle Modelle in verlässliche Werkzeuge für Analyse, Prognosen und den operativen Einsatz zu überführen. Dazu gehören die Datenaufbereitung, die Bewertung von Ergebnissen und die Einbindung von Modellen in bestehende Anwendungen.',
                    examples: [
                        'Datenaufbereitung & Verarbeitung',
                        'Modellentwicklung & Evaluation',
                        'Prognosen & Datenanalyse',
                        'Automatisierte Datenabläufe',
                        'Forschung & wissenschaftliches Rechnen',
                        'Integration in Unternehmensanwendungen'
                    ]
                },
                {
                    illustration: 'transformation',
                    title: 'KI-Transformation',
                    body: 'Ich unterstütze Unternehmen dabei, KI-Vorhaben nach ihrem geschäftlichen Nutzen zu priorisieren und die organisatorischen und technischen Voraussetzungen für ihre Umsetzung zu schaffen. Gemeinsam planen wir den Weg von ersten Pilotprojekten zum breiteren Einsatz im Unternehmen.',
                    examples: [
                        'Analyse der Voraussetzungen für den KI-Einsatz',
                        'Anwendungsfälle finden & priorisieren',
                        'Geschäftsprozesse verbessern',
                        'Datenbasis & technische Voraussetzungen bewerten',
                        'Einführungsstrategie & Pilotplanung',
                        'Qualifizierung von Teams & Wissenstransfer'
                    ]
                }
            ],
            selectionNote: 'Dies ist nur eine Auswahl meiner Leistungen. Gerne bespreche ich auch andere Herausforderungen.',
            cta: 'Projektbeispiele ansehen',
            contact: 'KI-Vorhaben besprechen'
        },
        work: {
            quote: 'Von der geschäftlichen Herausforderung zur KI, die im Alltag funktioniert.',
            subquote:
                'Ich unterstütze Teams dabei, Prozesse mit KI zu verbessern, und entwickle Systeme, die zu ihren Arbeitsweisen, Daten und ihrer Infrastruktur passen.',
            banner: {
                quote: 'Gute technische Lösungen beginnen mit guten Fragen.',
                subquote: 'Ich verbinde wissenschaftliche Neugier mit praktischer Erfahrung, um Probleme zu verstehen, Annahmen zu hinterfragen und einen sinnvollen Lösungsweg zu wählen.'
            },
            exploreStack: 'Meinen Tech-Stack entdecken',
            contact: 'Kontakt aufnehmen',
            title: 'Mein Hintergrund',
            description: 'Die Physik hat mich gelehrt, Annahmen zu hinterfragen. In der Softwareentwicklung habe ich gelernt, Software für den praktischen Einsatz zu entwickeln und langfristig zu betreuen. Beides bringe ich in KI-Projekte ein: So werden aus guten Ideen zuverlässige Systeme, die Teams verstehen, betreiben und weiterentwickeln können.',
            chapters: [
                {
                    title: 'Theoretische Physik',
                    body: 'Die Physik hat mich gelehrt, unklare Problemstellungen zu strukturieren und daraus Entwicklungs- und Validierungsschritte abzuleiten. Auch bei wechselnden Anforderungen oder technisch anspruchsvollen Aufgaben bleibe ich ruhig. Ich arbeite mich in schwierige Themen ein, bis klar ist, welche Lösung gebraucht wird und wie sie sich überprüfen lässt.',
                },
                {
                    title: 'Softwareentwicklung',
                    body: 'Seit mehr als sechs Jahren entwickle und pflege ich Software, die Menschen tatsächlich nutzen. Meine Arbeit reicht von Anwendungscode und Architektur bis zu Bereitstellung und Betrieb. Dabei achte ich darauf, dass Systeme langfristig zuverlässig und wartbar bleiben. Coding Agents helfen mir, schneller voranzukommen. Ich gebe die technische Richtung vor, prüfe die Ergebnisse und übernehme die Verantwortung dafür.',
                },
                {
                    title: 'KI-Systeme',
                    body: 'Ich entwickle KI-Systeme, die Teams selbst betreiben und weiterentwickeln können. Für europäische Unternehmen setze ich dabei häufig auf Open-Source- und On-Premises-Lösungen, damit Modelle, Daten und Betrieb unter ihrer Kontrolle bleiben. Entscheidend ist für mich, ob die Systeme im Alltag nützliche Ergebnisse liefern.',
                }
            ]
        },
        organisations: {
            quote: 'Nicht nur Theorie, sondern erprobte Praxis.',
            introduction: 'Mit diesen Unternehmen und Institutionen habe ich zusammengearbeitet:'
        },
        projects: {
            title: 'Fallstudien',
            description:
                'Von privaten KI-Plattformen und Sprachagenten bis zu leistungsfähigen Forschungspipelines: Diese Projekte zeigen, wie sich konkrete betriebliche Herausforderungen mit Systemen bewältigen lassen, die Teams nutzen, steuern und skalieren können.',
            selected: 'Dies ist eine Auswahl meiner Projekte. Weitere Beispiele und Erfahrungen in bestimmten Bereichen erläutere ich gerne im Gespräch.',
            exploreBackground: 'Über meinen Hintergrund',
            contact: 'Kontakt aufnehmen',
            filterBy: 'Filtern nach',
            filterLabel: 'Projekte nach Kategorie filtern',
            carouselLabel: 'Projektkarussell',
            stepsLabel: 'Schritte der Fallstudie',
            tagsLabel: 'Projekt-Tags',
            logoLabel: 'Unternehmenslogo',
            openCompanyWebsite: 'Unternehmenswebsite in neuem Tab öffnen',
            noMatches: 'Keine Projekte entsprechen den ausgewählten Kategorien. Über die Filter lassen sich passende Projekte auswählen.',
            previous: 'Zurück',
            next: 'Weiter',
            previousAriaLabel: 'Vorheriges Projekt anzeigen',
            nextAriaLabel: 'Nächstes Projekt anzeigen',
            shownSingular: '{count} Projekt angezeigt',
            shownPlural: '{count} Projekte angezeigt',
            shown: count => `${count} ${count === 1 ? 'Projekt' : 'Projekte'} angezeigt`
        },
        stack: {
            quote: 'Ich wähle die Technologien, die am besten zur jeweiligen Herausforderung passen.',
            subquote: 'Ich beurteile jede Technologie danach, wie zuverlässig und wartbar sie ist und ob sie den Anforderungen im Produktivbetrieb standhält.',
            title: 'Mein Tech-Stack',
            description:
                'Die Übersicht zeigt eine Auswahl der Technologien, mit denen ich sicher arbeite. Fehlt eine Technologie, ist das kein Hindernis: Ich lerne gern und finde mich schnell in neuen Stacks zurecht.',
            selectionNote: 'Hier ist nur eine Auswahl der Bibliotheken und Werkzeuge aufgeführt, die ich regelmäßig nutze.',
            questions: 'Noch Fragen?',
            contact: 'Projekt besprechen',
            production: 'In realen Produktionsumgebungen eingesetzt',
            research: 'In Forschung und persönlichen Projekten eingesetzt',
            search: 'Tech-Stack durchsuchen',
            noMatches: 'Keine Technologien entsprechen der Suche.',
            useProduction: 'Produktionseinsatz',
            useResearch: 'Forschung und persönliche Projekte',
            groups: ['Frontend', 'Backend', 'Datenbanken', 'Cloud & Infrastruktur', 'MLOps', 'Bibliotheken*']
        },
        contact: {
            quote: 'Nichts ersetzt ein echtes Gespräch.',
            subquote:
                'Auch wenn ich mit KI-Agenten arbeite, sind persönliche Beziehungen für mich unersetzlich. Deshalb nehme ich mir immer Zeit für persönliche Treffen und Gespräche.',
            title: 'Gemeinsam Ideen in die Praxis bringen',
            description:
                'Ein Projekt, eine Idee oder eine offene Frage? In einem Gespräch lässt sich klären, welche Unterstützung sinnvoll ist und ob eine Zusammenarbeit passt.',
            directCallTitle: 'Direkt anrufen',
            directCallBody: 'Während der europäischen Geschäftszeiten (8–18 Uhr CET) bin ich telefonisch erreichbar.',
            emailTitle: 'E-Mail senden',
            emailBody: 'Kontaktdaten und eine kurze Beschreibung des Anliegens helfen mir, die Anfrage einzuordnen und gezielt zu antworten.',
            missingEmail: 'Sobald eine E-Mail-Adresse konfiguriert ist, erscheint sie hier.',
            scheduleTitle: 'Gespräch oder Termin vereinbaren',
            scheduleBody:
                'Ein passender Termin lässt sich direkt im Kalender auswählen. Das Gespräch kann telefonisch oder per Videokonferenz stattfinden.',
            schedule: 'Gespräch planen',
            cvDownloads: {
                text: 'Mein Lebenslauf bietet eine kompakte Übersicht über meine Berufserfahrung und technischen Schwerpunkte. Er ist als PDF auf {english} und {german} verfügbar.',
                footerText: 'Lebenslauf ({english} / {german})',
                english: 'Englisch',
                german: 'Deutsch'
            },
            language: 'Sprache',
            rights: 'Alle Rechte vorbehalten.',
            agents: 'Für Agenten'
        }
    }
};
