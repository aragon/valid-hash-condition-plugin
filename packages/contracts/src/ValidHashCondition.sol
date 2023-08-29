// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity 0.8.17;

//TODO release new package
//import {IPermissionCondition, PermissionConditionUpgradeable} from "@aragon/osx/core/permission/PermissionConditionUpgradeable.sol";
import {IPermissionCondition, PermissionConditionUpgradeable} from "./PermissionConditionUpgradeable.sol";
import {PluginUUPSUpgradeable} from "@aragon/osx/packages/contracts/src/core/plugin/PluginUUPSUpgradeable.sol"; //"@aragon/osx/core/plugin/PluginUUPSUpgradeable.sol";
import {IDAO} from "@aragon/osx/packages/contracts/src/core/dao/IDAO.sol"; //"@aragon/osx/core/dao/IDAO.sol";

/// @title ValidHashCondition - Release 1, Build 1
/// @author Aragon - 2023
/// @notice A condition checking if a hash of a message being signed on behalf of the DAO is allowed.
/// @dev This condition must be granted with the `VALIDATE_SIGNATURE_PERMISSION_ID` permission with `_where: dao`.
contract ValidHashCondition is PluginUUPSUpgradeable, PermissionConditionUpgradeable {
    /// @notice The [ERC-165](https://eips.ethereum.org/EIPS/eip-165) interface ID of the contract.
    bytes4 internal constant VALID_HASH_CONDITION_INTERFACE_ID =
        this.initialize.selector ^ this.validateHash.selector ^ this.invalidateHash.selector;

    /// @notice The ID of the permission required to validate [ERC-1271](https://eips.ethereum.org/EIPS/eip-1271) signatures.
    bytes32 public constant VALIDATE_SIGNATURE_PERMISSION_ID =
        keccak256("VALIDATE_SIGNATURE_PERMISSION");

    /// @notice The ID of the permission required to call the `setHash` function.
    bytes32 public constant SET_HASH_PERMISSION_ID = keccak256("SET_HASH_PERMISSION");

    /// @notice Thrown if a value is already set for a hash.
    /// @param hash The hash.
    /// @param value The value that is already set.
    error ValueAlreadySet(bytes32 hash, bool value);

    /// @notice Thrown if the associated DAO is not the expected one.
    /// @param actual The actual DAO address.
    /// @param expected The expected DAO address.
    error UnexpectedDaoContext(address actual, address expected);

    /// @notice Thrown if the associated permission is not the expected one.
    /// @param actual The actual permissionId.
    /// @param expected The expected permissionId.
    error UnexpectedPermissionContext(bytes32 actual, bytes32 expected);

    /// @notice Emitted when a hash is set to be valid.
    /// @param hash The hash being set to be vald.
    event HashValidated(bytes32 hash);

    /// @notice Emitted when a hash is set to be invalid.
    /// @param hash The hash being set to be invald.
    event HashInvalidated(bytes32 hash);

    /// @notice A mapping storing hashes and their validity.
    mapping(bytes32 => bool) public isValid; // TODO set 0.8.21 and use new mapping syntax

    /// @notice Initializes Release 1, Build 1.
    /// @dev This method is required to support [ERC-1822](https://eips.ethereum.org/EIPS/eip-1822).
    /// @param _dao The IDAO interface of the associated DAO.
    function initialize(IDAO _dao) external initializer {
        __PluginUUPSUpgradeable_init(_dao);
    }

    /// @notice Checks if this or the parent contract supports an interface by its ID.
    /// @param _interfaceId The ID of the interface.
    /// @return Returns `true` if the interface is supported.
    function supportsInterface(
        bytes4 _interfaceId
    ) public view override(PermissionConditionUpgradeable, PluginUUPSUpgradeable) returns (bool) {
        return
            _interfaceId == VALID_HASH_CONDITION_INTERFACE_ID ||
            _interfaceId == type(IPermissionCondition).interfaceId ||
            super.supportsInterface(_interfaceId);
    }

    /// @notice Checks if a signer is allowed to sign on behalf of the DAO for the validating contract.
    /// @param _dao The address of the target contract that must be the DAO address.
    /// @param _caller The address of the caller.
    /// @param _permissionId The permission identifier that this condition was granted with.
    /// @param _data Data encoding the message hash and signature.
    /// @return Returns true if the call is permitted.
    function isGranted(
        address _dao,
        address _caller,
        bytes32 _permissionId,
        bytes calldata _data
    ) external view returns (bool) {
        (_caller);

        if (msg.sender != _dao || _dao != address(dao())) {
            revert UnexpectedDaoContext({actual: msg.sender, expected: _dao});
        }

        if (_permissionId != VALIDATE_SIGNATURE_PERMISSION_ID) {
            revert UnexpectedPermissionContext({
                actual: _permissionId,
                expected: VALIDATE_SIGNATURE_PERMISSION_ID
            });
        }

        bytes32 _hash = abi.decode(_data, (bytes32));

        return isValid[_hash];
    }

    /// @notice Validates a hash.
    /// @param _hash The hash to validate.
    function validateHash(bytes32 _hash) external auth(SET_HASH_PERMISSION_ID) {
        if (isValid[_hash] == true) {
            revert ValueAlreadySet({hash: _hash, value: true});
        }

        isValid[_hash] = true;

        emit HashValidated({hash: _hash});
    }

    /// @notice Invalidates a hash.
    /// @param _hash The hash to invalidate.
    function invalidateHash(bytes32 _hash) external auth(SET_HASH_PERMISSION_ID) {
        if (isValid[_hash] == false) {
            revert ValueAlreadySet({hash: _hash, value: false});
        }

        isValid[_hash] = false;

        emit HashInvalidated({hash: _hash});
    }

    /// @notice This empty reserved space is put in place to allow future versions to add new variables without shifting down storage in the inheritance chain (see [OpenZeppelin's guide about storage gaps](https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps)).
    uint256[49] private __gap;
}
