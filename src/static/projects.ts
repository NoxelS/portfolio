export const projects = [
    {
        title: 'Ultimate House Scraper',
        description: `
            Dieses Projekt ist eine Weiterentwicklung des House Scraper Projekts. Es ist ein Web-Scraper, der Immobilienanzeigen von von verschiedenen Immobilienportalen
            zusammenfasst und mittels OpenAi eine tägliche und aktuelle Zusammenfassung erstellt. Es ist außerdem möglich, die Vermieter mittels AI-Textgenerierung zu kontaktieren.
            Steht ein Kalender zur verfügung können außerdem Besichtigungstermine erstellen und verwalten werden.
        `,
        tags: [
            { text: 'OpenAI', color: '#88E479' },
            { text: 'TypeScript', color: '#81F0FF' },
            { text: 'Puppeteer', color: '#333' },
            { text: 'Docker', color: '#81F0FF' }
        ],
        link: 'https://github.com/NoxelS/ultimate-scraper',
        date: '06.04.2023'
    },
    {
        title: 'OpenAI Web Scraper',
        description: `
            Bei diesem Projekt handelt es sich um ein Vorlagen-Repository für die Entwicklung von Web-Scrapern mit OpenAI-Unterstützung.
            Da ich häufig Web-Scraping Projekte entwickle, habe ich mich entschieden, ein Vorlagen-Repository zu erstellen, das eine grundlegende Projektstruktur mit TypeScript und Puppeteer vorkonfiguriert, sowie OpenAI's GPT-4 API.
        `,
        tags: [
            { text: 'OpenAI', color: '#88E479' },
            { text: 'TypeScript', color: '#81F0FF' },
            { text: 'Puppeteer', color: '#333' },
            { text: 'Docker', color: '#81F0FF' }
        ],
        link: 'https://github.com/NoxelS/openai-scraper',
        date: '29.03.2023'
    },
    {
        title: 'House Scraper',
        description: `
            Dieses Projekt ist ein Web-Scraper, der Immobilienanzeigen von von verschiedenen Immobilienportalen 
            zusammenfasst und mittels OpenAi eine tägliche und aktuelle Zusammenfassung erstellt. Diese wird
            anschließend per E-Mail an alle Nutzer versendet.
        `,
        tags: [
            { text: 'TypeScript', color: '#81F0FF' },
            { text: 'Puppeteer', color: '#333' },
            { text: 'Docker', color: '#81F0FF' }
        ],
        link: 'https://github.com/NoxelS/house-scraper',
        date: '19.02.2022'
    },
    {
        title: 'MVB Statement Analyser',
        description: `
            Dieses Projekt analysiert mittels einer Machine Learning API alte Kontoauszüge. Damit ist es möglich, Kontotransaktionen welche nur auf 
            Papier vorliegen, in eine digitale Form zu überführen. Das Projekt unterstützt nur die MVB Bank.
        `,
        tags: [
            { text: 'Machine Learning', color: '#E479CD' },
            { text: 'TypeScript', color: '#81F0FF' }
        ],
        date: '28.01.2022'
    },
    {
        title: 'Website der Direktorenvereinigung',
        description: `
            Dieses Projekt ist ein Content-Management-System mit einer Website für Direktorenvereinigung der Gesamtschulen in Rheinland-Pfalz.
            Das CMS ist eine Komplettlösung, die von der Datenbank über die API bis hin zum Frontend reicht. Damit werden Newsartikel und interne Prozesse 
            der Direktorenvereinigung verwaltet.
        `,
        tags: [
            { text: 'AngularJs', color: '#ED5E5E' },
            { text: 'ExpressJs', color: '#FFDC81' },
            { text: 'Docker', color: '#81F0FF' }
        ],
        date: '18.09.2021'
    },
    {
        title: 'SELG Projekt',
        description: `
            Das SELG Projekt ist ein Content-Management-System für integrierten Gesamtschulen in Rheinland-Pfalz. 
            Mit dem CMS werden Verbalbewertungen und Noten verwaltet und ausgewertet, sodass Lehrer für bevorstehende Gespräche 
            (die sog. Schüler-Eltern-Lehrer Gespräche, SELG) automatisch vorbereitet werden.
        `,
        tags: [
            { text: 'NodeJs', color: '#FFDC81' },
            { text: 'ExpressJs', color: '#FFDC81' },
            { text: 'Docker', color: '#81F0FF' }
        ],
        date: '01.09.2020'
    },
    {
        title: 'Kokolores',
        description: `
            Kokolores ist ein Multiplayerspielt ähnlich wie Quiplash, das ich mit einigen Freunden entwickelt habe. Das Spiel forder die Mitspieler heraus,
            möglichst lustige und kreative Antworten auf Prompts zu geben. Die Mitspieler können dann die Antworten bewerten und die besten Antworten werden
            anschließend in einer Rangliste angezeigt. <i>Das Spiel ist leider nicht mehr verfügbar, da wir es nicht mehr weiterentwickeln.</i>
        `,
        tags: [
            { text: 'AngularJs', color: '#ED5E5E' },
            { text: 'TypeScript', color: '#81F0FF' }
        ],
        link: 'http://kokolores.io/',
        date: '09.02.2020'
    }
];

