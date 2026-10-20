// Bundles only S3 (other shots are placeholders), so a broken file elsewhere cannot break this section's renders.
import { registerRoot } from 'remotion';
import { Root } from '../Root';
import { S3_SCENES } from '../scenes/S3';
import { registerScenes } from '../scenes/registry';

registerScenes(S3_SCENES);
registerRoot(Root);
