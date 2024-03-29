# Introduction
This is the Kommerce Trade Finance(KTF) token contract. It is extended from code copied from [openzeppelin-solidity v2.0.0](https://github.com/OpenZeppelin/openzeppelin-solidity/tree/v2.0.0)

Main new feature is a `approve_meta()` function, meant to allow gas-lass account owners to authorize an `approve()` method via a proxy, using a nonce and signature. The new method takes the format:
```
approve_meta(address _spender, uint256 _value, address _signer, bytes sig)
```
Where `_spender` is the receipent who is able to call `transferFrom()` up to a maximum amount of `_value` from the `_signer` balance.
```
getNonce(address _spender)
```
The `getNonce` method is a public query to get the current nonce of an account, which will be incremented with each `approve_meta()` call.

A signature signed by `_signer` is generated using:
```
sig = evm_sign(ERC20_token_address | spender_address | value | signer_address | nonce)
```
Where `evm_sign` is the ethereum specific ecdsa operation which includes the `\x19Ethereum Signed Message:\n32` prefix.

# Note
Code from `openzeppelin-solidity` is copied rather than imported as a dependancy, so as to modify the `ERC20` contract state `_allowed`  visibility from `private` to `internal`, so that it can be modified by the `approve_meta()` method.

# Credits
Credits to the great work from [openzeppelin-solidity](https://github.com/OpenZeppelin/openzeppelin-solidity) and austintgriffith for [bouncer-proxy](https://github.com/austintgriffith/bouncer-proxy) where the signing code is adapted from.