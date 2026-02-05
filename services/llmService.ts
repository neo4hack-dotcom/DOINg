
import { Team, User, TaskStatus, LLMConfig, Meeting, WeeklyReport, ChatMessage, Note } from "../types";

export const DEFAULT_PROMPTS = {
    team_report: `
Tu es un assistant expert en gestion de projet. Rédige un rapport d'état concis et professionnel basé sur ces données.
DONNÉES :
{{DATA}}
FORMAT ATTENDU :
1. **Synthèse Exécutive** : Santé globale de l'équipe en 2 phrases.
2. **Points d'Attention** : Liste des bloqueurs ou risques critiques.
3. **Plan d'Action** : 3 actions recommandées.
Réponds en français. Sois factuel et direct.
`,
    meeting_summary: `
Rédige un compte-rendu de réunion professionnel prêt à être envoyé par email.
DONNÉES :
{{DATA}}
FORMAT :
Objet : [CR] {{TITLE}}
1. **Résumé** : Discussions principales.
2. **Décisions Clés**.
3. **Actions à mener** : Qui fait quoi et pour quand.
Réponds en français.
`,
    weekly_email: `
Aide un employé à rédiger son rapport hebdomadaire pour sa direction.
DONNÉES :
{{DATA}}
FORMAT :
Objet : Rapport Hebdomadaire - {{NAME}} - {{WEEK}}
Introduction courte, succès marquants, défis rencontrés et perspectives.
Réponds en français. Professionnel et positif.
`,
    management_insight: `
Tu es un consultant en management. Analyse ces données pour fournir une vision stratégique globale.
DONNÉES :
{{DATA}}
Structure avec des emojis et des titres clairs. Identifie les dérives de planning et les succès d'équipe.
Réponds en français.
`,
    risk_assessment: `
Analyse les risques critiques basés sur les données de projet et les rapports d'équipe.
DONNÉES :
{{DATA}}
Identifie les projets "Red", les surcharges de personnel et les dépendances critiques.
Réponds en français.
`,
    note_summary: `
Synthétise cette note ou ce canvas de travail.
CONTENU :
{{DATA}}
Identifie les idées forces, les questions en suspens et les prochaines étapes.
Réponds en français.
`,
    doc_synthesis: `
Analyse ce document ou cet extrait.
CONTENU :
{{DATA}}
Fournis un résumé exécutif, les 3 points clés et les alertes potentielles.
Réponds en français.
`
};

