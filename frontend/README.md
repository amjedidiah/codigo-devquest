# Solana Memo dApp Frontend

This project is a React-based frontend for a Solana memo-writing decentralized application.
It allows users to connect their Solana wallet and submit a short memo to the blockchain.
The application is built with Vite, React, TypeScript, and Tailwind CSS, and it interacts with a Solana program built with Anchor.

## Component Architecture

The application follows a strict separation of concerns, with UI components kept pure and all logic and state management handled by custom hooks.

```bash
App.tsx (Root Application)
├── ConnectionProvider (Solana RPC connection)
├── WalletProvider (Wallet adapter context)
└── WalletModalProvider (Wallet connection UI)
    └── Main Application Container
        ├── WalletConnect (Pure component)
        │   └── useWalletConnect (Connection state hook)
        └── MemoForm (Pure form component)
            ├── useMemoForm (Transaction logic hook)
            └── StatusDisplay (Pure status component)
                └── useStatusDisplay (Status computation hook)
```

## Setup and Installation

This project uses `pnpm` as its package manager.

1. **Clone the repository:**

    ```bash
        git clone <repository-url>
        cd codigo-devquest/frontend
    ```

2. **Install dependencies:**

    ```bash
        pnpm install
    ```

3. **Environment Variables:**

    Create a `.env` file in the `frontend` directory and add the following variables. This file will store your environment-specific configurations.

    ```bash
        VITE_MEMO_PROGRAM_ID=
        VITE_ANCHOR_SPL_MEMO_PROGRAM_ID=
        VITE_SOLANA_NETWORK=
        VITE_SOLANA_RPC_ENDPOINT=
    ```

    - `VITE_MEMO_PROGRAM_ID`: The Program ID of the SPL Memo program.
    - `VITE_ANCHOR_SPL_MEMO_PROGRAM_ID`: The on-chain ID of the deployed Anchor program.
    - `VITE_SOLANA_NETWORK`: The Solana network to use (e.g., `devnet`, `testnet`, or `mainnet-beta`).
    - `VITE_SOLANA_RPC_ENDPOINT`: The custom URL of the Solana RPC endpoint (e.g., `https://api.devnet.solana.com`).

## Available Scripts

### `pnpm dev`

Runs the app in development mode.
Open <http://localhost:5173> (or the port specified in your terminal) to view it in the browser. The page will automatically reload if you make edits.

### `pnpm test`

Runs the component and hook tests using Vitest in the terminal.

### `pnpm build`

Builds the app for production to the `dist` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.
The build is minified, and the filenames include hashes.

## Deployment Considerations

- **Environment Variables**: Before deploying, ensure that your production environment is configured with the correct `VITE_MEMO_PROGRAM_ID`, `VITE_ANCHOR_SPL_MEMO_PROGRAM_ID`, `VITE_SOLANA_NETWORK`, and `VITE_SOLANA_RPC_ENDPOINT`. Do not expose sensitive information or private keys in your frontend code.
- **RPC Endpoint**: For a production application, it is highly recommended to use a dedicated, reliable RPC provider instead of the public devnet endpoint to ensure performance and stability.
- **Build Verification**: After running `pnpm build`, you can test the production bundle locally by running `pnpm preview`. This serves the `dist` folder and allows you to verify that the application works as expected before deploying.
- **Hosting**: The generated `dist` directory is a static build that can be deployed to any static site hosting service like Vercel, Netlify, or GitHub Pages.
