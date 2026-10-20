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
        areas: { title: string; body: string; cta: string }[];
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
        hero: {
            summaryCompact:
                `I’m an EU-based freelance Applied AI Engineer building and deploying production AI systems, from inference infrastructure to autonomous agents and enterprise applications, with a focus on reliability, open technologies, and data sovereignty.`,
            summary:
                `I’m an EU-based freelance Applied AI Engineer specialising in building and deploying production AI systems. I work across the AI stack, from model serving and inference infrastructure to autonomous agents and enterprise applications, with a focus on reliability, open technologies, and data sovereignty.`,
            exploreWork: 'Explore what I build',
            contact: 'Get in touch',
            portraitAlt: 'Portrait of Noel Pascal Schwabenland',
            principle: 'I build with scalability, <br/> maintainability and performance in mind',
            performanceLabel: 'View site performance details',
            performanceTooltip: /* 'Server delivery: {server} ms. ' + */ 'FCP: {fcp} ms. Yes, I even over-optimized my portfolio website.',
            socials: 'My socials'
        },
        services: {
            title: 'What I build',
            description:
                'I help business and engineering teams design, build and improve AI systems, with consulting and full-stack delivery across infrastructure, data, models, backends and user interfaces.',
            areas: [
                {
                    title: 'AI infrastructure',
                    body: 'I design and build the foundations for running AI: model serving, inference gateways, data storage and deployment infrastructure. This includes cloud and on-premises setups, with monitoring, access controls and operational tooling. I can review an existing platform, plan an architecture, or implement the stack.',
                    cta: 'Explore infrastructure I deployed'
                },
                {
                    title: 'AI systems',
                    body: 'I build AI applications that connect company knowledge, people and workflows. Examples include RAG-based search, assistants and agent systems, speech recognition and synthesis pipelines, and process automation. I work across user interfaces, backend services and integrations, so the result fits the way teams work and the systems they already use.',
                    cta: 'See production systems I built'
                },
                {
                    title: 'ML workflows',
                    body: 'I build data and machine-learning workflows for processing, training, evaluation and inference. This includes time-series analysis and forecasting, research pipelines, batch jobs and model integrations. I can help turn an experimental workflow into a reproducible pipeline, connect it to an application, or improve how it runs in production.',
                    cta: 'Explore my ML workflows'
                }
            ]
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
            contact: 'Learn more about my background',
            title: 'My background',
            description: 'Physics taught me to question assumptions. Software development taught me to build for real users and maintain what I ship. I bring both to AI projects, turning promising ideas into reliable systems that teams can understand, operate, and improve.',
            chapters: [
                {
                    title: 'Theoretical Physics',
                    body: 'Physics taught me to turn ambiguous problems into structured development and validation steps. It also taught me to stay calm when requirements change or technical depth becomes demanding. I work my way into difficult problems until I understand what needs to be built and how to validate it.',
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
            introduction: 'I already got the chance to have contributed alongside some awesome organisations:'
        },
        projects: {
            title: 'My Projects',
            description:
                'From private AI platforms and voice agents to high-performance research pipelines, these projects solve real operational constraints with systems teams can use, govern, and scale.',
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
            quote: 'From ideas and requirements to reality.',
            subquote: 'With a broad skill set and a passion for learning, I help bring ideas to life.',
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
            title: defaultSeo.title,
            description:
                `Noel Schwabenland ist freiberuflicher Applied AI Engineer mit Sitz in der EU. Er entwickelt produktive KI-Systeme, von Inferenzinfrastruktur bis zu autonomen Agenten, mit Fokus auf Zuverlässigkeit und Datensouveränität.`,
            imageAlt: 'Porträt von Noel Pascal Schwabenland'
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
            socials: 'Meine Profile'
        },
        services: {
            title: 'Was ich entwickle',
            description:
                'Ich unterstütze Fachbereiche und Entwicklungsteams bei der Konzeption, Entwicklung und Verbesserung von KI-Systemen. Meine Arbeit umfasst Beratung und Full-Stack-Umsetzung: Infrastruktur, Daten, Modelle, Backend und Benutzeroberflächen.',
            areas: [
                {
                    title: 'KI-Infrastruktur',
                    body: 'Ich konzipiere und entwickle die technische Grundlage für den KI-Betrieb: Model Serving, Inferenz-Gateways, Datenspeicherung und Bereitstellung. Dazu gehören Cloud- und On-Premises-Umgebungen mit Monitoring, Zugriffskontrollen und Betriebswerkzeugen. Ich prüfe bestehende Plattformen, plane Architekturen und setze die Infrastruktur um.',
                    cta: 'Meine KI-Infrastruktur entdecken'
                },
                {
                    title: 'KI-Anwendungen',
                    body: 'Ich entwickle KI-Anwendungen, die Unternehmenswissen, Menschen und Arbeitsabläufe verbinden. Dazu zählen RAG-basierte Suche, Assistenten und Agentensysteme, Pipelines für Spracherkennung und Sprachsynthese sowie Prozessautomatisierung. Ich verbinde Benutzeroberflächen, Backend-Dienste und Schnittstellen zu Anwendungen, die zu den bestehenden Prozessen und Systemen passen.',
                    cta: 'Produktive KI-Systeme ansehen'
                },
                {
                    title: 'ML-Workflows',
                    body: 'Ich entwickle Daten- und Machine-Learning-Workflows für Verarbeitung, Training, Evaluation und Inferenz. Dazu gehören Zeitreihenanalyse und -prognosen, Forschungspipelines, Batch-Verarbeitung und Modellintegrationen. Ich überführe experimentelle Abläufe in reproduzierbare Pipelines, binde sie in Anwendungen ein und verbessere ihren Betrieb.',
                    cta: 'Meine ML-Workflows entdecken'
                }
            ]
        },
        work: {
            quote: 'Von der geschäftlichen Herausforderung zur KI, die im Alltag funktioniert.',
            subquote:
                'Ich helfe Teams, sinnvolle Einsatzmöglichkeiten zu finden und passende KI-Systeme zu entwickeln, die sich in ihre Prozesse und Infrastruktur einfügen.',
            banner: {
                quote: 'Gute technische Lösungen beginnen mit guten Fragen.',
                subquote: 'Ich verbinde wissenschaftliche Neugier mit praktischer Erfahrung, um Probleme zu verstehen, Annahmen zu hinterfragen und einen sinnvollen Lösungsweg zu wählen.'
            },
            exploreStack: 'Meinen Tech-Stack entdecken',
            contact: 'Mehr über meinen Hintergrund erfahren',
            title: 'Mein Hintergrund',
            description: 'Die Physik hat mich gelehrt, Annahmen zu hinterfragen. In der Softwareentwicklung habe ich gelernt, für reale Nutzer zu bauen und meine Arbeit langfristig zu betreuen. Beides bringe ich in KI-Projekte ein: So werden aus guten Ideen zuverlässige Systeme, die Teams verstehen, betreiben und weiterentwickeln können.',
            chapters: [
                {
                    title: 'Theoretische Physik',
                    body: 'Die Physik hat mich gelehrt, mehrdeutige Probleme in strukturierte Entwicklungs- und Validierungsschritte zu übersetzen. Sie hat mir auch geholfen, bei sich ändernden Anforderungen oder hoher technischer Tiefe ruhig zu bleiben. Ich arbeite mich in schwierige Themen ein, bis ich verstehe, was gebaut und wie es validiert werden muss.',
                },
                {
                    title: 'Softwareentwicklung',
                    body: 'Seit mehr als sechs Jahren entwickle und pflege ich Software, die Menschen tatsächlich nutzen. Meine Arbeit reicht von Anwendungscode und Architektur bis zu Bereitstellung und Betrieb. Dabei achte ich darauf, dass Systeme langfristig zuverlässig und wartbar bleiben. Coding Agents helfen mir, schneller voranzukommen. Die technische Richtung gebe ich vor, prüfe die Ergebnisse und übernehme die Verantwortung dafür.',
                },
                {
                    title: 'KI-Systeme',
                    body: 'Ich entwickle KI-Systeme, die Teams selbst betreiben und weiterentwickeln können. Für europäische Unternehmen setze ich dabei häufig auf Open-Source- und On-Premises-Lösungen, damit Modelle, Daten und Betrieb unter ihrer Kontrolle bleiben. Entscheidend ist für mich, ob die Systeme im Alltag nützliche Ergebnisse liefern.',
                }
            ]
        },
        organisations: {
            quote: 'Nicht nur Theorie, sondern erprobte Praxis.',
            introduction: 'Ich hatte bereits die Gelegenheit, mit großartigen Organisationen zusammenzuarbeiten:'
        },
        projects: {
            title: 'Meine Projekte',
            description:
                'Von privaten KI-Plattformen und Sprachagenten bis zu leistungsfähigen Forschungspipelines: Diese Projekte lösen reale betriebliche Anforderungen mit Systemen, die Teams nutzen, steuern und skalieren können.',
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
            quote: 'Von Ideen und Anforderungen zur Realität.',
            subquote: 'Mit einem breiten Skill-Set und Freude am Lernen helfe ich dabei, Ideen in die Praxis zu bringen.',
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
            language: 'Sprache',
            rights: 'Alle Rechte vorbehalten.',
            agents: 'Für Agenten'
        }
    }
};
