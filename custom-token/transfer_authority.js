import { Connection, clusterApiUrl, Keypair, PublicKey } from '@solana/web3.js'

import { setAuthority, AuthorityType, getMint, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'

import bs58 from 'bs58'

// 🔹 Your program ID
const PROGRAM_ID = new PublicKey('3F4fsF8VBR2sqWMPLLwAuL9ACxwt8QM8HZJdGm9BVJMy')

// 🔹 Existing mint (replace with your token mint)
const MINT_ADDRESS = new PublicKey('8Jv5UC3tUGXSe1MpPBJpdLAbeniWkP18M3cyYirLZ9Nt')

const PRIVATE_KEY = '2mKa6TKmSRTpnaQduMvfYkhrZgwUqiWYhW97VCPJPVxufV9ZvgDyapXKMK7gCbFAHtoHtQeazrEcUq2ZSFRVBWST'


 const main =  async () => {
    // 1️⃣ Connect to devnet
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')

    const payer = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY))

    // 3️⃣ Derive PDA (future mint authority)
    const [mintAuthPda, bump] = await PublicKey.findProgramAddress([Buffer.from('mint_auth')], PROGRAM_ID)

    console.log('New PDA mint authority:', mintAuthPda.toBase58())

    // 4️⃣ Transfer mint authority to PDA
    const txSig = await setAuthority(
      connection,
      payer, // fee payer
      MINT_ADDRESS, // mint public key
      payer.publicKey, // current mint authority
      AuthorityType.MintTokens,
      mintAuthPda, // new authority (PDA)
      [],
      {},
      TOKEN_2022_PROGRAM_ID
    )

    console.log('\n✅ Authority transferred successfully!')
    console.log('Transaction signature:', txSig)

    // 5️⃣ (Optional) Verify
    const mintInfo = await getMint(connection, MINT_ADDRESS)
    console.log('Current mint authority:', mintInfo.mintAuthority.toBase58())
  }

  main().then(() => console.log('\n✨ Done')).catch((err) => console.error(err))