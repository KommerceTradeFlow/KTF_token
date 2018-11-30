pragma solidity ^0.4.23;
import "./ERC20Mintable.sol";

contract KTFToken is ERC20Mintable {

  string public constant name = "Kommerce Trade-finance Token";
  string public constant symbol = "KTF";
  uint8 public constant decimals = 18;

  //to avoid replay
  mapping(address => uint) public nonce;

  function getNonce(address _spender) public view returns (uint) {
    return nonce[_spender];
  }

  function approve_meta(address _spender, uint256 _value, address _signer, bytes sig) public returns (bool) {
  	bytes32 _hash = keccak256(abi.encodePacked(address(this), _spender, _value, _signer, nonce[_signer]));

    //increment the hash so this tx can't run again
    nonce[_signer]++;

    //check signature
    require(_signer == checkSignature(_hash, sig), "Meta signature invalid");

    //meta 'approve' function
    _allowed[_signer][_spender] = _value;
    emit Approval(_signer, _spender, _value);

	return true;
  }

  //borrowed from OpenZeppelin's ESDA stuff:
  //https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/cryptography/ECDSA.sol
  function checkSignature(bytes32 _hash, bytes _signature) public pure returns (address){
    bytes32 r;
    bytes32 s;
    uint8 v;
    // Check the signature length
    if (_signature.length != 65) {
      assert(false);
    }
    // Divide the signature in r, s and v variables
    // ecrecover takes the signature parameters, and the only way to get them
    // currently is to use assembly.
    // solium-disable-next-line security/no-inline-assembly
    assembly {
      r := mload(add(_signature, 32))
      s := mload(add(_signature, 64))
      v := byte(0, mload(add(_signature, 96)))
    }
    // Version of signature should be 27 or 28, but 0 and 1 are also possible versions
    if (v < 27) {
      v += 27;
    }
    // If the version is correct return the signer address
    if (v != 27 && v != 28) {
      assert(false);
    } else {
      // solium-disable-next-line arg-overflow
      return ecrecover(keccak256(
        abi.encodePacked("\x19Ethereum Signed Message:\n32", _hash)
      ), v, r, s);
    }
  }
}

