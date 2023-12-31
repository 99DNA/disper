import { Connection, PublicKey } from "@solana/web3.js";

import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
export async function getAssociatedTokenAccount(
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey,
  allowOwnerOffCurve = false
) {
  const associatedTokenAccount = await getAssociatedTokenAddress(
    mint,
    owner,
    allowOwnerOffCurve
  );
  let tokenAccountExist = false;
  try {
    await getAccount(connection, associatedTokenAccount);
    tokenAccountExist = true;
  } catch (error: any) {
    // do nothing
  }

  return { associatedTokenAccount, tokenAccountExist };
}
