import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ProgramA } from "../target/types/program_a";
import { ProgramB } from "../target/types/program_b";

describe("program-a", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const programA = anchor.workspace.ProgramA as Program<ProgramA>;
  const programB = anchor.workspace.ProgramB as Program<ProgramB>;

  let signer = anchor.web3.Keypair.generate();

  it("Is initialized!", async () => {

    let [pda_address, bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("pda"), signer.publicKey.toBuffer()],
      programA.programId
    )

    await airdrop(programA.provider.connection, pda_address);

    const tx = await programA.methods.initialize().accounts({
      pdaAccount: pda_address,
      signer: signer.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
      programB: programB.programId
    }).signers([signer]).rpc();

    console.log("Your transaction signature", tx);
  });
});

export async function airdrop(connection: any, address:any, amount = 500_000_000_000) {
  await connection.confirmTransaction(
    await connection.requestAirdrop(address, amount),
    'confirmed'
  );
}