export const work = [
    {
        title: 'Frontend Developer',
        location: 'KuppingerCole Analysts AG',
        link: 'https://www.kuppingercole.com',
        type: 'Werkstudent, Teilzeit',
        skills: [
            'Entwicklung von internen IT‑Projekten, vorwiegend in VueJS und AstroJs',
            'Selbstständige Entwicklung von lightweight JavaScript Packages',
            'Mitsprache im Entwicklungsprozess neuer Applikationen und deren Technologiestrukturen'
        ],
        date: 'Heute - 10.2021'
    },
    {
        title: 'Full Stack Developer',
        location: 'CMS für die Direktorenvereinigung der Gesamtschulen in Rheinland-Pfalz',
        type: 'Honorar, Teilzeit',
        skills: [
            'Komplettlösung eines Content‑Management‑Systems mittels AngularJs und NodeJs',
            'Eigenständige Projekt- und Risikoplanung',
            'Entwicklung von Design und Struktur bis hin zur Realisierung und Deployment',
            'Datenbankverwaltung in MySql',
            'Realisierung zu 100% in Typescript',
            'Versionsverwaltung mithilfe von GIT',
            'Deployment des Systems mithilfe von Docker'
        ],
        date: '07.2021 - 09.2020'
    },
    {
        title: 'Frontend Developer',
        location: 'GIP Exyr GmbH',
        link: 'https://www.gip.com/',
        type: 'Werkstudent, Vollzeit',
        skills: [
            'Entwicklung von modernen AngularJS Frontend Apps zur Datenvisualisierung und workflowbasierten Netzwerksteuerung',
            'Entwicklung von wiederverwendbaren Komponenten',
            'Agile Softwareentwicklung gestützt durch Jira',
            'Kontinuierliche Integration mit Jenkins',
            'Ticket basierte Entwicklung in einem dynamischen Team',
            'Versionsverwaltung mithilfe von SVN',
            'Performanceanalyse von AngularJs Apps'
        ],
        date: '09.2020 - 04.2020'
    },
    {
        title: 'Frontend Developer',
        location: 'SELG Tool der IGS',
        type: 'Honorar, Teilzeit',
        skills: [
            'Komplettlösung einer Webapp zur Datenverwaltung der Integrierten Gesamtschulen in Rheinland‑Pfalz',
            'Eigenständiges Projektmanagement',
            'Kontinuierliche Integration mittels Jenkins',
            'Backend Development mit NodeJs und ExpressJs',
            'Frontend Development mit Moustache',
            'Versionsverwaltung mithilfe von GIT',
            'Deployment des Systems mithilfe von Docker'
        ],
        date: '09.2020 - 04.2020'
    }
];

export const academic = [
    {
        title: 'Physik',
        location: '---',
        description: 'Master of Science',
        date: 'ab 2024',
        prog: true
    },
    {
        title: 'Physik',
        location: 'Universität des Saarlands',
        description: 'Bachelor of Science',
        date: '2024'
    },
    {
        title: 'Oberstufe',
        location: 'MSS der Integrierten Gesamtschule Nieder-Olm',
        description: 'Allgemeine Hochschulreife',
        date: '2020'
    },
    {
        title: 'Mittlere Reife',
        location: 'MSS der Integrierten Gesamtschule Nieder-Olm',
        description: 'Mittlere Reife',
        date: '2023'
    }
];
