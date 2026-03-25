import { GUIDE_SECTIONS, ECHO_MANUAL_CONTENT } from '../constants';

export const copyFullGuideToClipboard = () => {
    let fullGuide = "# ECHO STUDIO - THE COMPLETE CODEX\n\n";
    
    GUIDE_SECTIONS.forEach(section => {
      fullGuide += `## ${section.title}\n${section.description}\n\n`;
      
      if (section.features && section.features.length > 0) {
        fullGuide += `### Key Features\n`;
        section.features.forEach(feature => {
          fullGuide += `- ${feature}\n`;
        });
      }
      
      if (section.categories) {
        section.categories.forEach(category => {
          fullGuide += `\n### ${category.title}\n`;
          category.items.forEach(item => {
            fullGuide += `#### ${item.title}\n${item.description}\n`;
            
            if (item.proTips && item.proTips.length > 0) {
              fullGuide += `\n*Pro Tips:*\n`;
              item.proTips.forEach(tip => {
                fullGuide += `- ${tip}\n`;
              });
            }
            
            if (item.example) {
              fullGuide += `\n*Example:*\n- Before: ${item.example.before}\n- After: ${item.example.after}\n`;
            }
            fullGuide += `\n`;
          });
        });
      }
      fullGuide += `\n---\n\n`;
    });

    fullGuide += `## THE MANUAL (TECHNICAL SPECS)\n\n`;
    ECHO_MANUAL_CONTENT.forEach(manual => {
      fullGuide += `### ${manual.feature}\n**Philosophy:** ${manual.philosophy}\n**Technical Constraints:** ${manual.technicalConstraints}\n\n`;
    });
    
    navigator.clipboard.writeText(fullGuide);
};
