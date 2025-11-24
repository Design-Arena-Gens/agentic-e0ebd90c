'use client';

import { useMemo, useState } from 'react';

const moodProfiles = {
  emotive: {
    label: 'Emotive et chaleureuse',
    tempoHint: '70-92 BPM',
    energyArc: ['intime', 'progression', 'apogee', 'retour sensible'],
    primaryPercussion: ['bendir souffle leger', 'bendir grave sur refrains', 'tabla cabile discrete'],
    harmonicColors: ['accords ouverts', 'suspensions 2 et 4', 'cadences plagales'],
    textureIdeas: ['choeurs tamazight en nappe', 'oud double les lignes vocales', 'violon legato'],
  },
  festive: {
    label: 'Festive et dansante',
    tempoHint: '100-118 BPM',
    energyArc: ['energetique', 'relance', 'dense', 'final collectif'],
    primaryPercussion: ['bendir lateral', 'derbouka syncopee', 'claps traditionnels'],
    harmonicColors: ['mode majeur mixolydien', 'cadences I - bVII', 'voicings ouverts'],
    textureIdeas: ['flute gasba en contrechant', 'mandole et guitare en repons', 'choeurs collectifs'],
  },
  introspective: {
    label: 'Introspective et poetique',
    tempoHint: '60-78 BPM',
    energyArc: ['chuchote', 'respire', 'surgit', 'retombe lumineuse'],
    primaryPercussion: ['percu texturale', 'bendir balais', 'shaker fin'],
    harmonicColors: ['mode mineur dorien', 'pedales drone', 'intervalles 4 et 5'],
    textureIdeas: ['tam-tam grave', 'guitare electro acoustique', 'santur atmospherique'],
  },
  modern: {
    label: 'Moderne hybride',
    tempoHint: '88-105 BPM',
    energyArc: ['progressif', 'additif', 'climax', 'break epure'],
    primaryPercussion: ['kick 808 souffle', 'clap sec', 'hi-hats tres fins'],
    harmonicColors: ['superpositions quartes', 'voicings neo-soul', 'bass synth glide'],
    textureIdeas: ['pads granulaires', 'guitare electrique delayed', 'doubling vocal air'],
  },
};

const instrumentPalette = [
  { id: 'mandole', label: 'Mandole kabyle', role: 'melodie' },
  { id: 'oud', label: 'Oud', role: 'melodie' },
  { id: 'guitareAcoustique', label: 'Guitare acoustique', role: 'harmonie' },
  { id: 'guitareElectrique', label: 'Guitare electrique ambiante', role: 'couleurs' },
  { id: 'bendir', label: 'Bendir', role: 'percussion' },
  { id: 'derbouka', label: 'Derbouka / Tabla', role: 'percussion' },
  { id: 'basse', label: 'Basse fretless', role: 'fondation' },
  { id: 'violon', label: 'Violon', role: 'melodie' },
  { id: 'flute', label: 'Flute gasba', role: 'melodie' },
  { id: 'choeurs', label: 'Choeurs Tamazight', role: 'voix' },
  { id: 'synth', label: 'Pads synthe atmospheriques', role: 'couleurs' },
];

const energyOptions = [
  { id: 'soft', label: 'Douce et intime' },
  { id: 'progressive', label: 'Progression narrative' },
  { id: 'high', label: 'Intense et vibrante' },
];

const defaultForm = {
  title: '',
  artist: '',
  tempo: 92,
  key: 'La mineur',
  mood: 'emotive',
  energy: 'progressive',
  lyrics: '',
  culturalMotifs: 'Izlan traditionnels et melismes kabyles',
  focus: 'Mettre en valeur la voix principale avec reponses instrumentales traditionnelles.',
  instruments: ['mandole', 'bendir', 'basse', 'choeurs'],
};

