import { ACTIONS_CORS_HEADERS, ActionGetResponse, ActionPostRequest, createPostResponse } from "@solana/actions";
import * as anchor from '@coral-xyz/anchor';
import { Voting } from '@/../anchor/target/types/voting';
import { Keypair, PublicKey, Transaction } from '@solana/web3.js';

import IDL from '@/../anchor/target/idl/voting.json';

export const OPTIONS = GET;

export async function GET(request: Request) {
    const actionMetadata: ActionGetResponse = {
        icon: "https://hips.hearstapps.com/hmg-prod/images/future-cars-679d3400f197f.jpg",
        title: "Vote for you favorite car ?",
        description: "Vote between Audi and Mercedes",
        label: "Vote",
        links: {
            actions: [
                {
                    label: "Vote for Audi",
                    href: "http://localhost:3000/api/vote?candidate=Audi",
                },
                {
                    label: "Vote for Mercedes",
                    href: "http://localhost:3000/api/vote?candidate=Mercedes",
                }
            ]
        }
    };
    return Response.json(actionMetadata, { headers: ACTIONS_CORS_HEADERS });
}

export async function POST(request: Request) {
    const url = new URL(request.url);
    const candidate = url.searchParams.get("candidate");

    if (candidate != "Mercedes" && candidate != "Audi") {
        return new Response("Invalid candidate", { status: 400, headers: ACTIONS_CORS_HEADERS });
    }

    const connection = new anchor.web3.Connection("http://127.0.0.1:8899", "confirmed");
    const program: anchor.Program<Voting> = new anchor.Program(IDL as Voting, {connection} );

    const body: ActionPostRequest = await request.json();
    let voter: PublicKey;

    try {
        voter = new PublicKey(body.account); // if the account is not a Public Key revert
    } catch (error) {
        return new Response('Invalid "account" provided', {
            status: 400,
            headers: ACTIONS_CORS_HEADERS,
        });
    }

    const instructions = await program.methods
        .vote(candidate, new anchor.BN(1))
        .accounts({
            signer: voter
        })
        .instruction();

    const blockhash = await connection.getLatestBlockhash();

    const transaction = new Transaction({
        feePayer: voter,
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight,
    }).add(instructions);

    const response = await createPostResponse({
        fields: {
          transaction: transaction,
        },
      });

    return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
}
