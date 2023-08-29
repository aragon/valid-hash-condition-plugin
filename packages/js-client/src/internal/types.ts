import { ContextState, OverriddenState } from '@aragon/sdk-client-common';

export type SubgraphNumberListItem = {
  id: string;
  subdomain: string;
  number: {
    value: string;
  };
};

export type SubgraphNumber = {
  number: {
    value: string;
  };
};

export type ValidHashConditionContextState = ContextState & {
  // extend the Context state with a new state for storing
  // the new parameters
  ValidHashConditionPluginAddress: string;
  ValidHashConditionRepoAddress: string;
};

export type ValidHashConditionOverriddenState = OverriddenState & {
  [key in keyof ValidHashConditionContextState]: boolean;
};
