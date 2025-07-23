# Implementation Guide: Solana Memo dApp Frontend

> Objective: Build a React frontend for the Solana Memo dApp following strict architectural patterns and accessibility standards. Each step must be completed sequentially with proper verification.

## Phase 1: Project Setup & Initialization

- [x] 1. Create the React Application with TypeScript template

- [x] 2. Install all Solana and wallet-adapter packages: `@solana/web3.js`, `@coral-xyz/anchor`, `@solana/wallet-adapter-react`, `@solana/wallet-adapter-react-ui`, `@solana/wallet-adapter-base`, `@solana/wallet-adapter-wallets`

- [x] 3. Create Directory Structure following the file structure [rules](../.cursor/rules/component-creation.mdc):
  - `/src/components/StatusDisplay/`
  - `/src/components/WalletConnect/`
  - `/src/components/MemoForm/`

- [x] 4. Generate IDL file.
  > Ran `anchor build` from project root(`../`) to generate IDL file in `../target/idl/anchor_spl_memo.json`

- [x] 5. Install Testing Dependencies: `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, and `vitest` for component testing following the testing rules

- [x] 6. Vitest replacement

- [x] 7. Tailwind Setup with Vite

## Phase 2: Component Implementation (Bottom-Up TDD)

### 🔴 RED Phase: Write Failing Tests First

- [ ] 1. Create StatusDisplay Test Suite in `src/components/StatusDisplay/StatusDisplay.test.tsx`. Write failing tests for:
  - Loading state display with role="status"
  - Error message display with role="alert"
  - Success state with transaction link
  - Null render when no props provided

  > Use getByRole, avoid data-testid

- [ ] 2. Create WalletConnect Test Suite in `src/components/WalletConnect/WalletConnect.test.tsx` Write failing tests for:
  - Wallet button renders correctly
  - Component integrates with wallet provider context

  > Mock wallet adapter components (CRITICAL: external library)

- [ ] 3. Create MemoForm Test Suite in `src/components/MemoForm/MemoForm.test.tsx`. Write failing tests for:
  - Form renders with textarea and submit button
  - Submit button disabled when wallet not connected
  - Input value updates on user typing
  - Form submission triggers Solana transaction
  - Loading states during transaction
  - Success/error feedback display

  > Mock Solana hooks (CRITICAL: external blockchain calls)

### 🟢 GREEN Phase: Minimal Implementation

- [ ] 1. Implement StatusDisplay Component in `src/components/StatusDisplay/StatusDisplay.tsx`. It is a pure presentational component with:
  - Conditional rendering based on props (loading, error, txSignature)
  - Proper semantic HTML with role attributes
  - External link to Solana Explorer
  - Zero layout shift design
  - Import corresponding CSS file (to be created and implemented below)

- [ ] 2. Create StatusDisplay Styles in `src/components/StatusDisplay/status-display.css`
  - Use `@apply` with Tailwind classes as shown in [index.css](./src/index.css)
  - Root selector: component's aria-label
  - Child selectors: [role="status"], [role="alert"], links
  - Consistent spacing to prevent layout shift

- [ ] 3. Create StatusDisplay Hook in `src/components/StatusDisplay/useStatusDisplay.ts`
  - Return object with computed display values
  - Handle URL construction for different networks
  - Type definitions for props interface

- [ ] 4. Implement WalletConnect Component in `src/components/WalletConnect/WalletConnect.tsx`. It is a pure component wrapping `WalletMultiButton`
  - Proper semantic container with aria-label
  - Import corresponding CSS file (to be created and implemented below)

- [ ] 5. Create WalletConnect Styles in `src/components/WalletConnect/wallet-connect.css`
  - Positioning and layout using @apply
  - Responsive design considerations
  - Integration with wallet adapter default styles

- [ ] 6. Create WalletConnect Hook in `src/components/WalletConnect/useWalletConnect.ts`
  - Minimal hook returning wallet connection state
  - Integration with `useWallet` hook from adapter

- [ ] 7. Implement MemoForm Component in `src/components/MemoForm/MemoForm.tsx`. It is a pure component receiving all data/handlers from hook
  - Form with semantic HTML: textarea, submit button
  - Proper aria-labels and form structure
  - Conditional rendering for wallet connection state
  - Integration with StatusDisplay child component
  - Import corresponding CSS file (to be created and implemented below)

- [ ] 8. Create MemoForm Styles in `src/components/MemoForm/memo-form.css`
  - Form layout using CSS Grid/Flexbox with `@apply`
  - Input styling with focus states
  - Button states (enabled/disabled/loading)
  - Responsive design for mobile/desktop
  - Loading state animations

- [ ] 9. Create MemoForm Hook in `src/components/MemoForm/useMemoForm.ts`
  - Import IDL from `../target/idl/anchor_spl_memo.json`
  - State management: memoText, isLoading, txSignature, error
  - Integration with useWallet and useConnection hooks
  - Anchor program setup using imported IDL and Program ID
  - Transaction building with proper account mapping (payer, memoProgram)
  - Event handlers: handleInputChange, handleSubmit
  - Error handling and loading state management
  - Return object with all state and handlers for component

### 🔵 REFACTOR Phase: Optimize Implementation

- [ ] 1. Optimize Performance. Add `memo`, `useMemo`/`useCallback` optimizations where needed
  - Implement proper TypeScript interfaces
  - Add error boundaries if necessary
  - Optimize re-render patterns

## Phase 3: Application Assembly

- [ ] 1. Configure [App.tsx](./src/App.tsx)
  - Setup Solana context providers:
    - ConnectionProvider with **devnet** endpoint
    - WalletProvider with wallet adapters (PhantomWalletAdapter, SolflareWalletAdapter)
    - WalletModalProvider for connection UI
  - Component hierarchy assembly
  - **CRITICAL**: Import wallet adapter default styles: `require('@solana/wallet-adapter-react-ui/styles.css')`
  - Import custom App CSS file (to be created and implemented below)

- [ ] 2. Create Application Styles in `src/App.css`
  - Global layout and theme
  - Dark mode design for Solana aesthetic
  - Responsive container design
  - Button and input base styles
  - Link styling for consistency

- [ ] 3. Configure Constants in `src/constants.ts` for:
  - Program ID from [generated IDL](../target/idl/anchor_spl_memo.json)
  - Memo program ID constant: `MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`
  - Network configuration (devnet cluster URL)
  - Solana Explorer URLs for different networks

## Phase 4: Testing & Verification

- [ ] 1. Run Test Suite. Execute all tests and verify 100% pass rate
  - Check test coverage meets requirements
  - Verify no console errors or warnings

- [ ] 2. Accessibility Audit. Test keyboard navigation
  - Verify screen reader compatibility
  - Check color contrast ratios
  - Validate semantic HTML structure

- [ ] 3. Performance Verification. Start development server
  - Test wallet connection flow
  - Verify zero layout shift during loading states
  - Check responsive design on multiple screen sizes

- [ ] 4. Integration Testing. Connect wallet on devnet
  - Test memo submission end-to-end
  - Verify transaction confirmation
  - Test error scenarios (network issues, insufficient funds)

## Phase 5: Documentation & Deployment Prep

- [ ] 1. Update README. Add setup instructions
  - Document component architecture
  - Include testing commands
  - Add deployment considerations

- [ ] 2. Environment Configuration. Setup environment variables for:
  - RPC endpoints
  - Program IDs
  - Network selection

- [ ] 3. Build Verification. Run production build for frontend. Look into [package.json](frontend/package.json) for help
  - Verify no build errors
  - Test production bundle locally

### Critical Success Criteria

- [ ] All tests pass with accessible selectors only
- [ ] Zero layout shift during all state transitions
- [ ] Components follow strict separation of concerns
- [ ] Full keyboard and screen reader accessibility
- [ ] Integration with Solana devnet works end-to-end
- [ ] Error handling covers all failure scenarios
- [ ] No waterfall loading (parallel data fetching)
- [ ] Proper memoization of expensive computations
- [ ] Minimal bundle size with tree-shaking

## Implementation Notes

- Follow TDD strictly: Red → Green → Refactor
- One component per file, proper file structure
- Use accessible selectors, never data-testid
- Mock only external dependencies with clear justification
- Maintain pure components with logic in custom hooks
- Never expose private keys in frontend code
- Use environment variables for RPC endpoints in production
- Implement proper error handling for transaction failures
