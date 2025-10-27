import {
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
  PublicKey,
} from '@solana/web3.js'
import {
  TOKEN_2022_PROGRAM_ID,
  createInitializeMintInstruction,
  createInitializeAccountInstruction,
  createInitializeMetadataPointerInstruction,
  getMintLen,
  getAccountLen,
  TYPE_SIZE,
  ExtensionType,
  createInitializeInstruction,
  LENGTH_SIZE,
  createAssociatedTokenAccount,
  mintTo,
} from '@solana/spl-token'
import { pack } from '@solana/spl-token-metadata'
import bs58 from 'bs58'

const PRIVATE_KEY = '2mKa6TKmSRTpnaQduMvfYkhrZgwUqiWYhW97VCPJPVxufV9ZvgDyapXKMK7gCbFAHtoHtQeazrEcUq2ZSFRVBWST'

// ATA: FKkomGgnqUat3WDMtXiquevPZuV9TLnkn6nyqRHXM4H7

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')

const authority = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY))

const mint = new PublicKey("8Jv5UC3tUGXSe1MpPBJpdLAbeniWkP18M3cyYirLZ9Nt");

// const ata = await createAssociatedTokenAccount(
//     connection,
//     authority,
//     mint,
//     authority.publicKey,
//     {
//         commitment: 'confirmed',
//     },
//     TOKEN_2022_PROGRAM_ID,
// )

const ata = new PublicKey("FKkomGgnqUat3WDMtXiquevPZuV9TLnkn6nyqRHXM4H7");

const mintTx = mintTo(
    connection,
    authority,
    mint,
    ata,
    authority,
    1000000000 * 100000000, // Amount to mint (in smallest unit, e.g., if decimals=9, this is 1 token)
    [],
    {
        commitment: 'confirmed',
    },
    TOKEN_2022_PROGRAM_ID,
)

console.log("Associated Token Account:", ata.toString())