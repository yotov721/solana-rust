import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SplExample } from "../target/types/spl_example";
import * as splToken from "@solana/spl-token";

describe("spl-example", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SplExample as Program<SplExample>;

  let signer1 = anchor.web3.Keypair.generate();
  let signer2 = anchor.web3.Keypair.generate();

  it("Is initialized!", async () => {
    await airdrop(program.provider.connection, signer1.publicKey, 500_000_000_000);

    let [vault_data, bump_a] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault_data"), signer1.publicKey.toBuffer()],
      program.programId
    )

    let [mint_data, bump_b] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("mint"), signer1.publicKey.toBuffer()],
      program.programId
    )

    let new_vault = splToken.getAssociatedTokenAddressSync(mint_data, vault_data, true);

    const tx = await program.methods.initialize().accounts({
      signer: signer1.publicKey,
      vaultData: vault_data,
      newMint: mint_data,
      newVault: new_vault,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      associatedTokenProgram: splToken.ASSOCIATED_TOKEN_PROGRAM_ID
    }).signers([signer1]).rpc();
    console.log("Your transaction signature", tx);
  });

  it("Is Grab", async () => {
    await airdrop(program.provider.connection, signer2.publicKey, 500_000_000_000);

    let [vault_data, bump_a] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault_data"), signer1.publicKey.toBuffer()],
      program.programId
    )

    let [mint_data, bump_b] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("mint"), signer1.publicKey.toBuffer()],
      program.programId
    )

    let new_vault = splToken.getAssociatedTokenAddressSync(mint_data, vault_data, true);
    let signer_vault = await splToken.createAssociatedTokenAccount(program.provider.connection, signer2, mint_data, signer2.publicKey);

    const tx = await program.methods.grab().accounts({
      signer: signer2.publicKey,
      vaultData: vault_data,
      mint: mint_data,
      newVault: new_vault,
      signerVault: signer_vault,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
    }).signers([signer2]).rpc();

    console.log("Your transaction signature", tx);
  });
});

export async function airdrop(connection: any, address: any, amount = 500_000_000_000) {
  await connection.confirmTransaction(
    await connection.requestAirdrop(address, amount),
    'confirmed'
  );
}