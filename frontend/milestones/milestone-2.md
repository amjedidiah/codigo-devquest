# Milestone 2 Implementation Guide: Advanced dApp Features

> Objective: Evolve the Solana Memo dApp by implementing advanced features including memo retrieval and filtering, audio memo capabilities, dynamic network switching, and Progressive Web App (PWA) support. This guide continues to enforce the strict architectural and testing standards from [Milestone 1](./milestone-1.md).

## Component Hierarchy & Architecture

The application will be restructured to support the new features, promoting better state management and component composition as guided by the [thinking-in-react.mdc](../../.cursor/rules/thinking-in-react.mdc) principles.

```bash
App.tsx (Root Application)
├── SolanaProvider (Manages Solana connection & wallet state)
│   └── Main Application Container
│       ├── AppHeader
│       │   ├── NetworkSwitcher
│       │   └── WalletConnect
│       ├── MemoForm (Enhanced for Text & Audio Memos)
│       │   ├── AudioRecorder (New)
│       │   └── StatusDisplay
│       └── MemoFeed (New)
│           ├── SearchBar (New)
│           ├── DateFilter (New)
│           ├── MemoList (New)
│           │   └── MemoItem (Enhanced for Audio Playback)
│           └── Pagination (New)
```

**Data Flow:**

- `App.tsx` → Manages global context providers.
- `SolanaProvider` → A new abstraction to encapsulate all Solana-related contexts (`ConnectionProvider`, `WalletProvider`) and network state.
- `AppHeader` → A new layout component for top-level controls.
- `NetworkSwitcher` → Allows users to switch between Solana networks (devnet, mainnet-beta).
- `MemoForm` → Updated to handle both text and audio memo submissions.
- `AudioRecorder` → A new component to manage audio recording via the browser's MediaRecorder API.
- `MemoFeed` → A new container component to display and manage the list of memos.
- `MemoList` → Renders the list of memos, fetched based on the connected wallet.
- `MemoItem` → Updated to conditionally render a text memo or an HTML5 audio player for audio memos.
- `SearchBar`, `DateFilter`, `Pagination` → Controls for filtering and navigating the memo list.

**Hook Responsibilities:**

- `useNetwork` → (New) Manages the current Solana network and provides a function to switch it.
- `useMemoForm` → (Updated) Logic extended to handle audio recording, IPFS upload, and submitting the IPFScid as a memo.
- `useMemoFeed` → (New) Handles fetching memos for the connected wallet, client-side searching, filtering by date, and pagination logic.

## Phase 1: New Dependencies & Setup

- [x] 1. **Install PWA Plugin**: Add `vite-plugin-pwa` to enable PWA capabilities.
- [x] 2. **Install IPFS Client**: Add an IPFS client library (e.g., `kubo-rpc-client` or a wrapper for a pinning service like Pinata) to handle audio file uploads.
- [x] 3. **Install Date Management Library**: Add a library like `date-fns` to assist with date filtering logic.

## Phase 2: Feature 1 - Memo Retrieval & Display

This phase focuses on fetching and displaying existing memos for the connected wallet, following the TDD workflow from [component-creation.mdc](../../.cursor/rules/component-creation.mdc).

### 🔴 Phase 2 RED Phase: Write Failing Tests

- [ ] 1. Create `MemoFeed.test.tsx`. Write tests for:
  - Rendering loading, error, and success states.
  - Displaying a list of memos when data is available.
  - Showing an empty state message when no memos are found.

- [ ] 2. Create tests for `SearchBar`, `DateFilter`, and `Pagination` components to ensure they render and respond to user input.

- [ ] 3. In `MemoFeed.test.tsx`, write integration tests for:
  - Filtering the memo list when a search term is entered.
  - Filtering the memo list when a date range is selected.
  - Updating the memo list when pagination controls are used.

### 🟢 Phase 2 GREEN Phase: Minimal Implementation

- [ ] 1. **Create `useMemoFeed.ts` hook**: Implement logic to:
  - Fetch all transactions for the connected wallet's public key using `connection.getSignaturesForAddress()`.
  - Parse transactions to find and decode memos from the SPL Memo Program.
  - Manage state for `memos`, `isLoading`, `error`, `searchTerm`, `dateRange`, and `currentPage`.
  - Expose functions to update filters and handle pagination.

- [ ] 2. **Create `MemoFeed`, `MemoList`, `MemoItem` Components**: Build the UI to display the memos. `MemoItem` will initially only display text.

- [ ] 3. **Create `SearchBar`, `DateFilter`, `Pagination` Components**: Build the UI controls for filtering and pagination.

- [ ] 4. **Create `memo-feed.css` and other required CSS files**: Style all new components using Tailwind CSS via `@apply`, ensuring selectors are based on accessible attributes.

### 🔵 Phase 2 REFACTOR Phase: Optimize

- [ ] 1. Optimize memo fetching with caching to prevent redundant RPC calls.

- [ ] 2. Use `useMemo` and `useCallback` to prevent unnecessary re-renders in the `MemoFeed` and its children.

- [ ] 3. Consider implementing list virtualization if performance degrades with a large number of memos.

## Phase 3: Feature 2 - Audio Memos

### 🔴 Phase 3 RED Phase: Write Failing Tests

- [ ] 1. Create `AudioRecorder.test.tsx` and write tests for:
  - Start, stop, and cancel recording actions.
  - Visual feedback during the recording state.

