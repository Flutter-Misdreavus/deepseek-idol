// Bundles only S8 (other shots are placeholders), so a broken file elsewhere cannot break this section's renders.
import { registerRoot } from 'remotion';
import { Root } from '../Root';
import { S8_SCENES } from '../scenes/S8';
import { registerScenes } from '../scenes/registry';

registerScenes(S8_SCENES);
registerRoot(Root);
