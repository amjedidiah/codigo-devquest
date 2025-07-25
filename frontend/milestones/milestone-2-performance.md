# Milestone 2: High-Performance Memo Feed Architecture

> Objective: This document outlines the optimal architectural solution to address the performance and rate-limiting issues encountered during the implementation of the memo feed feature. The proposed solution combines Server-Side Rendering (SSR) with a powerful client-side caching strategy using TanStack Query.

## 1. The Problem: Rate-Limiting and Slow Initial Load

During development, we identified a critical performance bottleneck when fetching memo transactions from the Solana blockchain:

1. **RPC Rate-Limiting**: Public Solana RPC nodes are highly sensitive to concurrent requests. Attempting to fetch transaction details in parallel or in small batches resulted in `429 (Too Many Requests)` errors.
2. **Slow Sequential Fetching**: The reliable solution was to fetch up to 100 transaction details sequentially, one by one, with a delay between each request. This solved the rate-limiting, but resulted in an unacceptably long initial load time for the user (often exceeding 50 seconds).
3. **Wasteful Network Calls**: Fetching all transactions at once is inefficient, as the user may never navigate past the first page of results.

## 2. The Solution: A Phased Approach to High Performance

To solve this, we will adopt a phased architectural rollout. We will first optimize the client-side data handling to be more efficient and provide a better user experience, and then add Server-Side Rendering to achieve an instant initial load time.

### 2.1. Phase 1: Client-Side Optimization with Infinite Query

The first phase focuses on replacing the "fetch-all" strategy with a more intelligent on-demand approach using TanStack Query. This is the most suitable approach because fetching paginated transactions from the Solana RPC is cursor-based (i.e., fetching page `N` requires knowing the last transaction signature from page `N-1`).

- **On-Demand Fetching with `useInfiniteQuery`**: We will refactor our data-fetching hook to use `useInfiniteQuery`. This hook is specifically designed for cursor-based pagination, allowing us to fetch data in pages and seamlessly pass the required "before" signature to the next fetch. We will implement a "Load More" button to trigger the `fetchNextPage` function.
- **Seamless Loading with Pre-fetching**: To avoid a loading state when the user wants to see more data, we will implement a pre-fetching strategy. When the user's viewport nears the end of the current list, or they hover over the "Load More" button, we will silently trigger a fetch for the *next* page's data in the background. When the user actually clicks the button, the data is already in the cache and renders instantly.

### 2.2. Phase 2: Adding Server-Side Rendering (SSR)

Building upon the client-side optimizations, this phase introduces SSR to eliminate the initial loading screen entirely.

- **SSR for Initial Page**: The server will be responsible for fetching only **page 1** of the memo data. It will render the initial HTML with this data already populated.
- **Client-Side Hydration**: The client-side React application will load and "hydrate" the server-rendered markup. `useInfiniteQuery` will be initialized with the page 1 data from the server, preventing any re-fetch.

### 2.3. The Final User Experience Flow

1. **Initial Visit**: The server fetches page 1 and sends a fully rendered HTML page. The user sees the most recent content **instantly**.
2. **Client-Side Hydration**: The app loads. `useInfiniteQuery` is hydrated with the server-fetched data for page 1.
3. **User Interaction**: The user scrolls towards the bottom of the list, triggering a silent **pre-fetch** for page 2.
4. **On-Demand Loading**: The user clicks "Load More". Page 2 renders **instantly** from the cache, and a pre-fetch for page 3 is triggered in the background.
5. **Subsequent Visits**: On any return visit, TanStack Query serves the entire cached list of viewed memos **instantly**, while revalidating for new data in the background ("stale-while-revalidate" pattern).

## 3. Required Architectural Changes

### 3.1. Phase 1 Implementation

1. [ ] **Integrate TanStack Query**: Wrap the application in a `<QueryClientProvider>`.
2. [ ] **Refactor `useMemoFeed`**: Replace the current logic with `useInfiniteQuery`. The hook's `queryFn` will fetch a page of memos, and `getNextPageParam` will extract the last signature to enable the next page fetch.
3. [ ] **Update UI**: Implement a "Load More" button or an intersection observer that calls the `fetchNextPage` function from the hook.
4. [ ] **Implement Pre-fetching**: Add logic to pre-fetch the next page's data based on user intent (e.g., `onMouseEnter` or `IntersectionObserver`).

### 3.2. Phase 2 Implementation

This requires moving from a pure Client-Side Rendered (CSR) application to a hybrid SSR model as described in the [Vite Guide](https://vite.dev/guide/ssr).

1. **Custom `server.js`**: Create a custom server (e.g., using Express) to run Vite in middleware mode.
2. **New Entry Points**: Split the source code into `src/entry-server.tsx` (for server-side logic) and `src/entry-client.tsx` (for client-side hydration).
3. **Updated Build Process**: Update `package.json` with separate `build:client` and `build:server` scripts.

## 4. Benefits of This Approach

- **Instant Perceived Performance**: Drastically reduces the Time to Interactive (TTI) by serving meaningful content immediately via SSR.
- **Optimal User Experience**: Eliminates initial loading spinners and provides a seamless, non-blocking pagination experience via pre-fetching.
- **Efficient Network Usage**: Avoids wasteful API calls by only fetching data on demand as the user needs it.
- **Powerful Caching**: Leverages TanStack Query's aggressive caching and "stale-while-revalidate" patterns.
- **Resilience**: Maintains the robust, sequential fetching logic where it's needed (in the background) without sacrificing frontend performance.

## 5. Documentation Update

- [ ] **Update `README.md`**: After implementing this architecture, the `frontend/README.md` must be updated. The new text should briefly explain the performance architecture and justify the choice of infinite loading over traditional pagination, citing the cursor-based nature of the Solana RPC as the deciding factor. It should also link to this document for a more detailed breakdown, while avoiding unnecessary repetition.
