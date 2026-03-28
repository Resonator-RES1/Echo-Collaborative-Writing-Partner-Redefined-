import { RefinedVersion } from '../types';

export const formatReportForCopy = (version: RefinedVersion): string => {
    let report = `ECHO REFINEMENT REPORT: ${version.title || 'Untitled'}\n`;
    report += `==========================================\n\n`;
    
    report += `SUMMARY (ECHO'S VERDICT):\n${version.summary || 'No summary available.'}\n\n`;
    
    if (version.analysis) {
        report += `MIRROR EDITOR ANALYSIS:\n${version.analysis}\n\n`;
    }
    
    if (version.restraintLog && version.restraintLog.length > 0) {
        report += `RESTRAINT LOG (DELIBERATE PRESERVATIONS):\n`;
        version.restraintLog.forEach(log => {
            report += `- [${log.category.toUpperCase()}] "${log.target}": ${log.justification}\n`;
        });
        report += `\n`;
    }
    
    if (version.voiceAudits && version.voiceAudits.length > 0) {
        report += `VOICE RESONANCE RADAR:\n`;
        version.voiceAudits.forEach(audit => {
            report += `- ${audit.characterName.toUpperCase()}: ${audit.resonanceScore}% ${audit.dissonanceReason ? `- ${audit.dissonanceReason}` : ''}\n`;
        });
        report += `\n`;
    }
    
    if (version.audit) {
        report += `FIDELITY AUDIT:\n`;
        report += `- VOICE FIDELITY: ${version.audit.voiceFidelityScore}/10 - ${version.audit.voiceFidelityReasoning}\n`;
        report += `- LORE COMPLIANCE: ${version.audit.loreCompliance}/10 - ${version.audit.loreComplianceReasoning}\n`;
        report += `- VOICE ADHERENCE: ${version.audit.voiceAdherence}/10 - ${version.audit.voiceAdherenceReasoning}\n`;
        report += `- FOCUS ALIGNMENT: ${version.audit.focusAreaAlignment}/10 - ${version.audit.focusAreaAlignmentReasoning}\n`;
        report += `\n`;
    }
    
    if (version.expressionProfile && version.expressionProfile.length > 0) {
        report += `EXPRESSION PROFILE:\n`;
        version.expressionProfile.forEach(profile => {
            report += `- ${profile.vibe.toUpperCase()}: ${profile.score}/10 (${profile.qualifier}) - ${profile.note}\n`;
        });
        report += `\n`;
    }
    
    if (version.metrics) {
        report += `PROSE METRICS:\n`;
        Object.entries(version.metrics).forEach(([key, metric]: [string, any]) => {
            report += `- ${key.replace(/_/g, ' ').toUpperCase()}: ${metric.score}/10 - ${metric.note}\n`;
        });
        report += `\n`;
    }
    
    if (version.loreCorrections && version.loreCorrections.length > 0) {
        report += `LORE CORRECTIONS:\n`;
        version.loreCorrections.forEach(correction => {
            report += `- ORIGINAL: "${correction.original}"\n  REFINED: "${correction.refined}"\n  REASON: ${correction.reason}\n`;
        });
        report += `\n`;
    }

    if (version.loreFraying && version.loreFraying.length > 0) {
        report += `LORE FRAYING:\n`;
        version.loreFraying.forEach(fray => {
            report += `- SNIPPET: "${fray.snippet}"\n  CONFLICT: ${fray.conflict}\n  SUGGESTION: ${fray.suggestion}\n`;
        });
        report += `\n`;
    }

    if (version.activeContext) {
        report += `ACTIVE CONTEXT:\n`;
        report += `- AUTHOR VOICE: ${version.activeContext.authorVoice || 'None'}\n`;
        report += `- CHARACTER VOICES: ${version.activeContext.characterVoices.length > 0 ? version.activeContext.characterVoices.join(', ') : 'None'}\n`;
        report += `- LORE PROFILES: ${version.activeContext.loreProfiles.length > 0 ? version.activeContext.loreProfiles.join(', ') : 'None'}\n`;
        report += `- FOCUS AREAS: ${version.activeContext.focusAreas.length > 0 ? version.activeContext.focusAreas.join(', ') : 'None'}\n`;
        report += `\n`;
    }
    
    return report;
};
