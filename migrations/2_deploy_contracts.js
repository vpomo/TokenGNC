const GNCCrowdsale = artifacts.require('./GNCCrowdsale.sol');

module.exports = (deployer) => {
    //http://www.onlineconversion.com/unix_time.htm
    var owner =  "0xc7BE5CAa4DC9FD5cBb27a76d828404F85018568F";
    var wallet = "0xb4ABbec258Fc273505Df3729D831008A4B763f8c";

    deployer.deploy(GNCCrowdsale, owner, wallet);

};