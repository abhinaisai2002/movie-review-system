import {
  Connection,
  PublicKey,
  Keypair,
  clusterApiUrl,
} from "@solana/web3.js";

import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";

const PROGRAM_ID = new PublicKey("3F4fsF8VBR2sqWMPLLwAuL9ACxwt8QM8HZJdGm9BVJMy");

(async () => {
  // 1️⃣ Setup connection and payer
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const payer = Keypair.generate();


  // 2️⃣ Derive mint_auth PDA
  const [mintAuthPda, bump] = await PublicKey.findProgramAddress(
    [Buffer.from("mint_auth")],
    PROGRAM_ID
  );

  console.log("\n✅ Mint Authority PDA:", mintAuthPda.toBase58());
  console.log("Bump:", bump);

  const ata = new PublicKey("EH6KP8sVYg793JEW5EwoELRh1at3sDbPj9RebhFnUR5R");

  const mint = new PublicKey("8Jv5UC3tUGXSe1MpPBJpdLAbeniWkP18M3cyYirLZ9Nt");

  // 5️⃣ Mint tokens (for demo, we mint using payer as temporary authority)
  // In real case, your program (PDA) will sign this via seeds inside Anchor.
  try {
    await mintTo(
      connection,
      payer,
      mint,
      ata,
      payer, // payer signs here, but your program would normally sign with PDA
      100 * 10 ** 9 // amount = 100 tokens (9 decimals)
    );
    console.log("✅ Minted 100 tokens to your ATA.");
  } catch (e) {
    console.error("⚠️ Mint failed:", e.message);
  }

  // 6️⃣ Verify account balance
  const accountInfo = await getAccount(connection, ata.address);
  console.log(
    "\n🏁 Final Token Balance:",
    Number(accountInfo.amount) / 10 ** 9,
    "tokens"
  );

  console.log("\n🎉 Demo completed successfully!");
})();
