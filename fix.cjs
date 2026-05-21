const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/PICHAU/Pictures/Roteiros/src/stores';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

// Some bytes might be parsed differently, so we use the actual broken UTF-8 characters 
// that were read as ANSI and saved as UTF-8 by the powershell script.
const replacements = {
  'Em criaÃ§Ã£o': 'Em criação',
  'âœ ï¸': '✏️',
  'ðŸŽ¯': '🎯',
  'ðŸŽ¬': '🎬',
  'Em ediÃ§Ã£o': 'Em edição',
  'ðŸŽžï¸': '🎞️',
  'ðŸ“…': '📅',
  'NÃ£o avaliado': 'Não avaliado',
  'NÃ£o rendeu': 'Não rendeu',
  'MÃ©dio': 'Médio',
  'cÃ³pia': 'cópia',
  'CÃ³pia': 'Cópia',
  'migraÃ§Ã£o': 'migração',
  'histÃ³rico': 'histórico',
  'VÃ­deos': 'Vídeos',
  'estÃ¡gios': 'estágios',
  'sÃ£o': 'são',
  'acessÃ­veis': 'acessíveis',
  'pÃ¡gina': 'página',
  'presenÃ§a': 'presença',
  'tambÃ©m': 'também',
  'anÃ¡lise': 'análise',
  'DescriÃ§Ã£o': 'Descrição',
  'ProjeÃ§Ã£o': 'Projeção',
  'AÃ§Ã£o': 'Ação',
  'OpÃ§Ãµes': 'Opções',
  'padrÃ£o': 'padrão',
  'PadrÃ£o': 'Padrão',
  'VocÃª': 'Você'
};

files.forEach(f => {
  const p = path.join(dir, f);
  let content = fs.readFileSync(p, 'utf8');
  let changed = false;
  for (const [bad, good] of Object.entries(replacements)) {
    if (content.includes(bad)) {
      content = content.split(bad).join(good);
      changed = true;
    }
  }
  // Try fallback logic for characters like Ã§Ã£
  const fallbackReplacements = {
    'criaÃ§Ã£o': 'criação',
    'ediÃ§Ã£o': 'edição',
    'cÃ³pia': 'cópia',
    'NÃ£o': 'Não',
    'MÃ©dio': 'Médio',
    'histÃ³rico': 'histórico',
    'VÃ­deos': 'Vídeos',
    'pÃ¡gina': 'página',
    'tambÃ©m': 'também',
    'anÃ¡lise': 'análise',
    'DescriÃ§Ã£o': 'Descrição',
    'ProjeÃ§Ã£o': 'Projeção',
    'padrÃ£o': 'padrão'
  };
  for (const [bad, good] of Object.entries(fallbackReplacements)) {
    if (content.includes(bad)) {
      content = content.split(bad).join(good);
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(p, content, 'utf8');
    console.log('Fixed', f);
  }
});
