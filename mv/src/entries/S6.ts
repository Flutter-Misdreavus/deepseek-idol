// Bundles only S6 (other shots are placeholders), so a broken file elsewhere cannot break this section's renders.
import { registerRoot } from 'remotion';
import { Root } from '../Root';
import { S6_SCENES } from '../scenes/S6';
import { registerScenes } from '../scenes/registry';

registerScenes(S6_SCENES);
registerRoot(Root);