const callLocalHttp = async (prompt: string, config: LLMConfig, images?: string[]): Promise<string> => {
    const url = config.baseUrl || 'http://127.0.0.1:11434/v1/chat/completions';
    
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };
    if (config.apiKey) headers['Authorization'] = `Bearer ${config.apiKey}`;

    try {
        const payload: any = {
            model: config.model || 'llama3',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7
        };

        // Si des images sont fournies (format base64 sans header pour certains modèles locaux)
        if (images && images.length > 0) {
            payload.messages[0].content = [
                { type: "text", text: prompt },
                ...images.map(img => ({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${img}` } }))
            ];
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`Erreur API Locale : ${response.statusText}`);
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "Aucune réponse de l'IA locale.";
    } catch (e) {
        console.error(e);
        return "Erreur : Impossible de contacter votre IA locale. Vérifiez que votre serveur (ex: Ollama ou LocalAI) est lancé sur " + url;
    }
};

const fillTemplate = (template: string, replacements: Record<string, string>) => {
    let result = template;
    for (const key in replacements) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, replacements[key]);
    }
    return result;
};

export const generateTeamReport = async (team: Team, manager: User | undefined, config: LLMConfig, customPrompts?: Record<string, string>) => {
    const data = JSON.stringify({
        teamName: team.name,
        manager: manager ? `${manager.firstName} ${manager.lastName}` : 'N/A',
        projects: team.projects.map(p => ({
            name: p.name,
            status: p.status,
            progress: p.tasks.length > 0 ? (p.tasks.filter(t => t.status === TaskStatus.DONE).length / p.tasks.length) * 100 : 0,
            tasks: p.tasks.map(t => ({ title: t.title, status: t.status, priority: t.priority }))
        }))
    }, null, 2);

    const template = customPrompts?.team_report || DEFAULT_PROMPTS.team_report;
    const prompt = fillTemplate(template, { DATA: data });
    return await callLocalHttp(prompt, config);
};

export const generateMeetingSummary = async (meeting: Meeting, team: Team | undefined, users: User[], config: LLMConfig) => {
    const attendeeNames = meeting.attendees.map(id => {
        const u = users.find(user => user.id === id);
        return u ? `${u.firstName} ${u.lastName}` : id;
    }).join(', ');

    const data = JSON.stringify({
        title: meeting.title,
        date: meeting.date,
        team: team?.name || 'N/A',
        attendees: attendeeNames,
        minutes: meeting.minutes,
        actionItems: meeting.actionItems.map(a => ({
            task: a.description,
            owner: users.find(u => u.id === a.ownerId)?.lastName || a.ownerId,
            due: a.dueDate
        }))
    }, null, 2);

    const prompt = fillTemplate(DEFAULT_PROMPTS.meeting_summary, { DATA: data, TITLE: meeting.title });
    return await callLocalHttp(prompt, config);
};

export const generateWeeklyReportSummary = async (report: WeeklyReport, user: User | null, config: LLMConfig) => {
    const data = JSON.stringify(report, null, 2);
    const prompt = fillTemplate(DEFAULT_PROMPTS.weekly_email, { 
        DATA: data, 
        NAME: user ? `${user.firstName} ${user.lastName}` : 'Employé',
        WEEK: report.weekOf 
    });
    return await callLocalHttp(prompt, config);
};

export const generateManagementInsight = async (teams: Team[], reports: WeeklyReport[], users: User[], config: LLMConfig) => {
    const data = JSON.stringify({
        teamCount: teams.length,
        totalProjects: teams.reduce((sum, t) => sum + t.projects.length, 0),
        recentReports: reports.slice(0, 10).map(r => ({
            user: users.find(u => u.id === r.userId)?.lastName,
            success: r.mainSuccess,
            issue: r.mainIssue,
            health: { team: r.teamHealth, project: r.projectHealth }
        }))
    }, null, 2);

    const prompt = fillTemplate(DEFAULT_PROMPTS.management_insight, { DATA: data });
    return await callLocalHttp(prompt, config);
};

export const generateRiskAssessment = async (teams: Team[], reports: WeeklyReport[], users: User[], config: LLMConfig) => {
    const data = JSON.stringify({
        projects: teams.flatMap(t => t.projects.map(p => ({ 
            name: p.name, 
            status: p.status, 
            blocked: p.tasks.filter(tk => tk.status === TaskStatus.BLOCKED).length 
        }))),
        reports: reports.filter(r => r.teamHealth === 'Red' || r.projectHealth === 'Red')
    }, null, 2);

    const prompt = fillTemplate(DEFAULT_PROMPTS.risk_assessment, { DATA: data });
    return await callLocalHttp(prompt, config);
};

export const sendChatMessage = async (history: ChatMessage[], input: string, config: LLMConfig, images?: string[]) => {
    const context = history.slice(-5).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
    const prompt = `Contexte de la conversation :\n${context}\n\nUtilisateur : ${input}\nAssistant :`;
    return await callLocalHttp(prompt, config, images);
};

export const generateDocumentSynthesis = async (content: string, config: LLMConfig) => {
    const prompt = fillTemplate(DEFAULT_PROMPTS.doc_synthesis, { DATA: content });
    return await callLocalHttp(prompt, config);
};

export const generateNoteSummary = async (note: Note, includeImages: boolean, config: LLMConfig) => {
    const blocksText = note.blocks
        .filter(b => b.type === 'text' || (includeImages && b.type === 'image'))
        .map(b => b.type === 'text' ? b.content : "[Image attachée]")
        .join('\n');
    
    const prompt = fillTemplate(DEFAULT_PROMPTS.note_summary, { DATA: blocksText });
    return await callLocalHttp(prompt, config);
};
