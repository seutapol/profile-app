import * as anchor from "@anchor-lang/core";
import { Program } from "@anchor-lang/core";
import { PublicKey } from "@solana/web3.js";
import * as fs from "fs";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const idl = JSON.parse(
    fs.readFileSync("target/idl/profile_app.json", "utf8")
  );
  const program: any = new Program(idl, provider);

  const owner = provider.wallet.publicKey;
  const [profilePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("profile"), owner.toBuffer()],
    program.programId
  );
  console.log("Program Id:", program.programId.toBase58());
  console.log("Owner:", owner.toBase58());
  console.log("Profile PDA:", profilePda.toBase58());

  const existing = await program.account.profile.fetchNullable(profilePda);
  if (!existing) {
    const tx = await program.methods
      .createProfile("Anel", "Учусь разработке на Solana")
      .accounts({ owner, profile: profilePda })
      .rpc();
    console.log("createProfile tx:", tx);
  } else {
    console.log("Профиль уже создан");
  }

  const tx2 = await program.methods
    .updateProfile("Anel", "Обновила описание профиля")
    .accounts({ owner, profile: profilePda })
    .rpc();
  console.log("updateProfile tx:", tx2);

  const profile = await program.account.profile.fetch(profilePda);
  console.log("name =", profile.name);
  console.log("bio =", profile.bio);
  console.log("owner =", profile.owner.toBase58());
}

main().catch(console.error);