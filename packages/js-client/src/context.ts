import {
  ValidHashConditionContextState,
  ValidHashConditionOverriddenState,
} from './internal/types';
import { ValidHashConditionContextParams } from './types';
import { Context, ContextCore } from '@aragon/sdk-client-common';

// set your defaults here or import them from a package
const DEFAULT_SIMPLE_STORAGE_PLUGIN_ADDRESS =
  '0x1234567890123456789012345678901234567890';
const DEFAULT_SIMPLE_STORAGE_Repo_ADDRESS =
  '0x2345678901234567890123456789012345678901';

export class ValidHashConditionContext extends ContextCore {
  // super is called before the properties are initialized
  // so we initialize them to the value of the parent class
  protected state: ValidHashConditionContextState = this.state;
  // TODO
  // fix typo in the overridden property name
  protected overriden: ValidHashConditionOverriddenState = this.overriden;
  constructor(
    contextParams?: Partial<ValidHashConditionContextParams>,
    aragonContext?: Context
  ) {
    // call the parent constructor
    // so it does not complain and we
    // can use this
    super();
    // set the context params inherited from the context
    if (aragonContext) {
      // copy the context properties to this
      Object.assign(this, aragonContext);
    }
    // contextParams have priority over the aragonContext
    if (contextParams) {
      // overide the context params with the ones passed to the constructor
      this.set(contextParams);
    }
  }

  public set(contextParams: ValidHashConditionContextParams) {
    // the super function will call this set
    // so we need to call the parent set first
    super.set(contextParams);
    // set the default values for the new params
    this.setDefaults();
    // override default params if specified in the context
    if (contextParams.ValidHashConditionPluginAddress) {
      // override the ValidHashConditionPluginAddress value
      this.state.ValidHashConditionPluginAddress = contextParams.ValidHashConditionPluginAddress;
      // set the overriden flag to true in case set is called again
      this.overriden.ValidHashConditionPluginAddress = true;
    }

    if (contextParams.ValidHashConditionRepoAddress) {
      this.state.ValidHashConditionRepoAddress = contextParams.ValidHashConditionRepoAddress;
      this.overriden.ValidHashConditionRepoAddress = true;
    }
  }

  private setDefaults() {
    if (!this.overriden.ValidHashConditionPluginAddress) {
      // set the default value for ValidHashConditionPluginAddress
      this.state.ValidHashConditionPluginAddress = DEFAULT_SIMPLE_STORAGE_PLUGIN_ADDRESS;
    }
    if (!this.overriden.ValidHashConditionPluginAddress) {
      this.state.ValidHashConditionPluginAddress = DEFAULT_SIMPLE_STORAGE_Repo_ADDRESS;
    }
  }

  get ValidHashConditionPluginAddress(): string {
    return this.state.ValidHashConditionPluginAddress;
  }

  get ValidHashConditionRepoAddress(): string {
    return this.state.ValidHashConditionRepoAddress;
  }
}
