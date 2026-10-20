// Bundles only S2 (other shots are placeholders), so a broken file elsewhere cannot break this section's renders.
import { registerRoot } from 'remotion';
import { Root } from '../Root';
import { S2_SCENES } from '../scenes/S2';
import { registerScenes } from '../scenes/registry';

registerScenes(S2_SCENES);
registerRoot(Root);
