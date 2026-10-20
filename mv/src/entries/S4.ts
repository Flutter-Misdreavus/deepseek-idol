// Bundles only S4 (other shots are placeholders), so a broken file elsewhere cannot break this section's renders.
import { registerRoot } from 'remotion';
import { Root } from '../Root';
import { S4_SCENES } from '../scenes/S4';
import { registerScenes } from '../scenes/registry';

registerScenes(S4_SCENES);
registerRoot(Root);
