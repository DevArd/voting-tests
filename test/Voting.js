const Voting = artifacts.require("./Voting.sol");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('Voting', accounts => {
    const _owner = accounts[0];
    const _firstVoter = accounts[1];
    const _random = accounts[2];

    let VotingInstance;

    before(async function () {
        VotingInstance = await Voting.deployed({ from: _owner });
    });

    // // ::::::::::::: GETTERS ::::::::::::: //
    describe("tests getters", function () {
        beforeEach(async function () {
            VotingInstance = await Voting.new({ from: _owner });
            await VotingInstance.addVoter(_firstVoter, { from: _owner });
            await VotingInstance.startProposalsRegistering({ from: _owner });
            await VotingInstance.addProposal('myProposal', { from: _firstVoter })
        });

        it("...should get voter", async function () {
            const voter = await getVoter(_firstVoter);
            expect(voter.isRegistered).to.be.true;
            expect(voter.hasVoted).to.be.false;
            expect(voter.votedProposalId).to.be.equal('0');
        });

        it("...should get voter by only voter", async function () {
            await expectRevert(VotingInstance.getVoter(_firstVoter, { from: _random }), 'You\'re not a voter');
        });

        it("...should get proposal", async function () {
            const proposal = await getProposal(1);
            expect(proposal.description).to.be.equal('myProposal');
        });

        it("...should get proposal by only voter", async function () {
            await expectRevert(VotingInstance.getOneProposal(0, { from: _random }), 'You\'re not a voter');
        });
    });

    // // ::::::::::::: REGISTRATION ::::::::::::: //
    describe("tests add voter", function () {
        beforeEach(async function () {
            VotingInstance = await Voting.new({ from: _owner });
        });

        it("...should be only owner", async function () {
            await expectRevert(VotingInstance.addVoter(_firstVoter, { from: _random }), 'Ownable: caller is not the owner');

        });

        it("...should add voter", async function () {
            expectEvent(await VotingInstance.addVoter(_firstVoter, { from: _owner }), 'VoterRegistered', { voterAddress: _firstVoter });
        });

        it("...should voter already registered", async function () {
            await VotingInstance.addVoter(_firstVoter, { from: _owner });
            await expectRevert(VotingInstance.addVoter(_firstVoter, { from: _owner }), 'Already registered');
        });
    });

    // // ::::::::::::: PROPOSALS ::::::::::::: //
    describe("tests add proposal", function () {
        beforeEach(async function () {
            VotingInstance = await Voting.new({ from: _owner });
            await VotingInstance.addVoter(_firstVoter, { from: _owner });
            await VotingInstance.startProposalsRegistering({ from: _owner });
        });

        it("...should be only voter", async function () {
            await expectRevert(VotingInstance.addProposal('myProposal', { from: _random }), 'You\'re not a voter');
        });

        it("...proposal empty", async function () {
            await expectRevert(VotingInstance.addProposal('', { from: _firstVoter }), 'Vous ne pouvez pas ne rien proposer');
        });

        it("...proposal should be registered", async function () {
            const proposalId = 1;
            expectEvent(await VotingInstance.addProposal('myProposal', { from: _firstVoter }), 'ProposalRegistered', { proposalId: new BN(proposalId) });
            const proposal = await getProposal(proposalId);
            expect(proposal.description).to.be.equal('myProposal');
        });
    });

    // // ::::::::::::: VOTE ::::::::::::: //
    describe("tests set vote", function () {
        beforeEach(async function () {
            VotingInstance = await Voting.new({ from: _owner });
            await VotingInstance.addVoter(_firstVoter, { from: _owner });
            await VotingInstance.startProposalsRegistering({ from: _owner });
            await VotingInstance.addProposal('myProposal', { from: _firstVoter });
            await VotingInstance.endProposalsRegistering({ from: _owner });
            await VotingInstance.startVotingSession({ from: _owner });
        });

        it("...should be only voter", async function () {
            await expectRevert(VotingInstance.setVote(1, { from: _random }), 'You\'re not a voter');
        });

        it("...already voted", async function () {
            await VotingInstance.setVote(1, { from: _firstVoter });
            await expectRevert(VotingInstance.setVote(1, { from: _firstVoter }), 'You have already voted');
        });

        it("...proposal not found", async function () {
            await expectRevert(VotingInstance.setVote(2, { from: _firstVoter }), 'Proposal not found');
        });

        it("...voted", async function () {
            const proposalId = 1;
            expectEvent(await VotingInstance.setVote(proposalId, { from: _firstVoter }), 'Voted', { voter: _firstVoter, proposalId: new BN(proposalId) });
            const proposal = await getProposal(proposalId);
            expect(proposal.description).to.be.equal('myProposal');
            expect(proposal.voteCount).to.be.equal('1');
            const voter = await getVoter(_firstVoter);
            expect(voter.isRegistered).to.be.true;
            expect(voter.hasVoted).to.be.true;
            expect(voter.votedProposalId).to.be.equal(proposalId.toString());
        });
    });

    // ::::::::::::: STATE ::::::::::::: //
    describe("tests state", function () {
        beforeEach(async function () {
            VotingInstance = await Voting.new({ from: _owner });
        });

        context("tests revert workflow status", function () {
            // beforeEach(async function () {
            //     VotingInstance = await Voting.new({ from: _owner });
            // });

            it("...startProposalsRegistering", async function () {
                await checkRevertWorkflowStatus(async () => await VotingInstance.startProposalsRegistering({ from: _owner }), 0, 'Registering proposals cant be started now');
            });

            it("...addVoter", async function () {
                await checkRevertWorkflowStatus(async () => await VotingInstance.addVoter(_firstVoter, { from: _owner }), 0, 'Voters registration is not open yet');
            });

            it("...endProposalsRegistering", async function () {
                await checkRevertWorkflowStatus(async () => await VotingInstance.endProposalsRegistering({ from: _owner }), 1, 'Registering proposals havent started yet');
            });

            it("...addProposal", async function () {
                await VotingInstance.addVoter(_firstVoter, { from: _owner });
                await checkRevertWorkflowStatus(async () => await VotingInstance.addProposal('myProposal', { from: _firstVoter }), 1, 'Proposals are not allowed yet');
            });

            it("...startVotingSession", async function () {
                await checkRevertWorkflowStatus(async () => await VotingInstance.startVotingSession({ from: _owner }), 2, 'Registering proposals phase is not finished');
            });

            it("...endVotingSession", async function () {
                await checkRevertWorkflowStatus(async () => await VotingInstance.endVotingSession({ from: _owner }), 3, 'Voting session havent started yet');
            });

            it("...setVote", async function () {
                await VotingInstance.addVoter(_firstVoter, { from: _owner });
                await checkRevertWorkflowStatus(async () => await VotingInstance.setVote(1, { from: _firstVoter }), 3, 'Voting session havent started yet');
            });

            it("...tallyVotes", async function () {
                await checkRevertWorkflowStatus(async () => await VotingInstance.tallyVotes({ from: _owner }), 4, 'Current status is not voting session ended');
            });
        });

        context("tests startProposalsRegistering", function () {
            // beforeEach(async function () {
            //     VotingInstance = await Voting.new({ from: _owner });
            // });

            it("...should be only owner", async function () {
                await expectRevert(VotingInstance.startProposalsRegistering({ from: _random }), 'Ownable: caller is not the owner');
            });

            it("...status changed", async function () {
                await checkWorkflowStatusChange(1);
            });
        });

        context("tests endProposalsRegistering", function () {
            // beforeEach(async function () {
            //     VotingInstance = await Voting.new({ from: _owner });
            // });

            it("...should be only owner", async function () {
                await expectRevert(VotingInstance.endProposalsRegistering({ from: _random }), 'Ownable: caller is not the owner');
            });

            it("...status changed", async function () {
                await checkWorkflowStatusChange(2);
            });
        });

        context("tests startVotingSession", function () {
            // beforeEach(async function () {
            //     VotingInstance = await Voting.new({ from: _owner });
            // });

            it("...should be only owner", async function () {
                await expectRevert(VotingInstance.startVotingSession({ from: _random }), 'Ownable: caller is not the owner');
            });

            it("...status changed", async function () {
                await checkWorkflowStatusChange(3);
            });
        });

        context("tests endVotingSession", function () {
            // beforeEach(async function () {
            //     VotingInstance = await Voting.new({ from: _owner });
            // });

            it("...should be only owner", async function () {
                await expectRevert(VotingInstance.endVotingSession({ from: _random }), 'Ownable: caller is not the owner');
            });

            it("...status changed", async function () {
                await checkWorkflowStatusChange(4);
            });
        });

        context("tests tallyVotes", function () {
            // beforeEach(async function () {
            //     VotingInstance = await Voting.new({ from: _owner });
            // });

            it("...should be only owner", async function () {
                await expectRevert(VotingInstance.tallyVotes({ from: _random }), 'Ownable: caller is not the owner');
            });

            it("...status changed", async function () {
                await checkWorkflowStatusChange(5);
            });
        });
    });

    async function checkWorkflowStatusChange(expectedNextStatus) {
        expectEvent(await goToStatus(expectedNextStatus), 'WorkflowStatusChange', { previousStatus: new BN(expectedNextStatus - 1), newStatus: new BN(expectedNextStatus) });
        let currentStatus = await getStatus();
        expect(currentStatus).to.be.bignumber.equal(new BN(expectedNextStatus))
    }

    const checkRevertWorkflowStatus = async function (promise, expectedGoodStatus, msg, from = 0) {
        for (let currentStatus = from; currentStatus < 5; currentStatus++) {
            let nextStatus = currentStatus + 1;
            if (currentStatus === expectedGoodStatus) {
                await goNextStatus(nextStatus);
                continue;
            } else {
                await expectRevert(promise(), msg);
            }
            await goNextStatus(nextStatus);
        }
        await expectRevert(promise(), msg);
    }

    async function getStatus() {
        return await VotingInstance.workflowStatus();
    }

    async function getProposal(id) {
        return await VotingInstance.getOneProposal(id, { from: _firstVoter });
    }

    async function getVoter(addr) {
        return await VotingInstance.getVoter(addr, { from: _firstVoter })
    }

    async function goNextStatus(nextStatus) {
        switch (nextStatus) {
            case 1:
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