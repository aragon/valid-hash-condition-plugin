import {METADATA} from '../../plugin-settings';
import {
  PluginRepo,
  ValidHashCondition,
  ValidHashConditionSetup,
  ValidHashConditionSetup__factory,
  ValidHashCondition__factory,
  DAO,
  PluginRepo__factory,
  PluginSetupProcessor,
  PluginSetupProcessor__factory,
} from '../../typechain';
import {PluginSetupRefStruct} from '../../typechain/@aragon/osx/framework/dao/DAOFactory';
import {getPluginInfo, osxContracts} from '../../utils/helpers';
import {initializeFork} from '../helpers/fixture';
import {installPLugin, uninstallPLugin} from '../helpers/setup';
import {deployTestDao} from '../helpers/test-dao';
import {getNamedTypesFromMetadata} from '../helpers/types';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import {expect} from 'chai';
import {BigNumber} from 'ethers';
import {ethers} from 'hardhat';

// TODO requires     "@aragon/osx": to be at the latest version on goerli
describe.skip('PluginSetup Processing', function () {
  let alice: SignerWithAddress;

  let psp: PluginSetupProcessor;
  let dao: DAO;
  let pluginRepo: PluginRepo;

  before(async () => {
    [alice] = await ethers.getSigners();

    const hardhatForkNetwork = 'goerli';

    await initializeFork(
      hardhatForkNetwork,
      getPluginInfo(hardhatForkNetwork)[hardhatForkNetwork]['releases']['1'][
        'builds'
      ]['1']['blockNumberOfPublication']
    );

    console.log(osxContracts[hardhatForkNetwork]['PluginSetupProcessor']);

    // PSP
    psp = PluginSetupProcessor__factory.connect(
      osxContracts[hardhatForkNetwork]['PluginSetupProcessor'],
      alice
    );
    console.log(psp);

    // Deploy DAO.
    dao = await deployTestDao(alice);

    await dao.grant(
      dao.address,
      psp.address,
      ethers.utils.id('ROOT_PERMISSION')
    );
    await dao.grant(
      psp.address,
      alice.address,
      ethers.utils.id('APPLY_INSTALLATION_PERMISSION')
    );
    await dao.grant(
      psp.address,
      alice.address,
      ethers.utils.id('APPLY_UNINSTALLATION_PERMISSION')
    );
    await dao.grant(
      psp.address,
      alice.address,
      ethers.utils.id('APPLY_UPDATE_PERMISSION')
    );

    pluginRepo = PluginRepo__factory.connect(
      getPluginInfo(hardhatForkNetwork)[hardhatForkNetwork].address,
      alice
    );
  });

  context('Build 1', async () => {
    let setup: ValidHashConditionSetup;
    let pluginSetupRef: PluginSetupRefStruct;
    let plugin: ValidHashCondition;

    before(async () => {
      // Deploy setups.
      setup = ValidHashConditionSetup__factory.connect(
        (await pluginRepo['getLatestVersion(uint8)'](1)).pluginSetup,
        alice
      );

      pluginSetupRef = {
        versionTag: {
          release: BigNumber.from(1),
          build: BigNumber.from(1),
        },
        pluginSetupRepo: pluginRepo.address,
      };
    });

    beforeEach(async () => {
      // Install build 1.

      const results = await installPLugin(
        psp,
        dao,
        pluginSetupRef,
        ethers.utils.defaultAbiCoder.encode(
          getNamedTypesFromMetadata(
            METADATA.build.pluginSetup.prepareInstallation.inputs
          ),
          []
        )
      );

      plugin = ValidHashCondition__factory.connect(
        results.preparedEvent.args.plugin,
        alice
      );
    });

    it('installs & uninstalls', async () => {
      // Check implementation.
      expect(await plugin.implementation()).to.be.eq(
        await setup.implementation()
      );

      // Uninstall build 1.
      await uninstallPLugin(
        psp,
        dao,
        plugin,
        pluginSetupRef,
        ethers.utils.defaultAbiCoder.encode(
          getNamedTypesFromMetadata(
            METADATA.build.pluginSetup.prepareUninstallation.inputs
          ),
          []
        ),
        []
      );
    });
  });
});
