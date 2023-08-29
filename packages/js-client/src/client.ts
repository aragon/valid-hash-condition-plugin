import { ValidHashConditionContext } from './context';
import {
  IValidHashConditionClient,
  IValidHashConditionClientDecoding,
  IValidHashConditionClientEncoding,
  IValidHashConditionClientEstimation,
  IValidHashConditionClientMethods,
  SimpleStoragClientEstimation,
  ValidHashConditionClientDecoding,
  ValidHashConditionClientEncoding,
  ValidHashConditionClientMethods,
} from './internal';
import { ValidHashConditionClientCore } from './internal/core';

export class ValidHashConditionClient
  extends ValidHashConditionClientCore
  implements IValidHashConditionClient
{
  public methods: IValidHashConditionClientMethods;
  public estimation: IValidHashConditionClientEstimation;
  public encoding: IValidHashConditionClientEncoding;
  public decoding: IValidHashConditionClientDecoding;

  constructor(pluginContext: ValidHashConditionContext) {
    super(pluginContext);
    this.methods = new ValidHashConditionClientMethods(pluginContext);
    this.estimation = new SimpleStoragClientEstimation(pluginContext);
    this.encoding = new ValidHashConditionClientEncoding(pluginContext);
    this.decoding = new ValidHashConditionClientDecoding(pluginContext);
  }
}
