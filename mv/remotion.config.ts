import { Config } from '@remotion/cli/config';

// Google's download hosts are unreachable here; use the locally cached headless shell.
Config.setBrowserExecutable(
  `${process.env.HOME}/.cache/puppeteer/chrome-headless-shell/mac_arm-155.0.8059.39/chrome-headless-shell-mac-arm64/chrome-headless-shell`,
);
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setChromiumOpenGlRenderer('angle');
