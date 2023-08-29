import {PLUGIN_SETUP_CONTRACT_NAME} from '../../plugin-settings';
import buildMetadata from '../../src/build-metadata.json';
import {
  DAO,
  ValidHashConditionSetup,
  ValidHashConditionSetup__factory,
  ValidHashCondition__factory,
} from '../../typechain';
import {deployTestDao} from '../helpers/test-dao';
import {Operation, getNamedTypesFromMetadata} from '../helpers/types';
import {
  ADDRESS_ZERO,
  ANY_ADDR,
  EMPTY_DATA,
  NO_CONDITION,
  SET_HASH_PERMISSION_ID,
  VALIDATE_SIGNATURE_PERMISSION_ID,
  abiCoder,
} from './valid-hash-condition-common';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import {expect} from 'chai';
import {ethers} from 'hardhat';

export type MultiTargetPermission = {
  operation: Operation | undefined;
  where: string | undefined;
  who: string | undefined;
  condition: string | undefined;
  permissionId: string | undefined;
};

describe(PLUGIN_SETUP_CONTRACT_NAME, function () {
  let alice: SignerWithAddress;
  let validHashConditionSetup: ValidHashConditionSetup;
  let dao: DAO;
  let perm1: MultiTargetPermission;
  let perm2: MultiTargetPermission;

  before(async () => {
    [alice] = await ethers.getSigners();
    dao = await deployTestDao(alice);

    validHashConditionSetup = await new ValidHashConditionSetup__factory(
      alice
    ).deploy();

    perm1 = {
      operation: undefined,
      where: dao.address,
      who: ANY_ADDR,
      condition: undefined,
      permissionId: VALIDATE_SIGNATURE_PERMISSION_ID,
    };

    perm2 = {
      operation: undefined,
      where: undefined,
      who: dao.address,
      condition: NO_CONDITION,
      permissionId: SET_HASH_PERMISSION_ID,
    };
  });

  describe('prepareInstallation', async () => {
    let initData: string;

    before(async () => {
      initData = abiCoder.encode(
        getNamedTypesFromMetadata(
          buildMetadata.pluginSetup.prepareInstallation.inputs
        ),
        []
      );
    });

    it('returns the plugin, helpers, and permissions', async () => {
      const nonce = await ethers.provider.getTransactionCount(
        validHashConditionSetup.address
      );
      const anticipatedPluginAddress = ethers.utils.getContractAddress({
        from: validHashConditionSetup.address,
        nonce,
      });

      const {
        plugin,
        preparedSetupData: {helpers, permissions},
      } = await validHashConditionSetup.callStatic.prepareInstallation(
        dao.address,
        initData
      );

      expect(plugin).to.equal(anticipatedPluginAddress);
      expect(helpers.length).to.equal(0);
      expect(permissions.length).to.equal(2);

      perm1.operation = Operation.Grant;
      perm1.condition = plugin;

      perm2.operation = Operation.Grant;
      perm2.where = plugin;

      expect(permissions).to.deep.equal([
        Object.values(perm1),
        Object.values(perm2),
      ]);

      await validHashConditionSetup.prepareInstallation(dao.address, initData);
      const ValidHashCondition = new ValidHashCondition__factory(alice).attach(
        plugin
      );

      // initialization is correct
      expect(await ValidHashCondition.dao()).to.equal(dao.address);
    });
  });

  describe('prepareUninstallation', async () => {
    it('returns the permissions', async () => {
      const pluginDummyAddr = ADDRESS_ZERO;

      const permissions =
        await validHashConditionSetup.callStatic.prepareUninstallation(
          dao.address,
          {
            plugin: pluginDummyAddr,
            currentHelpers: [],
            data: EMPTY_DATA,
          }
        );

      perm1.operation = Operation.Revoke;
      perm1.condition = pluginDummyAddr;

      perm2.operation = Operation.Revoke;
      perm2.where = pluginDummyAddr;

      expect(permissions).to.deep.equal([
        Object.values(perm1),
        Object.values(perm2),
      ]);

      expect(permissions.length).to.equal(2);
      expect(permissions).to.deep.equal([
        Object.values(perm1),
        Object.values(perm2),
      ]);
    });
  });
});
