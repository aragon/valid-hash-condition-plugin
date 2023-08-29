// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity 0.8.17;

import {EnumerableSetUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";

import {IDAO} from "@aragon/osx/packages/contracts/src/core/dao/IDAO.sol"; //"@aragon/osx/core/dao/IDAO.sol";
import {PermissionLib} from "@aragon/osx/packages/contracts/src/core/permission/PermissionLib.sol"; //"@aragon/osx/core/permission/PermissionLib.sol";
import {PluginSetup, IPluginSetup} from "@aragon/osx/packages/contracts/src/framework/plugin/setup/PluginSetup.sol"; //"@aragon/osx/framework/plugin/setup/PluginSetup.sol";
import {ValidHashCondition} from "./ValidHashCondition.sol";

/// @title ValidHashConditionSetup - Release 1, Build 1
/// @author Aragon Association - 2023
/// @notice The setup contract of the `AllowedSignerCondition` plugin.
contract ValidHashConditionSetup is PluginSetup {
    using EnumerableSetUpgradeable for address;

    /// @notice A special address encoding permissions that are valid for any address `who` or `where`.
    address internal constant ANY_ADDR = address(type(uint160).max);

    /// @notice The address of the `AllowedSignerCondition` plugin logic contract to be used for creating proxy contracts.
    ValidHashCondition private immutable base;

    /// @notice The contract constructor, that deploys the `ValidHashCondition` plugin logic contract.
    constructor() {
        base = new ValidHashCondition();
    }

    /// @inheritdoc IPluginSetup
    function prepareInstallation(
        address _dao,
        bytes calldata _data
    ) external returns (address plugin, PreparedSetupData memory preparedSetupData) {
        (_data);

        // Prepare and Deploy the plugin proxy.
        plugin = createERC1967Proxy(
            address(base),
            abi.encodeCall(ValidHashCondition.initialize, (IDAO(_dao)))
        );

        // Prepare permissions
        PermissionLib.MultiTargetPermission[]
            memory permissions = new PermissionLib.MultiTargetPermission[](2);

        // Set permissions to be granted.
        permissions[0] = PermissionLib.MultiTargetPermission({
            operation: PermissionLib.Operation.Grant,
            where: _dao,
            who: ANY_ADDR,
            condition: plugin,
            permissionId: base.VALIDATE_SIGNATURE_PERMISSION_ID()
        });

        permissions[1] = PermissionLib.MultiTargetPermission({
            operation: PermissionLib.Operation.Grant,
            where: plugin,
            who: _dao,
            condition: PermissionLib.NO_CONDITION,
            permissionId: base.SET_HASH_PERMISSION_ID()
        });

        preparedSetupData.permissions = permissions;
    }

    /// @inheritdoc IPluginSetup
    function prepareUninstallation(
        address _dao,
        SetupPayload calldata _payload
    ) external view returns (PermissionLib.MultiTargetPermission[] memory permissions) {
        // Prepare permissions
        permissions = new PermissionLib.MultiTargetPermission[](2);

        // Set permissions to be granted.
        permissions[0] = PermissionLib.MultiTargetPermission({
            operation: PermissionLib.Operation.Revoke,
            where: _dao,
            who: ANY_ADDR,
            condition: _payload.plugin,
            permissionId: base.VALIDATE_SIGNATURE_PERMISSION_ID()
        });

        permissions[1] = PermissionLib.MultiTargetPermission({
            operation: PermissionLib.Operation.Revoke,
            where: _payload.plugin,
            who: _dao,
            condition: PermissionLib.NO_CONDITION,
            permissionId: base.SET_HASH_PERMISSION_ID()
        });
    }

    /// @inheritdoc IPluginSetup
    function implementation() external view returns (address) {
        return address(base);
    }
}
