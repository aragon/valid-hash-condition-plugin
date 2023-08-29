import {PLUGIN_CONTRACT_NAME} from '../../plugin-settings';
import {
  DAO,
  IERC165__factory,
  IPermissionCondition__factory,
  IPlugin__factory,
  IProtocolVersion__factory,
  ValidHashCondition,
  ValidHashCondition__factory,
} from '../../typechain';
import '../../typechain/src/ValidHashCondition';
import {deployWithProxy} from '../../utils/helpers';
import {getInterfaceId} from '../helpers/interface';
import {deployTestDao} from '../helpers/test-dao';
import {
  VALIDATE_SIGNATURE_PERMISSION_ID,
  SET_HASH_PERMISSION_ID,
} from './valid-hash-condition-common';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import {expect} from 'chai';
import {ethers} from 'hardhat';

describe(PLUGIN_CONTRACT_NAME, function () {
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let dao: DAO;
  let condition: ValidHashCondition;

  before(async () => {
    [alice, bob] = await ethers.getSigners();
    dao = await deployTestDao(alice);
  });

  beforeEach(async () => {
    condition = await deployWithProxy<ValidHashCondition>(
      new ValidHashCondition__factory(alice)
    );

    await condition.initialize(dao.address);
  });

  describe('initialize', async () => {
    it('reverts if trying to re-initialize', async () => {
      await expect(condition.initialize(dao.address)).to.be.revertedWith(
        'Initializable: contract is already initialized'
      );
    });
  });

  describe('ERC-165', async () => {
    it('does not support the empty interface', async () => {
      expect(await condition.supportsInterface('0xffffffff')).to.be.false;
    });

    it('supports the `IERC165` interface', async () => {
      const iface = IERC165__factory.createInterface();
      expect(await condition.supportsInterface(getInterfaceId(iface))).to.be
        .true;
    });

    it('supports the `IProtocolVersion` interface', async () => {
      const iface = IProtocolVersion__factory.createInterface();
      // Will pass once PRs have been merged
      expect(await condition.supportsInterface(getInterfaceId(iface))).to.be
        .true;
    });

    it('supports the `IPermissionCondition` interface', async () => {
      const iface = IPermissionCondition__factory.createInterface();
      expect(await condition.supportsInterface(getInterfaceId(iface))).to.be
        .true;
    });

    it('supports the `IPlugin` interface', async () => {
      const iface = IPlugin__factory.createInterface();
      expect(await condition.supportsInterface(getInterfaceId(iface))).to.be
        .true;
    });
  });

  describe('validateHash', async () => {
    const hash = ethers.utils.hashMessage('Hi!');

    beforeEach(async () => {
      await dao.grant(condition.address, alice.address, SET_HASH_PERMISSION_ID);
    });

    it('reverts if sender lacks permission', async () => {
      await expect(condition.connect(bob).validateHash(hash))
        .to.be.revertedWithCustomError(condition, 'DaoUnauthorized')
        .withArgs(
          dao.address,
          condition.address,
          bob.address,
          SET_HASH_PERMISSION_ID
        );
    });

    it('validates hashes', async () => {
      await expect(condition.validateHash(hash)).to.not.be.reverted;
    });

    it('reverts if a hash is already valid', async () => {
      await expect(condition.validateHash(hash)).to.not.be.reverted;
      await expect(condition.validateHash(hash))
        .to.be.revertedWithCustomError(condition, 'ValueAlreadySet')
        .withArgs(hash, true);
    });

    it('emits the HashValidated event', async () => {
      await expect(condition.validateHash(hash))
        .to.emit(condition, 'HashValidated')
        .withArgs(hash);
    });
  });

  describe('invalidateHash', async () => {
    const hash = ethers.utils.hashMessage('Hi!');

    beforeEach(async () => {
      await dao.grant(condition.address, alice.address, SET_HASH_PERMISSION_ID);
    });

    it('reverts if sender lacks permission', async () => {
      await expect(condition.connect(bob).invalidateHash(hash))
        .to.be.revertedWithCustomError(condition, 'DaoUnauthorized')
        .withArgs(
          dao.address,
          condition.address,
          bob.address,
          SET_HASH_PERMISSION_ID
        );
    });

    it('invalidates hashes', async () => {
      await condition.validateHash(hash);
      await expect(condition.invalidateHash(hash)).to.not.be.reverted;
    });

    it('reverts if a hash is already valid', async () => {
      await expect(condition.invalidateHash(hash))
        .to.be.revertedWithCustomError(condition, 'ValueAlreadySet')
        .withArgs(hash, false);
    });

    it('emits the HashValidated event', async () => {
      await condition.validateHash(hash);
      await expect(condition.invalidateHash(hash))
        .to.emit(condition, 'HashInvalidated')
        .withArgs(hash);
    });
  });

  describe('isValid', async () => {
    const hash = ethers.utils.hashMessage('Hi!');

    beforeEach(async () => {
      await dao.grant(condition.address, alice.address, SET_HASH_PERMISSION_ID);
    });

    it('returns true if the hash is validated', async () => {
      await expect(condition.validateHash(hash)).to.not.be.reverted;
      expect(await condition.isValid(hash)).to.be.true;
    });

    it('returns false if the hash is not validated', async () => {
      expect(await condition.isValid(hash)).to.be.false;
    });
  });
});