- [ ] 2. Update `MemoForm.test.tsx` to test:
  - The new UI for switching between text and audio memo.
  - The flow of recording audio and submitting the form.

- [ ] 3. Update `MemoItem.test.tsx` to test:
  - Conditional rendering of an `<audio>` player when the memo is detected as an IPFS link.

### 🟢 Phase 3 GREEN Phase: Minimal Implementation

- [ ] 1. **Create `AudioRecorder.tsx` component**:
  - Use the `MediaRecorder` browser API to capture audio.
  - Provide UI controls for recording.

- [ ] 2. **Update `useMemoForm.ts` hook**:
  - Add logic to handle the `AudioRecorder` state.
  - On submission of an audio memo, upload the recorded audio blob to IPFS.
    - **CRITICAL**: The IPFS upload logic must be handled securely. API keys for pinning services must not be exposed on the client-side. This may require a serverless function proxy.
  - Take the returned IPFS CID and submit it as a memo transaction.

- [ ] 3. **Update `MemoForm.tsx`**: Add UI elements to toggle between text input and the `AudioRecorder`.

- [ ] 4. **Update `MemoItem.tsx`**: Implement logic to check if a memo string is an IPFS link and render an `<audio>` tag with the appropriate gateway URL if it is.

### 🔵 Phase 3 REFACTOR Phase: Improve UX & Error Handling

- [ ] 1. Add robust error handling for recording failures (e.g., no microphone permission) and IPFS upload errors.

- [ ] 2. Refine the audio recorder UI/UX for clarity and ease of use.

## Phase 4: Feature 3 - Network Switcher

### 🔴 Phase 4 RED Phase: Write Failing Tests

- [ ] 1. Create `NetworkSwitcher.test.tsx`. Write tests for:
  - Rendering the switcher with available networks (devnet, mainnet-beta).
  - Verifying that selecting a new network triggers the context update.

### 🟢 Phase 4 GREEN Phase: Minimal Implementation

- [ ] 1. **Create `useNetwork.ts` hook & context**:
  - Create a new React context to manage the network state (`endpoint`, `networkName`).
  - The hook will provide the current network and a function `setNetwork` to update it.

- [ ] 2. **Create `NetworkSwitcher.tsx` component**:
  - A simple dropdown/select UI that displays network options.
  - On change, it calls the `setNetwork` function from the `useNetwork` hook.

- [ ] 3. **Create `SolanaProvider.tsx` wrapper**(iff it doesn't exist):
  - This new component will wrap `ConnectionProvider` and `WalletProvider`.
  - It will use the state from the `useNetwork` hook to dynamically set the `endpoint` for `ConnectionProvider`.

- [ ] 4. **Update `App.tsx`**: Replace the direct use of providers with the new `SolanaProvider`. Add the `NetworkSwitcher` to a new `AppHeader` component.

### 🔵 Phase 4 REFACTOR Phase: Ensure Seamless Transition

- [ ] 1. Verify that all components that depend on the connection (e.g., `MemoFeed`, `MemoForm`) correctly reset or refetch data when the network changes.

- [ ] 2. Ensure the wallet adapter handles network changes gracefully.

## Phase 5: Feature 4 - PWA Support

- [ ] 1. **Configure `vite.config.ts`**:
  - Import `VitePWA` from `vite-plugin-pwa`.
  - Add the `VitePWA` plugin to the `plugins` array with a basic configuration (manifest details, icons, etc.).

- [ ] 2. **Create Public Assets**: Add the required app icons and a `manifest.webmanifest` file in the `public` directory.

- [ ] 3. **Verify Service Worker**: Run a production build and serve it locally. Use browser developer tools to confirm the service worker is registered and active.

- [ ] 4. **Lighthouse Audit**: Run a Lighthouse audit to ensure the app meets PWA installability criteria.

## Phase 6: Final Testing & Verification

- [ ] 1. **End-to-End Testing**:
  - Test the full user flow on `devnet`: connect wallet, switch network, submit a text memo, submit an audio memo, view all memos, filter and search memos.

- [ ] 2. **Accessibility Audit**: Re-run accessibility checks for all new components.

- [ ] 3. **Responsive Design Check**: Verify the new components are fully responsive across various screen sizes.

- [ ] 4. **Update Documentation**: Update `README.md` with information about the new features, required environment variables (e.g., for an IPFS pinning service), and setup instructions.

### Critical Success Criteria

- [ ] All new and existing tests pass.
- [ ] Components follow strict separation of concerns
- [ ] Error handling covers all failure scenarios
- [ ] Memo feed correctly displays all text and audio memos from the connected wallet.
- [ ] Search, filter, and pagination functions work as expected.
- [ ] Users can successfully record, upload, and submit audio memos.
- [ ] Network switching is seamless and updates the application state correctly.
- [ ] The application is fully installable as a PWA.
- [ ] All new UI components have full keyboard and screen reader accessibility
- [ ] No sensitive keys are exposed on the frontend.
- [ ] Proper memoization of expensive computations
- [ ] No waterfall loading (parallel data fetching)
- [ ] Minimal bundle size with tree-shaking

## Implementation Notes

- Follow TDD strictly: Red → Green → Refactor
- One component per file, proper file structure
- Use accessible selectors, never data-testid
- Mock only external dependencies with clear justification
- Maintain pure components with logic in custom hooks
- Never expose private keys in frontend code
- Use environment variables for RPC endpoints in production
- Implement proper error handling
