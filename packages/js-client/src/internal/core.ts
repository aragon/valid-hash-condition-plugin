import { ValidHashConditionContext } from '../context';
import { ClientCore } from '@aragon/sdk-client-common';

export class ValidHashConditionClientCore extends ClientCore {
  public ValidHashConditionPluginAddress: string;
  public ValidHashConditionRepoAddress: string;

  constructor(pluginContext: ValidHashConditionContext) {
    super(pluginContext);
    this.ValidHashConditionPluginAddress = pluginContext.ValidHashConditionPluginAddress;
    this.ValidHashConditionRepoAddress = pluginContext.ValidHashConditionRepoAddress;
  }
}
