import { BankrunProvider, startAnchor } from "anchor-bankrun";
import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair, PublicKey} from '@solana/web3.js'
import {Voting} from '../target/types/voting'

const IDL = require("../target/idl/voting.json"); // ABI

const votingAddress = new PublicKey("CNuzdNkDEkcRYQjQdN7iuZvt7PC82SouEgeRGyJMR497");

describe('Voting', () => {

  let context;
  let provider;
  anchor.setProvider(anchor.AnchorProvider.env());
  let votingProgram = anchor.workspace.Voting as Program<Voting>;

  beforeAll(async () => {
    /*context = await startAnchor("", [{name: "voting", programId: votingAddress}], []);

    provider = new BankrunProvider(context);

    votingProgram = new Program<Voting>(
      IDL,
      provider,
    );*/
  })

  it('Initialize Poll', async () => {
    await votingProgram.methods.initializePoll(
      new anchor.BN(1),
      "What is your favorite car ?",
      new anchor.BN(0),
      new anchor.BN(1841629951),
    ).rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      votingAddress
    )

    const poll = await votingProgram.account.poll.fetch(pollAddress);

    console.log(poll);

    expect(poll.pollId.toNumber()).toEqual(1);
    expect(poll.description).toEqual("What is your favorite car ?");
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());
  });

  it('Initialize Candidate', async () => {
    await votingProgram.methods.initializeCandidate(
      "Mercedes",
      new anchor.BN(1),
    ).rpc();
    await votingProgram.methods.initializeCandidate(
      "Audi",
      new anchor.BN(1),
    ).rpc();

    const [mercedesAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Mercedes")],
      votingAddress,
    );
    const mercedesCandidate = await votingProgram.account.candidate.fetch(mercedesAddress);
    console.log(mercedesCandidate);
    expect(mercedesCandidate.candidateVotes.toNumber()).toEqual(0);

    const [audiAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Audi")],
      votingAddress,
    );
    const audiCandidate = await votingProgram.account.candidate.fetch(audiAddress);
    console.log(audiCandidate);
    expect(audiCandidate.candidateVotes.toNumber()).toEqual(0);
  });

  it('vote', async () => {
    await votingProgram.methods.vote(
      "Audi",
      new anchor.BN(1)
    ).rpc();

    const [audiAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Audi")],
      votingAddress,
    );
    const audiCandidate = await votingProgram.account.candidate.fetch(audiAddress);
    console.log(audiCandidate);
    expect(audiCandidate.candidateVotes.toNumber()).toEqual(1);
  });

})
