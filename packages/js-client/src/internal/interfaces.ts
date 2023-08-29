import {
  NumberListItem,
  NumbersQueryParams,
  PrepareInstallationParams,
} from '../types';
import {
  DaoAction,
  GasFeeEstimation,
  PrepareInstallationStepValue,
} from '@aragon/sdk-client-common';

export interface IValidHashConditionClient {
  methods: IValidHashConditionClientMethods;
  estimation: IValidHashConditionClientEstimation;
  encoding: IValidHashConditionClientEncoding;
  decoding: IValidHashConditionClientDecoding;
}

export interface IValidHashConditionClientMethods {
  // fill with methods
  prepareInstallation(
    params: PrepareInstallationParams
  ): AsyncGenerator<PrepareInstallationStepValue>;
  getNumber(daoAddressOrEns: string): Promise<bigint>;
  getNumbers(params: NumbersQueryParams): Promise<NumberListItem[]>;
}
export interface IValidHashConditionClientEstimation {
  prepareInstallation(
    params: PrepareInstallationParams
  ): Promise<GasFeeEstimation>;
}
export interface IValidHashConditionClientEncoding {
  storeNumberAction(number: bigint): DaoAction;
}
export interface IValidHashConditionClientDecoding {
  storeNumberAction(data: Uint8Array): bigint;
}
