import { Config } from "@remotion/cli/config";

// Pakai Chromium yang sedia ada dalam container (elak muat turun).
const localShell =
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
if (require("fs").existsSync(localShell)) {
  Config.setBrowserExecutable(localShell);
}
Config.setVideoImageFormat("jpeg");
Config.setConcurrency(4);
