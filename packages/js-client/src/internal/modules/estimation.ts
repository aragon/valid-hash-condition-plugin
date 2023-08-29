import * as BUILD_METADATA from '../../../../contracts/src/build-metadata.json';
import { PrepareInstallationParams } from '../../types';
import { ValidHashConditionClientCore } from '../core';
import { IValidHashConditionClientEstimation } from '../interfaces';
import { PluginRepo__factory } from '@aragon/osx-ethers';
import {
  GasFeeEstimation,
  prepareGenericInstallationEstimation,
} from '@aragon/sdk-client-common';
import { ValidHashCondition__factory } from '@aragon/simple-storage-ethers';

export class SimpleStoragClientEstimation
  extends ValidHashConditionClientCore
  implements IValidHashConditionClientEstimation
{
  public async prepareInstallation(
    params: PrepareInstallationParams
  ): Promise<GasFeeEstimation> {
    let version = params.version;
    // if not specified use the lates version
    if (!version) {
      // get signer
      const signer = this.web3.getConnectedSigner();
      // connect to the plugin repo
      const pluginRepo = PluginRepo__factory.connect(
        this.ValidHashConditionRepoAddress,
        signer
      );
      // get latest release
      const currentRelease = await pluginRepo.latestRelease();
      // get latest version
      const latestVersion = await pluginRepo['getLatestVersion(uint8)'](
        currentRelease
      );
      version = latestVersion.tag;
    }

    return prepareGenericInstallationEstimation(this.web3, {
      daoAddressOrEns: params.daoAddressOrEns,
      pluginRepo: this.ValidHashConditionRepoAddress,
      version,
      installationAbi: BUILD_METADATA.pluginSetup.prepareInstallation.inputs,
      installationParams: [params.settings.number],
    });
  }

  public async storeNumber(number: bigint): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    const ValidHashCondition = ValidHashCondition__factory.connect(
      this.ValidHashConditionPluginAddress,
      signer
    );
    const estimation = await ValidHashCondition.estimateGas.storeNumber(number);
    return this.web3.getApproximateGasFee(estimation.toBigInt());
  }
}
