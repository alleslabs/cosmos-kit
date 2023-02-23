import "../style/test-style.css";

import { Chain } from "@chain-registry/types";
import { ChakraProvider } from "@chakra-ui/react";
import { Decimal } from "@cosmjs/math";
import { GasPrice } from "@cosmjs/stargate";
import { wallets as cosmostationWallets } from "@cosmos-kit/cosmostation";
import { wallets as keplrWallets } from "@cosmos-kit/keplr";
import { wallets as leapWallets } from "@cosmos-kit/leap";
import { wallets as terraWallets } from "@cosmos-kit/terra-extension";
import { wallets as xdefiWallets } from "@cosmos-kit/xdefi-extension";
import { wallets as omniWallets } from "@cosmos-kit/omni";
import { wallets as trustWallets } from "@cosmos-kit/trust";
import { ChainProvider, defaultTheme } from "@cosmos-kit/react";
import { wallets as vectisWallets } from "@cosmos-kit/vectis";
import { assets, chains } from "chain-registry";
import { terra2testnet, terra2testnetAssets } from "../config/terra2testnet";
import type { AppProps } from "next/app";
import { WalletViewProps } from "@cosmos-kit/core";

// const ConnectedView = ({ onClose, onReturn, wallet }: WalletViewProps) => {
//   const {
//     walletInfo: { prettyName },
//     username,
//     address,
//   } = wallet;

//   return <div>{`${prettyName}/${username}/${address}`}</div>;
// };

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={defaultTheme}>
      <ChainProvider
        // used when testing add-chain
        // chains={chains.filter((chain) => chain.chain_name !== "cosmoshub")}
        // assetLists={assets.filter(
        //   (assets) => assets.chain_name !== "cosmoshub"
        // )}
        chains={[...chains, terra2testnet]}
        assetLists={[...assets, terra2testnetAssets]}
        wallets={[
          ...keplrWallets,
          // ...cosmostationWallets,
          // ...leapWallets,
          // ...vectisWallets,
          // ...xdefiWallets,
          // ...omniWallets,
          // ...trustWallets,
          ...terraWallets,
        ]}
        defaultNameService={"stargaze"}
        walletConnectOptions={{
          signClient: {
            projectId: "a8510432ebb71e6948cfd6cde54b70f7",
            relayUrl: "wss://relay.walletconnect.org",
          },
        }}
        signerOptions={{
          signingStargate: (chain: Chain) => {
            switch (chain.chain_name) {
              case "osmosis":
                return {
                  gasPrice: new GasPrice(Decimal.zero(1), "uosmo"),
                };
              default:
                return void 0;
            }
          },
        }}
        logLevel={"TRACE"}
        wrappedWithChakra={true}
        // modalViews={{
        //   Connected: ConnectedView,
        // }}
      >
        <Component {...pageProps} />
      </ChainProvider>
    </ChakraProvider>
  );
}

export default MyApp;
