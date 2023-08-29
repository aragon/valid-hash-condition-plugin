import { ValidHashConditionClientCore } from '../core';
import { IValidHashConditionClientDecoding } from '../interfaces';
import { ValidHashCondition__factory } from '@aragon/simple-storage-ethers';

export class ValidHashConditionClientDecoding
  extends ValidHashConditionClientCore
  implements IValidHashConditionClientDecoding
{
  public storeNumberAction(data: Uint8Array): bigint {
    const iface = ValidHashCondition__factory.createInterface();
    const res = iface.decodeFunctionData('storeNumber', data);
    return BigInt(res[0]);
  }
}