function splitLyricSections(lyrics) {
  const raw = lyrics
    .split(/\n\s*\n/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
  if (!raw.length) {
    return [];
  }

  const labelled = [];
  let coupletCount = 1;
  let refrainCount = 1;

  raw.forEach((text, index) => {
    const lower = text.toLowerCase();
    if (index === 0) {
      labelled.push({ type: 'intro', title: 'Intro', text });
      return;
    }

    if (lower.includes('refrain') || lower.includes('chorus')) {
      labelled.push({
        type: 'refrain',
        title: `Refrain ${refrainCount}`,
        text,
      });
      refrainCount += 1;
      return;
    }

    if (lower.includes('pont') || lower.includes('bridge')) {
      labelled.push({ type: 'pont', title: 'Pont', text });
      return;
    }

    labelled.push({
      type: 'couplet',
      title: `Couplet ${coupletCount}`,
      text,
    });
    coupletCount += 1;
  });

  if (labelled.length > 1 && labelled[labelled.length - 1].type !== 'outro') {
    labelled[labelled.length - 1] = {
      ...labelled[labelled.length - 1],
      type: 'outro',
      title: 'Outro',
    };
  }

  return labelled;
}

const sectionBlueprints = {
  intro: {
    dynamics: 'pp - installe une ambience suspendue',
    harmony: 'drone pedale sur tonique, tensions 2 et 4',
    groove: 'pulsation libre, motifs de 2 mesures',
  },
  couplet: {
    dynamics: 'mp - energies contenues avec reliefs',
    harmony: 'progression modale sur I - bVII - IV',
    groove: 'motif binaire leger avec inflexions ternaires',
  },
  refrain: {
    dynamics: 'f - ouverture et ampleur vocale',
    harmony: 'accents sur III et V pour souligner la melodie',
    groove: 'bendir plein + derbouka syncopee, claps ponctuels',
  },
  pont: {
    dynamics: 'mf - tension narrative et modulation',
    harmony: 'explore dorien boite de passing modale',
    groove: 'break percussif puis reprise progressive',
  },
  outro: {
    dynamics: 'ppp - respiration finale',
    harmony: 'retour pedale tonique, melismes libres',
    groove: 'elements retires un a un, pulse sur 2e et 4e temps',
  },
};

function orchestrateSection(section, profile, selected, energy) {
  const base = sectionBlueprints[section.type] ?? sectionBlueprints.couplet;
  const featured = selected.slice(0, 3);
  const support = selected.slice(3);
  const density =
    energy === 'high'
      ? 'Strates completes, accentuer doublages et contrechants.'
      : energy === 'soft'
      ? 'Texture epuree, privilegier legato et espaces.'
      : 'Ajouter progressive des couches pour soutenir la narration.';

  return {
    ...section,
    dynamics: base.dynamics,
    instrumentation: {
      focus: featured.length ? featured : ['Voix principale'],
      support: support.length ? support : profile.textureIdeas.slice(0, 2),
    },
    harmony: base.harmony,
    groove: base.groove,
    density,
    production:
      section.type === 'refrain'
        ? 'Doubler les choeurs, leger slapback sur voix principale, accentuer stereo percussions.'
        : section.type === 'intro'
        ? 'Filtre passe-haut progressif, bruitages organiques legers.'
        : section.type === 'outro'
        ? 'Automations de reverb longues, garder drone grave fluide.'
        : 'Panoramique call-response entre voix et instrument lead.',
  };
}

function deriveGroove(profile, tempo, energy) {
  const feels =
    energy === 'high'
      ? 'accent binaire marque avec syncopes inter temps'
      : energy === 'soft'
      ? 'pulse flottante reposee sur 6/8 interne'
      : 'ancrer sur 4/4 en conservant sensation ternaire douce';

  return {
    timeSignature: '4/4 avec appuis ternaires',
    tempoFeel: `${tempo} BPM, ${feels}`,
    percussion: profile.primaryPercussion,
    bass: energy === 'soft' ? 'basse fretless legato en slides' : 'basse pulsee sur 1 et 3 avec variations syncopes',
    syncopes: 'accentuer les contretemps sur la derbouka et caler les claps sur les releves de phrase.',
  };
}

function deriveTransitions(sections, profile) {
  const transitions = [];
  for (let i = 0; i < sections.length - 1; i += 1) {
    const current = sections[i];
    const next = sections[i + 1];
    transitions.push({
      from: current.title,
      to: next.title,
      idea:
        next.type === 'refrain'
          ? 'Monter drone aigu, roulement de bendir et shout collectif avant impact refrain.'
          : next.type === 'pont'
          ? 'Filtre passe-bas, retirer basse puis introduire motif de gasba en suspens.'
          : 'Resoudre cadence sur accord ouvert, laisser respiration deux temps.',
      texture:
        next.type === 'outro'
          ? 'Laisser dernier choeur tenir note longue avec reverb a ressort.'
          : profile.textureIdeas[transitions.length % profile.textureIdeas.length],
    });
  }
  return transitions;
}

function generateArrangement(form) {
  const profile = moodProfiles[form.mood] ?? moodProfiles.emotive;
  const selections = instrumentPalette
    .filter((instrument) => form.instruments.includes(instrument.id))
    .map((instrument) => instrument.label);

  const sections = splitLyricSections(form.lyrics);
  const orchestrated = sections.map((section) =>
    orchestrateSection(section, profile, selections, form.energy),
  );

  const groove = deriveGroove(profile, form.tempo, form.energy);
  const transitions = deriveTransitions(orchestrated, profile);

  return {
    meta: {
      title: form.title || 'Chanson kabyle inedite',
      artist: form.artist || 'Artiste kabyle',
      tempo: `${form.tempo} BPM`,
      key: form.key,
      mood: profile.label,
      energyArc: profile.energyArc.join(' → '),
      tempoHint: profile.tempoHint,
    },
    culturalMotifs: form.culturalMotifs,
    focus: form.focus,
    profile,
    sections: orchestrated,
    groove,
    transitions,
    production: {
      ambiance:
        form.energy === 'soft'
          ? 'Reverbs longues chaudes, compression parallel douce sur voix, air captation ruban.'
          : form.energy === 'high'
          ? 'Bus batterie colle, saturation bande sur percussions, limiter doux sur master.'
          : 'Delais ping-pong discrets, compresseur optique sur voix, etales stereo progressifs.',
      mixFocus: [
        'Mettre la voix principale legerement en avant (1.5 dB)',
        'Donner un espace specifique aux choeurs (large et doux)',
        'Filtrer les percussions sous 80Hz pour laisser respirer la basse',
      ],
      references: [
        'Idir - A vava inouva (textures traditionnelles)',
        'Matoub Lounes - Ay Izem (energie percussive)',
        'Imarhan - Temet (fusion moderne touareg/kabyle)',
      ],
    },
  };
}

export default function Home() {
  const [form, setForm] = useState(defaultForm);
  const [arrangement, setArrangement] = useState(null);

  const sectionPreview = useMemo(() => splitLyricSections(form.lyrics), [form.lyrics]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleInstrumentToggle = (instrument) => {
    setForm((prev) => {
      const exists = prev.instruments.includes(instrument);
      return {
        ...prev,
        instruments: exists
          ? prev.instruments.filter((id) => id !== instrument)
          : [...prev.instruments, instrument],
      };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const proposal = generateArrangement(form);
    setArrangement(proposal);
  };

  const handleDownload = () => {
    if (!arrangement) return;
    const content = JSON.stringify(arrangement, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${arrangement.meta.title.replace(/\s+/g, '-').toLowerCase()}-arrangement.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="layout-grid">
      <header className="header">
        <h1>Arrangeur Kabyle</h1>
        <p>
          Construit une proposition d&apos;arrangement moderne/traditionnel pour ta chanson kabyle.
          Indique les elements clefs, colle les paroles et recupere une feuille de route musicale
          structuree.
        </p>
      </header>

      <section className="card">
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="grid-two">
            <div className="form-group">
              <label htmlFor="title">Titre du morceau</label>
              <input
                id="title"
                name="title"
                placeholder="Abrid n tmazight"
                value={form.title}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="artist">Nom de l&apos;artiste</label>
              <input
                id="artist"
                name="artist"
                placeholder="Nom de l'interprete"
                value={form.artist}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid-two">
            <div className="form-group">
              <label htmlFor="tempo">Tempo (BPM)</label>
              <input
                id="tempo"
                name="tempo"
                type="number"
                min={55}
                max={140}
                value={form.tempo}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="key">Tonalite / Mode</label>
              <input
                id="key"
                name="key"
                placeholder="Ex: La mineur dorien"
                value={form.key}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid-two">
            <div className="form-group">
              <label htmlFor="mood">Couleur principale</label>
              <select id="mood" name="mood" value={form.mood} onChange={handleChange}>
                {Object.entries(moodProfiles).map(([id, profile]) => (
                  <option key={id} value={id}>
                    {profile.label}
                  </option>
                ))}
              </select>
              <p className="helper">
                Indique l&apos;esprit global souhaite. Chaque profil ajuste la dynamique, les
                textures et les transitions.
              </p>
            </div>
            <div className="form-group">
              <label htmlFor="energy">Evolution energetique</label>
              <select id="energy" name="energy" value={form.energy} onChange={handleChange}>
                {energyOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="helper">
                Definis la trajectoire de tension dramatique pour ajuster le degre de densite.
              </p>
            </div>
          </div>

          <div className="form-group">
            <label>Palette instrumentale</label>
            <p className="helper">
              Selectionne les elements indispensables pour retrouver la signature kabyle tout en
              ouvrant a des textures modernes.
            </p>
            <div className="chips">
              {instrumentPalette.map((instrument) => {
                const active = form.instruments.includes(instrument.id);
                return (
                  <button
                    key={instrument.id}
                    type="button"
                    className="chip"
                    style={{
                      background: active ? 'rgba(227, 106, 46, 0.18)' : undefined,
                      border: active ? '1px solid rgba(227, 106, 46, 0.5)' : '1px solid transparent',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleInstrumentToggle(instrument.id)}
                    aria-pressed={active}
                  >
                    {instrument.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="culturalMotifs">Motifs culturels a souligner</label>
            <textarea
              id="culturalMotifs"
              name="culturalMotifs"
              rows={3}
              value={form.culturalMotifs}
              onChange={handleChange}
              placeholder="Ex: patterns rythmiques kabyles en 6/8, youyous, parler-chanter conclusifs"
            />
          </div>

          <div className="form-group">
            <label htmlFor="focus">Intention artistique</label>
            <textarea
              id="focus"
              name="focus"
              rows={3}
              value={form.focus}
              onChange={handleChange}
              placeholder="Objectif narratif ou elements a mettre en avant dans l'arrangement."
            />
          </div>

          <div className="form-group">
            <label htmlFor="lyrics">Paroles / structure</label>
            <textarea
              id="lyrics"
              name="lyrics"
              rows={8}
              value={form.lyrics}
              onChange={handleChange}
              placeholder="Colle les paroles, separe les sections par une ligne vide."
            />
            <p className="helper">
              Chaque bloc separe par une ligne vide sera interprete comme une section musicale
              (intro, couplets, refrains, pont, outro).
            </p>
          </div>

          <button className="submit-button" type="submit">
            Generer l&apos;arrangement
          </button>
        </form>
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0, marginBottom: '1.25rem' }}>Apercu des sections detectees</h2>
        {sectionPreview.length ? (
          <div className="results-grid">
            {sectionPreview.map((section) => (
              <article key={section.title} className="section-card">
                <div className="section-header">
                  <h3 className="section-title">{section.title}</h3>
                  <span className="badge">{section.type.toUpperCase()}</span>
                </div>
                <p style={{ margin: 0, color: 'var(--muted)', whiteSpace: 'pre-line' }}>
                  {section.text.slice(0, 220)}
                  {section.text.length > 220 ? '…' : ''}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="results-empty">
            Ajoute des paroles pour visualiser la structure avant d&apos;orchestrer.
          </div>
        )}
      </section>

      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Feuille d&apos;arrangement</h2>
          {arrangement ? (
            <button className="download-button" type="button" onClick={handleDownload}>
              Telecharger en JSON
            </button>
          ) : null}
        </div>
        {!arrangement ? (
          <div className="results-empty">
            Complete le formulaire puis genere pour obtenir une proposition d&apos;arrangement
            complete.
          </div>
        ) : (
          <div className="layout-grid">
            <div className="meta-grid">
              <div className="meta-row">
                <div className="meta-box">
                  <span className="meta-label">Titre</span>
                  <span className="meta-value">{arrangement.meta.title}</span>
                </div>
                <div className="meta-box">
                  <span className="meta-label">Artiste</span>
                  <span className="meta-value">{arrangement.meta.artist}</span>
                </div>
                <div className="meta-box">
                  <span className="meta-label">Tempo</span>
                  <span className="meta-value">
                    {arrangement.meta.tempo} · {arrangement.meta.tempoHint}
                  </span>
                </div>
              </div>
              <div className="meta-row">
                <div className="meta-box">
                  <span className="meta-label">Tonalite</span>
                  <span className="meta-value">{arrangement.meta.key}</span>
                </div>
                <div className="meta-box">
                  <span className="meta-label">Humeur</span>
                  <span className="meta-value">{arrangement.meta.mood}</span>
                </div>
                <div className="meta-box">
                  <span className="meta-label">Arc energetique</span>
                  <span className="meta-value">{arrangement.meta.energyArc}</span>
                </div>
              </div>
            </div>

            <div className="notes">
              <strong>Intention artistique</strong>
              <p style={{ margin: 0 }}>{arrangement.focus}</p>
            </div>

            <div className="notes">
              <strong>Motifs culturels</strong>
              <p style={{ margin: 0 }}>{arrangement.culturalMotifs}</p>
            </div>

            <div className="results-grid">
              {arrangement.sections.map((section) => (
                <article key={section.title} className="section-card">
                  <div className="section-header">
                    <h3 className="section-title">{section.title}</h3>
                    <span className="badge">{section.type.toUpperCase()}</span>
                  </div>
                  <div className="micro-grid">
                    <div>
                      <strong>Dynamics</strong>
                      <p style={{ margin: 0 }}>{section.dynamics}</p>
                    </div>
                    <div>
                      <strong>Instrumentation focus</strong>
                      <ul className="list">
                        {section.instrumentation.focus.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Supports</strong>
                      <ul className="list">
                        {section.instrumentation.support.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Harmonie</strong>
                      <p style={{ margin: 0 }}>{section.harmony}</p>
                    </div>
                    <div>
                      <strong>Groove</strong>
                      <p style={{ margin: 0 }}>{section.groove}</p>
                    </div>
                    <div>
                      <strong>Densite</strong>
                      <p style={{ margin: 0 }}>{section.density}</p>
                    </div>
                    <div>
                      <strong>Note production</strong>
                      <p style={{ margin: 0 }}>{section.production}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="section-card">
              <div className="section-header">
                <h3 className="section-title">Groove et fondations</h3>
                <span className="badge">RYTHME</span>
              </div>
              <div className="micro-grid">
                <div>
                  <strong>Signature</strong>
                  <p style={{ margin: 0 }}>{arrangement.groove.timeSignature}</p>
                </div>
                <div>
                  <strong>Sensation tempo</strong>
                  <p style={{ margin: 0 }}>{arrangement.groove.tempoFeel}</p>
                </div>
                <div>
                  <strong>Percussions</strong>
                  <ul className="list">
                    {arrangement.groove.percussion.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Approche basse</strong>
                  <p style={{ margin: 0 }}>{arrangement.groove.bass}</p>
                </div>
                <div>
                  <strong>Syncopes</strong>
                  <p style={{ margin: 0 }}>{arrangement.groove.syncopes}</p>
                </div>
              </div>
            </div>

            <div className="section-card">
              <div className="section-header">
                <h3 className="section-title">Transitions</h3>
                <span className="badge">FLUX</span>
              </div>
              <div className="results-grid">
                {arrangement.transitions.map((transition, index) => (
                  <div key={`${transition.from}-${transition.to}-${index}`} className="notes">
                    <strong>{transition.from} → {transition.to}</strong>
                    <p style={{ margin: 0 }}>{transition.idea}</p>
                    <p style={{ margin: 0, color: 'var(--muted)' }}>
                      Texture: {transition.texture}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-card">
              <div className="section-header">
                <h3 className="section-title">Production et mixage</h3>
                <span className="badge">STUDIO</span>
              </div>
              <div className="micro-grid">
                <div>
                  <strong>Ambiance</strong>
                  <p style={{ margin: 0 }}>{arrangement.production.ambiance}</p>
                </div>
                <div>
                  <strong>Points focaux</strong>
                  <ul className="list">
                    {arrangement.production.mixFocus.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Ecoutes de reference</strong>
                  <ul className="list">
                    {arrangement.production.references.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
