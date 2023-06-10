const Voting = artifacts.require("./Voting.sol");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('Voting', accounts => {
    const _owner = accounts[0];
    const _firstVoter = accounts[1];
    const _secondVoter = accounts[2];
    const _random = accounts[3];
    const _decimal = new BN(18);

    let VotingInstance;

    before(async function () {
        VotingInstance = await Voting.deployed({ from: _owner });
    });

    // // ::::::::::::: GETTERS ::::::::::::: //
    // describe("tests getters", function () {
    //     beforeEach(async function () {
    //         VotingInstance = await Voting.deployed();
    //     });

    //     it("...should get voter", async function () {

    //     });

    //     it("...should get voter by only owner", async function () {

    //     });

    //     it("...should get proposal", async function () {

    //     });

    //     it("...should get proposal by only owner", async function () {

    //     });
    // });

    // // ::::::::::::: REGISTRATION ::::::::::::: //
    // describe("tests add voter", function () {
    //     beforeEach(async function () {
    //         VotingInstance = await Voting.deployed();
    //     });

    //     it("...should be only owner", async function () {

    //     });

    //     it("...should add voter", async function () {

    //     });

    //     it("...should voter registration is not open yet", async function () {

    //     });

    //     it("...should voter already registered", async function () {

    //     });
    // });

    // // ::::::::::::: PROPOSALS ::::::::::::: //
    // describe("tests add proposal", function () {
    //     beforeEach(async function () {
    //         VotingInstance = await Voting.deployed();
    //     });

    //     it("...should be only voter", async function () {

    //     });

    //     it("...status should be ProposalsRegistrationStarted", async function () {

    //     });

    //     it("...proposal already exist", async function () {

    //     });

    //     it("...proposal should be registered", async function () {

    //     });
    // });

    // // ::::::::::::: VOTE ::::::::::::: //
    // describe("tests set vote", function () {
    //     beforeEach(async function () {
    //         VotingInstance = await Voting.deployed();
    //     });

    //     it("...should be only voter", async function () {

    //     });

    //     it("...status should be VotingSessionStarted", async function () {

    //     });

    //     it("...already voted", async function () {

    //     });

    //     it("...proposal not found", async function () {

    //     });

    //     it("...voted", async function () {

    //     });
    // });

    // ::::::::::::: STATE ::::::::::::: //
    describe("tests state", function () {
        context("tests startProposalsRegistering", function () {
            beforeEach(async function () {
                VotingInstance = await Voting.new({ from: _owner });
            });

            it("...should be only owner", async function () {
                await expectRevert(VotingInstance.startProposalsRegistering({ from: _random }), 'Ownable: caller is not the owner');
            });

            it("...status changed", async function () {
                await checkWorkflowStatusChange(1);
            });

            it("...status doesn't changed", async function () {
                console.log('oui', (await getStatus()).toString())

                await checkRevertWorkflowStatus(VotingInstance.startProposalsRegistering({ from: _owner }), 1, 'Registering proposals cant be started now');
            });
        });

        // context("tests endProposalsRegistering", function () {
        //     it("...should be only owner", async function () {
        //         await expectRevert(VotingInstance.endProposalsRegistering({ from: _random }), 'Ownable: caller is not the owner');
        //     });

        //     it("...status changed", async function () {
        //         await checkWorkflowStatusChange(2);
        //     });

        //     it("...status doesn't changed", async function () {
        //         await checkRevertWorkflowStatus(VotingInstance.endProposalsRegistering({ from: _owner }), 2, 'Registering proposals havent started yet');
        //     });
        // });

        // context("tests startVotingSession", function () {
        //     it("...should be only owner", async function () {
        //         await expectRevert(VotingInstance.startVotingSession({ from: _random }), 'Ownable: caller is not the owner');
        //     });

        //     it("...status changed", async function () {
        //         await checkWorkflowStatusChange(3);
        //     });

        //     it("...status doesn't changed", async function () {
        //         await checkRevertWorkflowStatus(VotingInstance.startVotingSession({ from: _owner }), 3, 'Registering proposals phase is not finished');
        //     });
        // });

        // context("tests endVotingSession", function () {
        //     it("...should be only owner", async function () {
        //         await expectRevert(VotingInstance.endVotingSession({ from: _random }), 'Ownable: caller is not the owner');
        //     });

        //     it("...status changed", async function () {
        //         await checkWorkflowStatusChange(4);
        //     });

        //     it("...status doesn't changed", async function () {
        //         await checkRevertWorkflowStatus(VotingInstance.endVotingSession({ from: _owner }), 4, 'Voting session havent started yet');
        //     });
        // });

        // context("tests tallyVotes", function () {
        //     it("...should be only owner", async function () {
        //         await expectRevert(VotingInstance.tallyVotes({ from: _random }), 'Ownable: caller is not the owner');
        //     });

        //     it("...status changed", async function () {
        //         await checkWorkflowStatusChange(5);
        //     });

        //     it("...status doesn't changed", async function () {
        //         await checkRevertWorkflowStatus(VotingInstance.tallyVotes({ from: _owner }), 5, 'Current status is not voting session ended');
        //     });
        // });
    });

    async function checkWorkflowStatusChange(expectedNextStatus) {
        expectEvent(await goToStatus(expectedNextStatus), 'WorkflowStatusChange', { previousStatus: new BN(expectedNextStatus - 1), newStatus: new BN(expectedNextStatus) });
        let currentStatus = await getStatus();
        expect(currentStatus).to.be.bignumber.equal(new BN(expectedNextStatus))
    }

    async function checkRevertWorkflowStatus(action, expectedNextStatus, msg) {
        for (let currentStatus = 0; currentStatus < 5; currentStatus++) {
            let nextStatus = currentStatus + 1;
            console.log('loop', currentStatus)
            await goNextStatus(nextStatus);
            if (nextStatus === expectedNextStatus) {
                continue;
            }
            await expectRevert(action, msg);
        }
    }

    async function getStatus() {
        return await VotingInstance.workflowStatus();
    }

    async function goNextStatus(nextStatus) {
        switch (nextStatus) {
            case 1:
                console.log('goNextStatus', (await getStatus()).toString())
                return await VotingInstance.startProposalsRegistering({ from: _owner })
            case 2:
                return await VotingInstance.endProposalsRegistering({ from: _owner })
            case 3:
                return await VotingInstance.startVotingSession({ from: _owner })
            case 4:
                return await VotingInstance.endVotingSession({ from: _owner })
            case 5:
                return await VotingInstance.tallyVotes({ from: _owner })
            default:
                return;
        }
    }

    async function goToStatus(endStatus) {
        let tx;
        for (let currentStatus = 0; currentStatus < endStatus; currentStatus++) {
            tx = await goNextStatus(currentStatus + 1);
        }
        return tx;
    }
});