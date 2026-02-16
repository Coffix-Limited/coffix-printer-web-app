# Printer & Server Subscription Flow

This document describes how the dashboard derives **printer online status** from the **server** collection by subscribing to servers first, then printers, and merging connection state.

## Goal

- **Printers** live in the `printer` Firestore collection (label, location, lineDecorationId, etc.).
- **Servers** (POS devices) live in the `server` collection and reference a printer via `printerDocId` or `printerId`, with a `printerConnected` flag.
- We want each printer’s **`isOnline`** to reflect whether at least one server is currently connected to that printer (`printerConnected === true`), not just the value stored on the printer document.

## Approach

1. **Subscribe to servers first**, then **subscribe to printers** (order matters so we can merge as data arrives).
2. Keep the latest **servers** and **raw printers** in closure/state.
3. On every server or printer update, **merge**: for each printer, set `isOnline` from server connection state.
4. Expose a single **unsubscribe** that cleans up both listeners.

## Implementation

### 1. Merge helper

In **`app/printer/store/usePrinterStore.ts`** we define:

```ts
function mergePrintersWithServers(
  rawPrinters: Printer[],
  servers: PosServer[]
): Printer[] {
  return rawPrinters.map((p) => ({
    ...p,
    isOnline: servers.some(
      (s) =>
        (s.printerDocId === p.id || s.printerId === p.printerId) &&
        s.printerConnected === true
    ),
  }));
}
```

- **Input:** List of printers from Firestore, list of servers from Firestore.
- **Output:** Same printers with `isOnline` overridden.
- **Rule:** A printer is **online** if any server has `printerConnected === true` and references that printer by:
  - `printerDocId === printer.id` (Firestore document ID), or
  - `printerId === printer.printerId` (short/display ID).

### 2. Subscription order in `setPrinters()`

When `setPrinters()` runs (e.g. on dashboard load):

1. **Clean up** any existing server + printer subscriptions.
2. Set `loading: true`, `error: null`.
3. **Subscribe to servers first** via `ServerService.subscribeToServers()`:
   - On server snapshot: update `servers`, then `set({ printers: mergePrintersWithServers(rawPrinters, servers), loading: false, error: null })`.
   - On error: set store error and clear printers.
4. **Subscribe to printers** via `PrinterService.subscribeToPrinters()`:
   - On printer snapshot: update `rawPrinters`, then `set({ printers: mergePrintersWithServers(printerList, servers), loading: false, error: null })`.
   - On error: set store error and clear printers.
5. **Single unsubscribe:** Store a function that calls both `unsubServer()` and `unsubPrinter()` so one `unsubscribe()` cleans up both.

### 3. Closure variables

Inside `setPrinters()` we use two closure variables:

- **`rawPrinters`** – latest printer list from the printer subscription.
- **`servers`** – latest server list from the server subscription.

When the **server** callback runs (possibly before any printer data), we merge `rawPrinters` (may be `[]`) with `servers`. When the **printer** callback runs, we merge the new printer list with the current `servers`. So no matter which subscription fires first or later, the merged list always uses the latest from both.

### 4. No changes to PrinterService or ServerService

- **PrinterService** – Still only subscribes to the `printer` collection and returns printer documents as-is. It does not need to know about servers.
- **ServerService** – Still only subscribes to the `server` collection. The **orchestration and merge** happen in the store.

## Data flow (summary)

```
Firestore "server"  ──► ServerService.subscribeToServers()
        │                              │
        │                    callback(servers)
        │                              │
        │                              ▼
        │                    mergePrintersWithServers(rawPrinters, servers)
        │                              │
        │                              ▼
        │                    set({ printers, loading: false })
        │
Firestore "printer" ──► PrinterService.subscribeToPrinters()
        │                              │
        │                    callback(printers)
        │                              │
        │                              ▼
        │                    mergePrintersWithServers(printers, servers)
        │                              │
        │                              ▼
        └──────────────────► set({ printers, loading: false })
```

## Files involved

| File | Role |
|------|------|
| `app/printer/store/usePrinterStore.ts` | Subscribes to servers then printers, holds merge logic, exposes single `unsubscribe`. |
| `app/server/services/ServerService.ts` | Subscribes to `server` collection; used by the store. |
| `app/printer/services/PrinterService.ts` | Subscribes to `printer` collection; unchanged. |
| `app/server/interface/Server.ts` | `PosServer` type (`printerDocId`, `printerId`, `printerConnected`, etc.). |
| `app/printer/interface/Printer.ts` | `Printer` type (`id`, `printerId`, `isOnline`, etc.). |

## Result

- UI that uses `usePrinterStore().printers` gets **`isOnline`** derived from live server connection state.
- When a POS device connects or disconnects (server doc updated with `printerConnected`), the corresponding printer’s online indicator updates without touching the printer document.
