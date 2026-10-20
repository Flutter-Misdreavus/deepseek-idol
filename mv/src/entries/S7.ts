// Bundles only S7 (other shots are placeholders), so a broken file elsewhere cannot break this section's renders.
import { registerRoot } from 'remotion';
import { Root } from '../Root';
import { S7_SCENES } from '../scenes/S7';
import { registerScenes } from '../scenes/registry';

registerScenes(S7_SCENES);
registerRoot(Root);
