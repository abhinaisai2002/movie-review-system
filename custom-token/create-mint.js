import {
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
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
} from '@solana/spl-token'
import { pack } from '@solana/spl-token-metadata'
import bs58 from 'bs58'

const PRIVATE_KEY = '2mKa6TKmSRTpnaQduMvfYkhrZgwUqiWYhW97VCPJPVxufV9ZvgDyapXKMK7gCbFAHtoHtQeazrEcUq2ZSFRVBWST'

async function main() {
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')

  const authority  = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY))

  const mint = Keypair.generate()

  const metadata = {
    mint: mint.publicKey,
    name: 'ABHINAI_TOKEN',
    symbol: 'AST',
    uri: 'https://raw.githubusercontent.com/abhinaisai2002/dict/main/meta.json',
    additionalMetadata: [['description', 'Only Possible On Solana']],
  }

  // Size of metadata
  const metadataLen = pack(metadata).length

  // Size of MetadataExtension 2 bytes for type, 2 bytes for length
  const metadataExtension = TYPE_SIZE + LENGTH_SIZE

  // metadata pointer extension size
  const spaceWithoutMetadataExtension = getMintLen([ExtensionType.MetadataPointer])

  // Calculate rent exemption
  const lamportsForMint = await connection.getMinimumBalanceForRentExemption(
    spaceWithoutMetadataExtension + metadataLen + metadataExtension,
  )

  console.log(spaceWithoutMetadataExtension,spaceWithoutMetadataExtension + metadataLen + metadataExtension )

  // Create account for the mint
  const createMintAccountIx = SystemProgram.createAccount({
    fromPubkey: authority.publicKey,
    newAccountPubkey: mint.publicKey,
    space: spaceWithoutMetadataExtension,
    lamports: lamportsForMint,
    programId: TOKEN_2022_PROGRAM_ID,
  })

  const initializeMetadataPointerIx = createInitializeMetadataPointerInstruction(
    mint.publicKey, // mint account
    authority.publicKey, // authority
    mint.publicKey, // metadata address
    TOKEN_2022_PROGRAM_ID,
  )
  // Initialize mint account
  const initializeMintIx = createInitializeMintInstruction(
    mint.publicKey, // mint
    9, // decimals
    authority.publicKey, // mint authority
    authority.publicKey, // freeze authority
    TOKEN_2022_PROGRAM_ID,
  )
  const initializeMetadataIx = createInitializeInstruction({
    programId: TOKEN_2022_PROGRAM_ID,
    mint: mint.publicKey,
    metadata: mint.publicKey,
    mintAuthority: authority.publicKey,
    name: 'ABHINAI_TOKEN',
    symbol: 'AST',
    uri: metadata.uri,
    updateAuthority: authority.publicKey,
  })

  const tx = new Transaction().add(
    createMintAccountIx,
    initializeMetadataPointerIx,
    initializeMintIx,
    initializeMetadataIx,
  )

  // Send and confirm transaction
  await sendAndConfirmTransaction(connection, tx, [authority, mint])

  console.log('Mint Address:', mint.publicKey.toBase58())
}

main().catch((err) => {
  console.error(err)
})
