const { assert } = require("chai");

const { Wallet } = require('Wallet');

contract('./contract/Wallet', (accounts) => {
    let wallet;
    beforeEach(async () => {
        wallet = await Wallet.new([accounts[0], accounts[1], accounts[2]], 2);
        await web3.eth.sendTransaction({'from': accounts[0], to: wallet.address, value: 1000})
    })

    it('Should have correct approvers and quorum',async () => {
        const approvers = await wallet.getApporvers();
        const quorum = await wallet.quorum();
        assert(approvers.length === 3);
        assert(accounts[0] === accounts[0]);
        assert(accounts[1] === accounts[1]);
        assert(accounts[2] === accounts[2]);

        assert(quorum.toNumber()  === 2 );
    })
})