import { ValidHashConditionClientCore } from '../core';
import { IValidHashConditionClientEncoding } from '../interfaces';
import { DaoAction } from '@aragon/sdk-client-common';
import { hexToBytes } from '@aragon/sdk-common';
import { ValidHashCondition__factory } from '@aragon/simple-storage-ethers';

export class ValidHashConditionClientEncoding
  extends ValidHashConditionClientCore
  implements IValidHashConditionClientEncoding
{
  // implementation of the methods in the interface
  public storeNumberAction(number: bigint): DaoAction {
    const iface = ValidHashCondition__factory.createInterface();
    const data = iface.encodeFunctionData('storeNumber', [number]);
    return {
      to: this.ValidHashConditionPluginAddress,
      value: BigInt(0),
      data: hexToBytes(data),
    };
  }
}
