const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { describe } = require("mocha");
require("@nomicfoundation/hardhat-chai-matchers");
let params = require("../constants/params.json");
const { BigNumber } = require("ethers");
const { parseEther } = require("ethers/lib/utils");

const _100ethinwei = parseEther("100");

describe("Crowdfunding", () => {
  async function deployFixtureinit() {
    const [owner, account1, account2, account3, account4] =
      await ethers.getSigners();

    const CrowdFundToken = await ethers.getContractFactory(
      "CrowdFundToken",
      owner
    );
    const crowdfundtoken = await CrowdFundToken.deploy();
    await crowdfundtoken.deployed();

    console.log("CrowdFundToken deployed at " + crowdfundtoken.address);

    const CrowdFunding = await ethers.getContractFactory("CrowdFunding", owner);
    const crowdfunding = await upgrades.deployProxy(CrowdFunding, [
      crowdfundtoken.address,
    ]);
    await crowdfunding.deployed();

    console.log("Proxy deployed at " + crowdfunding.address);

    //the owner has 1000 tokens so we aim to distribute it to other accounts
    await crowdfundtoken.transfer(account1.address, _100ethinwei);
    await crowdfundtoken.transfer(account2.address, _100ethinwei);
    await crowdfundtoken.transfer(account3.address, _100ethinwei);
    await crowdfundtoken.transfer(account4.address, _100ethinwei);

    return {
      owner,
      account1,
      account2,
      account3,
      account4,
      crowdfundtoken,
      crowdfunding,
    };
  }

  describe("Check the token contract ", async () => {
    it("should be initalized", async () => {
      let {
        owner,
        account1,
        account2,
        account3,
        account4,
        crowdfundtoken,
        crowdfunding,
      } = await loadFixture(deployFixtureinit);

      expect(await crowdfundtoken.balanceOf(owner.address)).to.be.equal(
        parseEther("600")
      );
      expect(await crowdfundtoken.balanceOf(account1.address)).to.be.equal(
        parseEther("100")
      );
      expect(await crowdfundtoken.balanceOf(account2.address)).to.be.equal(
        parseEther("100")
      );
      expect(await crowdfundtoken.balanceOf(account3.address)).to.be.equal(
        parseEther("100")
      );
      expect(await crowdfundtoken.balanceOf(account4.address)).to.be.equal(
        parseEther("100")
      );
    });

    it("should be able to add new projects", async () => {
      let {
        owner,
        account1,
        account2,
        account3,
        account4,
        crowdfundtoken,
        crowdfunding,
      } = await loadFixture(deployFixtureinit);
      let project1 = params.project1;
      await crowdfunding
        .connect(account4)
        .CreateProject(project1.id, project1.name, parseEther(project1.goal));

      const prj1 = await crowdfunding.listedProjects(project1.id);

      expect(prj1.ProjectName).to.be.equal(project1.name);
      expect(prj1.Owner).to.be.equal(account4.address);
      expect(prj1.ProjectGoal).to.be.equal(parseEther(project1.goal));
      expect(prj1.TotalRaised).to.be.equal(0);
    });

    it("should be able to fund a listed project", async () => {

        let {
            owner,
            account1,
            account2,
            account3,
            account4,
            crowdfundtoken,
            crowdfunding,
          } = await loadFixture(deployFixtureinit);
          let project1 = params.project1;
          await crowdfunding
            .connect(account4)
            .CreateProject(project1.id, project1.name, parseEther(project1.goal));
    
          let prj1 = await crowdfunding.listedProjects(project1.id);
          const _3ethinwei= parseEther("3");

        await  crowdfundtoken.connect(account4).approve(crowdfunding.address,crowdfundtoken.balanceOf(account1.address));
        await crowdfunding.connect(account4).FundProject(project1.id,_3ethinwei);

        expect(await crowdfundtoken.balanceOf(account4.address)).to.be.equal(parseEther("97"));
         prj1 = await crowdfunding.listedProjects(project1.id);
         expect(prj1.TotalRaised).to.be.equal(parseEther("3"));

    })

    it("should allow multiple users to fund project",async ()=>{

        
        let {
            owner,
            account1,
            account2,
            account3,
            account4,
            crowdfundtoken,
            crowdfunding,
          } = await loadFixture(deployFixtureinit);
          let project1 = params.project1;
          await crowdfunding
            .connect(account4)
            .CreateProject(project1.id, project1.name, parseEther(project1.goal));
    
          let prj1 = await crowdfunding.listedProjects(project1.id);
          const _3ethinwei= parseEther("3");

        await  crowdfundtoken.connect(account4).approve(crowdfunding.address,crowdfundtoken.balanceOf(account1.address));
        await crowdfunding.connect(account4).FundProject(project1.id,_3ethinwei);

        expect(await crowdfundtoken.balanceOf(account4.address)).to.be.equal(parseEther("97"));
         prj1 = await crowdfunding.listedProjects(project1.id);
         expect(prj1.TotalRaised).to.be.equal(parseEther("3"));

         
        await  crowdfundtoken.connect(account3).approve(crowdfunding.address,crowdfundtoken.balanceOf(account1.address));
        await crowdfunding.connect(account3).FundProject(project1.id,_3ethinwei);

        expect(await crowdfundtoken.balanceOf(account3.address)).to.be.equal(parseEther("97"));
         prj1 = await crowdfunding.listedProjects(project1.id);
         expect(prj1.TotalRaised).to.be.equal(parseEther("6"));
    })

    it("should be able to withdraw when the project goal not achieved",async()=>{
     
        
        let {
            owner,
            account1,
            account2,
            account3,
            account4,
            crowdfundtoken,
            crowdfunding,
          } = await loadFixture(deployFixtureinit);
          let project1 = params.project1;
          await crowdfunding
            .connect(account4)
            .CreateProject(project1.id, project1.name, parseEther(project1.goal));
    
          let prj1 = await crowdfunding.listedProjects(project1.id);
          const _3ethinwei= parseEther("3");

        await  crowdfundtoken.connect(account4).approve(crowdfunding.address,crowdfundtoken.balanceOf(account1.address));
        await crowdfunding.connect(account4).FundProject(project1.id,_3ethinwei);


        expect(await crowdfundtoken.balanceOf(account4.address)).to.be.equal(parseEther("97"));
         prj1 = await crowdfunding.listedProjects(project1.id);
         expect(prj1.TotalRaised).to.be.equal(parseEther("3"));

         await crowdfunding.connect(account4).WithDraw(project1.id);
         prj1 = await crowdfunding.listedProjects(project1.id);
         expect(await crowdfundtoken.balanceOf(account4.address)).to.be.equal(parseEther("100"));

        expect(prj1.TotalRaised).to.be.equal(parseEther("0"));
        })
  });
});
