/* Wortliste des Sprach-Audits (REQ-KP.08). Muster gelten am Wortanfang (Deutsch) bzw. als ganzes Wort mit Endung (Englisch);
   Zusammensetzungen, die mit einem anderen Wort beginnen (z. B. „Eisenwaffen“), treffen nicht. Die Wörter des Spiels selbst
   (z. B. „Kampf“ als Armeezustand) stehen nicht auf der Liste. */
export const VERBOTEN = {
  de: ['Horde', 'Soldat', 'Feldherr', 'Krieg', 'Beute', 'Schlacht', 'gebrochen', 'vernichte', 'töte', 'tötet', 'Waffe', 'Blut'],
  en: ['horde', 'soldier', 'commander', 'war', 'loot', 'battle', 'kill', 'destroy', 'weapon', 'blood'],
};
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export function pruefe(lang, text){
  const treffer = [];
  for (const w of VERBOTEN[lang]){
    const re = lang === 'de'
      ? new RegExp('(^|[^\\p{L}])' + esc(w), 'iu')
      : new RegExp('(^|[^\\p{L}])' + esc(w) + '(s|es|ed|ing|er|ers)?($|[^\\p{L}])', 'iu');
    if (re.test(text)) treffer.push(w);
  }
  return treffer;
}
