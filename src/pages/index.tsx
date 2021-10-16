import { useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import idl from '../programs/idl.json';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import useWalletBalance from '../hooks/use-wallet-balance';
import Head from 'next/head'

const network = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST;

const { SystemProgram, Keypair } = web3;
const baseAccount = Keypair.generate();
const opts = {
  preflightCommitment: "processed"
}
const programID = new PublicKey(idl.metadata.address);

export default function Home() {
  const [value, setValue] = useState('');
  const [dataList, setDataList] = useState([]);
  const [input, setInput] = useState('');
  const wallet = useWallet()
  const balance = useWalletBalance()
  console.warn(balance)

  async function getProvider() {
    const connection = new Connection(network, opts.preflightCommitment as any);

    const provider = new Provider(
      connection, wallet, opts.preflightCommitment as any,
    );
    return provider;
  }

  async function initialize() {
    const provider = await getProvider();
    const program = new Program(idl as any, programID, provider);
    try {
      await program.rpc.initialize("Hello World", {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });

      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      console.log('account: ', account);
      setValue(account.data.toString());
      setDataList(account.dataList);
    } catch (err) {
      console.log("Transaction error: ", err);
    }
  }

  async function update() {
    if (!input) return
    const provider = await getProvider();
    const program = new Program(idl as any, programID, provider);
    await program.rpc.update(input, {
      accounts: {
        baseAccount: baseAccount.publicKey
      }
    });

    const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    console.log('account: ', account);
    setValue(account.data.toString());
    setDataList(account.dataList);
    setInput('');
  }

  if (!wallet.connected) {
    return (
      <>
      <Head>
          <title>SOLANA STARTER APP NEXTJS + TAILWINDCSS</title>
          <meta name="description" content="SOLANA STARTER APP NEXTJS + TAILWINDCSS" />
        </Head>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
        <WalletMultiButton />
      </div>
      </>
    )
  } else {
    return (
      <div>
        <Head>
          <title>SOLANA STARTER APP NEXTJS + TAILWINDCSS</title>
          <meta name="description" content="SOLANA STARTER APP NEXTJS + TAILWINDCSS" />
        </Head>
        <div>
          {
            !value && (<button onClick={initialize}>Initialize</button>)
          }

          {
            value ? (
              <div>
                <h2>Current value: {value}</h2>
                <input
                  placeholder="Add new data"
                  onChange={e => setInput(e.target.value)}
                  value={input}
                />
                <button onClick={update}>Add data</button>
              </div>
            ) : (
              <h3>Please Inialize.</h3>
            )
          }
          {
            dataList.map((d, i) => <h4 key={i}>{d}</h4>)
          }
        </div>
      </div>
    );
  }
}