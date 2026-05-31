import { createConfig, http, injected } from "wagmi";
import { sepolia } from "wagmi/chains";

export const walletConfig = createConfig({
  ssr: true,
  chains: [sepolia],
  connectors: [
    injected({
      target: "metaMask",
    }),
  ],
  transports: {
    [sepolia.id]: http(),
  },
});

export const supportedChain = sepolia;
