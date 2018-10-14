var GNCCrowdsale = artifacts.require("./GNCCrowdsale.sol");
//import assertRevert from './helpers/assertRevert';


contract('GNCCrowdsale', (accounts) => {
    var contract;
    var owner = accounts[0]; // for test

    var rate = Number(575);
    var buyWei = Number(1 * 10**18);
    var rateNew = Number(575);
    var buyWeiNew = 1 * 10**18;
    var buyWeiMin = 2 * 10**14;

    var fundForSale = 3e25;

    it('should deployed contract', async ()  => {
        assert.equal(undefined, contract);
        contract = await GNCCrowdsale.deployed();
        assert.notEqual(undefined, contract);
    });

    it('get address contract', async ()  => {
        assert.notEqual(undefined, contract.address);
    });

    it('verification balance owner contract', async ()  => {
        var balanceOwner = await contract.balanceOf(owner);
        assert.equal(fundForSale, Number(balanceOwner));
    });


    it('verification of receiving Ether', async ()  => {
        var tokenAllocatedBefore = await contract.tokenAllocated.call();
        var balanceAccountTwoBefore = await contract.balanceOf(accounts[2]);
        var weiRaisedBefore = await contract.weiRaised.call();

        await contract.buyTokens(accounts[2],{from:accounts[2], value:buyWei});
        var tokenAllocatedAfter = await contract.tokenAllocated.call();
        assert.isTrue(tokenAllocatedBefore < tokenAllocatedAfter);
        assert.equal(0, tokenAllocatedBefore);
        //assert.equal(Number(rate*buyWei), Number(tokenAllocatedAfter));

       var balanceAccountTwoAfter = await contract.balanceOf(accounts[2]);
        assert.isTrue(balanceAccountTwoBefore < balanceAccountTwoAfter);
        assert.equal(0, balanceAccountTwoBefore);
        assert.equal(rate*buyWei, balanceAccountTwoAfter);

        var weiRaisedAfter = await contract.weiRaised.call();
        assert.isTrue(weiRaisedBefore < weiRaisedAfter);
        assert.equal(0, weiRaisedBefore);
        assert.equal(buyWei, weiRaisedAfter);

        var depositedAfter = await contract.getDeposited.call(accounts[2]);
        assert.equal(buyWei, depositedAfter);

        var balanceAccountThreeBefore = await contract.balanceOf(accounts[3]);
        await contract.buyTokens(accounts[3],{from:accounts[3], value:buyWeiNew});
        var balanceAccountThreeAfter = await contract.balanceOf(accounts[3]);
        assert.isTrue(balanceAccountThreeBefore < balanceAccountThreeAfter);
        assert.equal(0, balanceAccountThreeBefore);
        assert.equal(rateNew*buyWeiNew, balanceAccountThreeAfter);
    });

    it('verification define period', async ()  => {
        var currentDate = 1528128000; // Mon, 04 Jun 2018 00:00:00 GMT
        period = await contract.getPeriod(currentDate);
        assert.equal(0, period);

        var currentDate = 1546336800; // Tue, 01 Jan 2019 10:00:00 GMT
        period = await contract.getPeriod(currentDate);
        assert.equal(0, period);

        currentDate = 1543658400; // Sat, 01 Dec 2018 10:00:00 GMT
        period = await contract.getPeriod(currentDate);
        assert.equal(1, period);

        currentDate = 1547978400; // Sun, 20 Jan 2019 10:00:00 GMT
        period = await contract.getPeriod(currentDate);
        assert.equal(2, period);

        currentDate = 1549101600; // Sat, 02 Feb 2019 10:00:00 GMT
        period = await contract.getPeriod(currentDate);
        assert.equal(3, period);

        currentDate = 1551520800; // Sat, 02 Mar 2019 10:00:00 GMT
        period = await contract.getPeriod(currentDate);
        assert.equal(4, period);

        currentDate = 1554199200; // Tue, 02 Apr 2019 10:00:00 GMT
        period = await contract.getPeriod(currentDate);
        assert.equal(0, period);
    });

    it('check vesting period', async ()  => {
        var currentDate = 1552219200; // Mar, 10, 2019
        var vestingPeriod = await contract.checkVesting(buyWeiMin, currentDate);
        assert.equal(0, vestingPeriod);

        currentDate = 1568973600; // Sep, 20, 2019
        vestingPeriod = await contract.checkVesting(buyWeiMin, currentDate);
        assert.equal(1, vestingPeriod);

        currentDate = 1584698400; // Mar, 20, 2020
        vestingPeriod = await contract.checkVesting(buyWeiMin, currentDate);
        assert.equal(2, vestingPeriod);

        currentDate = 1600596000; // Sep, 20, 2020
        vestingPeriod = await contract.checkVesting(buyWeiMin, currentDate);
        assert.equal(3, vestingPeriod);

        currentDate = 1616234400; // Mar, 20, 2021
        vestingPeriod = await contract.checkVesting(buyWeiMin, currentDate);
        assert.equal(4, vestingPeriod);

        currentDate = 1646913600; // Mar, 10, 2022
        vestingPeriod = await contract.checkVesting(buyWeiMin, currentDate);
        assert.equal(4, vestingPeriod);
    });

    it('verification claim tokens', async ()  => {
        var balanceAccountOneBefore = await contract.balanceOf(accounts[1]);
        assert.equal(0, balanceAccountOneBefore);
        await contract.buyTokens(accounts[1],{from:accounts[1], value:buyWei});
        var balanceAccountOneAfter = await contract.balanceOf(accounts[1]);
        await contract.transfer(contract.address,balanceAccountOneAfter,{from:accounts[1]});
        var balanceContractBefore = await contract.balanceOf(contract.address);
        assert.equal(buyWei*rate, balanceContractBefore);
        //console.log("balanceContractBefore = " + balanceContractBefore);
        var balanceAccountAfter = await contract.balanceOf(accounts[1]);
        assert.equal(0, balanceAccountAfter);
        var balanceOwnerBefore = await contract.balanceOf(owner);
        await contract.claimTokens(contract.address,{from:accounts[0]});
        var balanceContractAfter = await contract.balanceOf(contract.address);
        assert.equal(0, balanceContractAfter);
        var balanceOwnerAfter = await contract.balanceOf(owner);
        assert.equal(true, balanceOwnerBefore<balanceOwnerAfter);
    });

    it('verification whitelist', async ()  => {
        var balanceAccountSixBefore = await contract.balanceOf(accounts[6]);
        assert.equal(0, Number(balanceAccountSixBefore));

        await contract.addToWhitelist(accounts[6]);
        await contract.buyTokens(accounts[6],{from:accounts[6], value:buyWei});
        balanceAccountSixAfter = await contract.balanceOf(accounts[6]);
        assert.equal(buyWei*rate*1.05, Number(balanceAccountSixAfter));
    });

    it('verification refferal link', async ()  => {
        var balanceAccountSevenBefore = await contract.balanceOf(accounts[7]);
        assert.equal(0, Number(balanceAccountSevenBefore));

        await contract.addToWhitelist(accounts[6]);
        await contract.buyTokens(accounts[7],{from:accounts[7], value:buyWei});
        await contract.getRefferalProfit(accounts[6],{from:accounts[7]});
        balanceAccountSevenAfter = await contract.balanceOf(accounts[7]);
        assert.equal(buyWei*rate*1.05, Number(balanceAccountSevenAfter));
    });

    it('verification tokens limit min amount', async ()  => {
        var numberTokensMinWey = await contract.validPurchaseTokens.call(buyWeiMin);
        assert.equal(0, Number(numberTokensMinWey));
    });

});



