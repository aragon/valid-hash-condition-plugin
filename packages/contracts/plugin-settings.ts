import buildMetadata from './src/build-metadata.json';
import releaseMetadata from './src/release-metadata.json';

export const PLUGIN_REPO_ENS_NAME = 'condition-1';
export const PLUGIN_CONTRACT_NAME = 'ValidHashCondition';
export const PLUGIN_SETUP_CONTRACT_NAME = 'ValidHashConditionSetup';

export const VERSION = {
  release: 1, // Increment this number ONLY if breaking/incompatible changes were made. Updates between releases are NOT possible.
  build: 1, // Increment this number if non-breaking/compatible changes were made. Updates to newer builds are possible.
};

export const METADATA = {
  build: buildMetadata,
  release: releaseMetadata,
};
