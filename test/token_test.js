let KTFToken = artifacts.require("KTFToken");
const { soliditySha3 } = require('web3-utils');

contract('KTFToken', function(accounts) {
  let approveAmt = 200;
  let deltaAmt = 20;
  let transferAmt = 100;
  let instance;
  let nonce = 0;

  it("KTFToken starts with 1e24 tokens in the first account", function() {
    return KTFToken.new().then(function(results) {
      instance = results;

      //set totalsupply
      return instance.mint(accounts[0], 1e24);
    }).then(function(results) {

      return instance.renounceMinter();
    }).then(function(results) {

      //set totalsupply
      return instance.mint(accounts[0], 1e24);
    }).then(function(results) {

      assert.fail("Should not be mintable after owner renounceMinter()");
    }).catch(function(results) {

      return instance.balanceOf.call(accounts[0]);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 1e24, "1e24 wasn't in the first account");
    });
  });

  it("KTFToken send tokens correctly", function() {
    return KTFToken.new().then(function(results) {
      instance = results;

      //set totalsupply
      return instance.mint(accounts[0], 1e24);
    }).then(function(results) {
      return instance.transfer(accounts[1], transferAmt, {from: accounts[0]});
    }).then(function(results) {
      return instance.balanceOf.call(accounts[1]);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), transferAmt, transferAmt+" tokens transferred correctly");
      return instance.balanceOf.call(accounts[0]);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 1e24-transferAmt, "balance decreased correctly");
    });
  });

  it("KTFToken test signing", function() {
    return KTFToken.new().then(function(results) {
      instance = results;

      //set totalsupply
      return instance.mint(accounts[0], 1e24);
    }).then(function(results) {

      return instance.getNonce.call(accounts[0]);
    }).then(function(results) {
      nonce = results;
      
      let parts = [
        instance.address + "x",
        accounts[1],
        approveAmt,
        accounts[0],
        nonce++
      ]
      let hash = soliditySha3(...parts);
      let sig = web3.eth.sign(accounts[0], hash);
      //accounts[2] is 3rd party gas funder
      return instance.approve_meta(accounts[1], approveAmt, accounts[0], sig, {from: accounts[2]});
    }).then(function(results) {

      assert.fail("Should fail on wrong signature");
    }).catch(function(results) {

    });
  });


  [true, false].forEach(function(meta_mode) {
    it("KTFToken approve tokens correctly in meta_mode="+meta_mode, function() {
      return KTFToken.new().then(function(results) {
        instance = results;

        //set totalsupply
        return instance.mint(accounts[0], 1e24);

      }).then(function(results) {

      return instance.renounceMinter();
    }).then(function(results) {

        return instance.getNonce.call(accounts[0]);
      }).then(function(results) {
        nonce = results;
        
        if(meta_mode){
          let parts = [
            instance.address,
            accounts[1],
            approveAmt,
            accounts[0],
            nonce++
          ]
          let hash = soliditySha3(...parts);
          let sig = web3.eth.sign(accounts[0], hash);
          //accounts[2] is 3rd party gas funder
          return instance.approve_meta(accounts[1], approveAmt, accounts[0], sig, {from: accounts[2]});
        }else{
          return instance.approve(accounts[1], approveAmt, {from: accounts[0]});
        }        
      }).then(function(results) {
        return instance.transferFrom(accounts[0], accounts[2], approveAmt-20, {from: accounts[1]});
      }).then(function(results) {
        return instance.balanceOf.call(accounts[0]);
      }).then(function(balance) {
        assert.equal(balance.valueOf(), 1e24 - transferAmt - (approveAmt-20), "tokens decreased correctly");
        return instance.balanceOf.call(accounts[2]);
      }).then(function(balance) {
        assert.equal(balance.valueOf(), approveAmt-20, (approveAmt-20) + " tokens transferred correctly");
      });
    });
  });
});