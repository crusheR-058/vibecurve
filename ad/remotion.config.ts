import { Config } from "@remotion/cli/config";

// H.264 MP4 at high quality — the default for a SaaS landing / YouTube ad.
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer("angle");
