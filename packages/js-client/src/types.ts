import {
  ContextParams,
  Pagination,
  VersionTag,
} from '@aragon/sdk-client-common';

export type ValidHashConditionContextParams = ContextParams & {
  // optional so we can set default values for the parameter
  ValidHashConditionPluginAddress?: string;
  ValidHashConditionRepoAddress?: string;
  // add custom params
};

export type PrepareInstallationParams = {
  daoAddressOrEns: string;
  version?: VersionTag;
  settings: {
    number: bigint;
  };
};

export type NumbersQueryParams = Pagination & {
  sortBy?: NumbersSortBy;
  daoAddressOrEns?: string;
};

export enum NumbersSortBy {
  NUMBER = 'number',
  CREATED_AT = 'createdAt',
}

export type NumberListItem = {
  id: string;
  subdomain: string;
  value: bigint;
};
