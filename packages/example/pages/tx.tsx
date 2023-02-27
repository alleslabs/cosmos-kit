/* eslint-disable no-alert */
import { Asset, AssetList } from "@chain-registry/types";
import { Center, Container } from "@chakra-ui/react";
import { StdFee } from "@cosmjs/amino";
import { SigningStargateClient } from "@cosmjs/stargate";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useChain } from "@cosmos-kit/react";
import BigNumber from "bignumber.js";
import { assets } from "chain-registry";
import { cosmos } from "juno-network";
import { useState, useEffect } from "react";

import { ChainsTXWalletSection, SendTokensCard } from "../components";

const chainName = "terra2testnet";

const sendTokens = (
  getSigningStargateClient: () => Promise<SigningStargateClient>,
  getSigningCosmWasmClient: () => Promise<SigningCosmWasmClient>,
  setResp: (resp: string) => any,
  address: string
) => {
  return async () => {
    const stargateClient = await getSigningStargateClient();
    if (!stargateClient || !address) {
      console.error("stargateClient undefined or address undefined.");
      return;
    }

    const cosmClient = await getSigningCosmWasmClient();
    if (!cosmClient || !address) {
      console.error("cosmClient undefined or address undefined.");
      return;
    }

    // const { send } = cosmos.bank.v1beta1.MessageComposer.withTypeUrl;

    // const msg = send({
    //   amount: [
    //     {
    //       denom: "uluna",
    //       amount: "1000",
    //     },
    //   ],
    //   toAddress: address,
    //   fromAddress: address,
    // });

    // const fee: StdFee = {
    //   amount: [
    //     {
    //       denom: "uluna",
    //       amount: "16536",
    //     },
    //   ],
    //   gas: "110239",
    // };

    const fee: StdFee = {
      amount: [
        {
          denom: "uluna",
          amount: "60980",
        },
      ],
      gas: "406453",
    };

    // const msg = {
    //   app: {},
    //   base: {
    //     ans_host_address:
    //       "terra1dnmk4qdcv9h52wjus0wgx5uc8ewtntc2q0vt4n2dlxty8j2xhyrsmynhtg",
    //     version_control_address:
    //       "terra1d7ud0c3prk5j7mhpndnkvxe4xmltj2gvgxrz2l0a49ehvneu7e3s5nsakt",
    //   },
    // };

    try {
      // const response = await cosmClient.instantiate(
      //   address,
      //   6752,
      //   msg,
      //   "test",
      //   fee
      // );

      const response = await cosmClient.execute(
        address,
        "terra13c0t7k49ea6rvccfkzfkhrcklcrp283wfjsjqrnm8trepgzuwtsqp2mllj",
        {
          migrate: {},
        },
        fee
      );

      // const response = await stargateClient.signAndBroadcast(
      //   address,
      //   [msg],
      //   fee
      // );
      setResp(JSON.stringify(response, null, 2));
    } catch (error) {
      console.error(error);
    }
  };
};

export default function Home() {
  const {
    getSigningStargateClient,
    getSigningCosmWasmClient,
    address,
    status,
    getRpcEndpoint,
  } = useChain(chainName);

  const [balance, setBalance] = useState(new BigNumber(0));
  const [isFetchingBalance, setFetchingBalance] = useState(false);
  const [resp, setResp] = useState("");
  const getBalance = async () => {
    if (!address) {
      setBalance(new BigNumber(0));
      setFetchingBalance(false);
      return;
    }

    let rpcEndpoint = await getRpcEndpoint();

    // get RPC client
    const client = await cosmos.ClientFactory.createRPCQueryClient({
      rpcEndpoint,
    });

    // fetch balance
    const balance = await client.cosmos.bank.v1beta1.balance({
      address,
      denom: "uluna",
    });

    // show balance in display values by exponentiating it
    const a = new BigNumber(balance.balance?.amount || 0);
    const amount = a.multipliedBy(10 ** -6);
    setBalance(amount);
    setFetchingBalance(false);
  };

  useEffect(() => {
    getBalance();
  }, [address]);

  return (
    <Container maxW="5xl" py={10}>
      <ChainsTXWalletSection chainName={chainName} />

      <Center mb={16}>
        <SendTokensCard
          isConnectWallet={status === "Connected"}
          balance={balance.toNumber()}
          isFetchingBalance={isFetchingBalance}
          response={resp}
          sendTokensButtonText="Send Tokens"
          handleClickSendTokens={sendTokens(
            getSigningStargateClient as () => Promise<SigningStargateClient>,
            getSigningCosmWasmClient as () => Promise<SigningCosmWasmClient>,
            setResp as () => any,
            address as string
          )}
          handleClickGetBalance={() => {
            setFetchingBalance(true);
            getBalance();
          }}
        />
      </Center>
    </Container>
  );
}
