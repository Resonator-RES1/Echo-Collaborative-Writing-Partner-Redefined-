import { GUIDE_SECTIONS } from '../constants';

export const copyFullGuideToClipboard = () => {
    let fullGuide = "# Echo Studio - Full Guide\n\n";
    GUIDE_SECTIONS.forEach(section => {
      fullGuide += `## ${section.title}\n${section.description}\n\n### Key Features\n`;
      section.features.forEach(feature => {
        fullGuide += `- ${feature}\n`;
      });
      if (section.categories) {
        section.categories.forEach(category => {
          fullGuide += `\n### ${category.title}\n`;
          category.items.forEach(item => {
            fullGuide += `#### ${item.title}\n${item.description}\n`;
            if (item.example) {
              fullGuide += `*Example:*\n- Before: ${item.example.before}\n- After: ${item.example.after}\n`;
            }
            fullGuide += `\n`;
          });
        });
      }
      fullGuide += `\n---\n\n`;
    });
    
    navigator.clipboard.writeText(fullGuide);
};
