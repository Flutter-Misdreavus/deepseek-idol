// Bundles only S0 (other shots are placeholders), so a broken file elsewhere cannot break this section's renders.
import { registerRoot } from 'remotion';
import { Root } from '../Root';
import { S0_SCENES } from '../scenes/S0';
import { registerScenes } from '../scenes/registry';

registerScenes(S0_SCENES);
registerRoot(Root);
