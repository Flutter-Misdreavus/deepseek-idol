import { registerRoot } from 'remotion';
import { Root } from './Root';
import { registerScenes } from './scenes/registry';
import { S0_SCENES } from './scenes/S0';
import { S1_SCENES } from './scenes/S1';
import { S2_SCENES } from './scenes/S2';
import { S3_SCENES } from './scenes/S3';
import { S4_SCENES } from './scenes/S4';
import { S5_SCENES } from './scenes/S5';
import { S6_SCENES } from './scenes/S6';
import { S7_SCENES } from './scenes/S7';
import { S8_SCENES } from './scenes/S8';
import { S9_SCENES } from './scenes/S9';

registerScenes(S0_SCENES, S1_SCENES, S2_SCENES, S3_SCENES, S4_SCENES, S5_SCENES, S6_SCENES, S7_SCENES, S8_SCENES, S9_SCENES);
registerRoot(Root);
