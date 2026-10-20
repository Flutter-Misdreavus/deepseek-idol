// Finished scenes by shot id. Each entry point (src/index.ts = whole MV, src/entries/Sx.ts = one section)
// registers the section modules it bundles; shots without a scene play as grey-box placeholders.
export const SCENES: Record<string, React.FC> = {};

export const registerScenes = (...maps: Record<string, React.FC>[]) => {
  for (const m of maps) Object.assign(SCENES, m);
};
