// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import  "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract CrowdFunding is Initializable{
                                         
    address internal token;
    ERC20 internal tokenContract;

    mapping(uint8=>Projects) public listedProjects;
   
    struct Projects{
        string ProjectName;
        address Owner;
        uint256 ProjectGoal;
        uint256 TotalRaised;
        bool exists;
        mapping (address=>uint256) pledges;
    }

    event ProjectAdded(uint8 ProjectId,string ProjectName,uint256 ProjectGoal);
    event Funded(uint8 ProjectId,address funder,uint256 amount);
    event Withdraw(uint8 ProjectId,address funder,uint256 amount);
    event GoalAchieved(uint8 ProjectId,uint256 amount);

    //initializer

    function initialize(address _tokenContract) external initializer() {
         
         tokenContract=ERC20(_tokenContract);
         token=_tokenContract;
    }

    
    
    function CreateProject(uint8 _ProjectId,string memory _ProjectName,uint256 _ProjectGoal) public {
        require(listedProjects[_ProjectId].exists==false,"ProjectId already exists");

         listedProjects[_ProjectId].ProjectName=_ProjectName;
         listedProjects[_ProjectId].Owner=msg.sender;
         listedProjects[_ProjectId].ProjectGoal=_ProjectGoal;
         listedProjects[_ProjectId].TotalRaised=0;
         listedProjects[_ProjectId].exists=true;

         emit ProjectAdded(_ProjectId,_ProjectName,_ProjectGoal);
    }


    function FundProject(uint8 _ProjectId,uint256 _amount) public ValidProject(_ProjectId) goalNotReached(_ProjectId)checkpledgeamount(_ProjectId,_amount){
        Projects storage prj=listedProjects[_ProjectId];
        prj.pledges[msg.sender]+=_amount;
        tokenContract.transferFrom(msg.sender,address(this),_amount);
        prj.TotalRaised+=_amount;

        if(prj.ProjectGoal<=prj.TotalRaised){
            emit GoalAchieved(_ProjectId,prj.ProjectGoal);
        }

        emit Funded(_ProjectId,msg.sender,_amount);
    }

    function WithDraw(uint8 _ProjectId) public ValidProject(_ProjectId) goalNotReached(_ProjectId) {

         Projects storage prj=listedProjects[_ProjectId];
         uint amounttobesent=prj.pledges[msg.sender];
         require(amounttobesent>0,"You haven't contributed to this project");
         prj.pledges[msg.sender]=0;
         prj.TotalRaised-=amounttobesent;
         tokenContract.transfer(msg.sender,amounttobesent);

         emit Withdraw(_ProjectId,msg.sender,amounttobesent);
    }

    function getpledges(uint8 _ProjectId,address _funder)public view returns(uint) {
             return listedProjects[_ProjectId].pledges[_funder];
    }

    

    modifier ValidProject(uint8 _ProjectId){
         require(listedProjects[_ProjectId].exists==true,"Invalid Project");
         _;
    }
   
      modifier goalNotReached(uint8 _ProjectId){
        require(listedProjects[_ProjectId].ProjectGoal>listedProjects[_ProjectId].TotalRaised,"Goal reached, already");
        _;
      } 

      modifier checkpledgeamount(uint8 _ProjectId,uint256 _amount){
          require(listedProjects[_ProjectId].ProjectGoal>=listedProjects[_ProjectId].TotalRaised+_amount,"Reduce donation amount");
             _;
      }

      modifier goalReached(uint8 _ProjectId){
         require(listedProjects[_ProjectId].ProjectGoal<=listedProjects[_ProjectId].TotalRaised,"Project Goal reached,can't withdraw");
           _;
      }
}



