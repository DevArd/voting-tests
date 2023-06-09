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

    // ::::::::::::: GETTERS ::::::::::::: //
    describe("tests getters", function () {
        beforeEach(async function () {
            VotingInstance = await Voting.deployed();
        });

        it("...should get voter", async function () {

        });

        it("...should get voter by only owner", async function () {

        });

        it("...should get proposal", async function () {

        });

        it("...should get proposal by only owner", async function () {

        });
    });

    // ::::::::::::: REGISTRATION ::::::::::::: //
    describe("tests registration", function () {
        beforeEach(async function () {
            VotingInstance = await Voting.deployed();
        });

        it("...should add voter", async function () {

        });

        it("...should voter registration is not open yet", async function () {

        });

        it("...should voter already registered", async function () {

        });
    });

    // ::::::::::::: VOTE ::::::::::::: //
    describe("tests getters", function () {
        beforeEach(async function () {
            VotingInstance = await Voting.deployed();
        });

        it("...voter registered", async function () {

        });

        it("...voted", async function () {

        });
    });

    // ::::::::::::: PROPOSALS ::::::::::::: //
    describe("tests getters", function () {
        beforeEach(async function () {
            VotingInstance = await Voting.deployed();
        });

        it("...proposal registered", async function () {

        });

        it("...proposal by only voter", async function () {

        });

        it("...proposal not exist", async function () {

        });
    });

    // ::::::::::::: STATE ::::::::::::: //
    describe("tests state", function () {
        beforeEach(async function () {
            VotingInstance = await Voting.deployed();
        });

        it("...status changed", async function () {

        });

        it("...status doesn't changed", async function () {

        });
    });
});