# Log Retention & Cleanup Strategy

## Context

Firestore charges per **document read/write**, and all logs live in the `logs` collection. At ~3,000 prints/day, each generating at least one log document, we accumulate roughly:

| Period     | Estimated docs |
|------------|----------------|
| 1 day      | ~3,000         |
| 7 days     | ~21,000        |
| 30 days    | ~90,000        |
| 90 days    | ~270,000       |

Every full-page load of `/logs` reads **all** documents in the collection (current `subscribeToLogs` has no `limit()` clause). Keeping unbounded history is the primary cost driver.

---

## Where to Configure the Retention Limit

### 1. Firestore `global` document

The `Global` interface (`app/global/interface.ts`) already has a `daily_logs` field. We propose adding a `log_retention_days` (or `max_log_docs`) field to the single document in the `global` Firestore collection:

```ts
// app/global/interface.ts
export interface Global {
  id: string;
  daily_logs: number;
  log_retention_days: number; // e.g. 7 — how many days of logs to keep
}
```

An admin sets this value once via the Firebase console (or a future Settings page). The cleanup script (below) reads it at runtime, so no code redeploy is needed to change the window.

### 2. `LogService` query limit (dashboard reads)

While the cleanup script controls what is *stored*, the dashboard query should also be capped so a page load never reads thousands of documents:

```ts
// app/logs/services/LogService.ts
import { query, orderBy, limit } from "firebase/firestore";

const q = query(collectionRef, orderBy("timestamp", "desc"), limit(500));
```

`500` is a safe dashboard display cap. Adjust as needed — the Export CSV button already materialises the full filtered set client-side, so this only affects initial load cost.

---

## Automated Cleanup — Firebase Scheduled Function

The recommended approach is a **Firebase Cloud Function** that runs on a cron schedule, reads `log_retention_days` from the `global` document, and batch-deletes any `logs` documents older than that threshold.

### File: `functions/src/cleanupLogs.ts`

```ts
import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";

const db = admin.firestore();
const BATCH_SIZE = 400; // Firestore batch limit is 500

export const cleanupLogs = functions.scheduler.onSchedule(
  { schedule: "every 24 hours", timeZone: "Pacific/Auckland" },
  async () => {
    // Read retention window from global config
    const globalSnap = await db.collection("global").limit(1).get();
    const retentionDays: number = globalSnap.empty
      ? 7
      : (globalSnap.docs[0].data().log_retention_days ?? 7);

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);
    const cutoffTimestamp = admin.firestore.Timestamp.fromDate(cutoff);

    console.log(
      `[cleanupLogs] Deleting logs older than ${retentionDays} days (before ${cutoff.toISOString()})`
    );

    let totalDeleted = 0;

    // Paginated deletion to stay within batch limits
    while (true) {
      const snap = await db
        .collection("logs")
        .where("timestamp", "<", cutoffTimestamp)
        .orderBy("timestamp", "asc")
        .limit(BATCH_SIZE)
        .get();

      if (snap.empty) break;

      const batch = db.batch();
      snap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();

      totalDeleted += snap.size;
      console.log(`[cleanupLogs] Deleted batch of ${snap.size} (total: ${totalDeleted})`);

      if (snap.size < BATCH_SIZE) break;
    }

    console.log(`[cleanupLogs] Done. Total deleted: ${totalDeleted}`);
  }
);
```

### `functions/src/index.ts`

```ts
import * as admin from "firebase-admin";
admin.initializeApp();

export { cleanupLogs } from "./cleanupLogs";
```

### Deploy

```bash
cd functions
npm install firebase-functions firebase-admin
npx firebase deploy --only functions:cleanupLogs
```

---

## Firestore Index Required

The cleanup query uses `where("timestamp", "<", ...)` + `orderBy("timestamp")`. Add this index to `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "logs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "timestamp", "order": "ASCENDING" }
      ]
    }
  ]
}
```

Or let Firebase create it automatically on first function run (it will log the Console link).

---

## Recommended Settings

At 3,000 prints/day with a mix of `info`, `success`, `warning`, and `error` logs:

| Scenario | `log_retention_days` | Steady-state doc count |
|----------|----------------------|------------------------|
| Minimal cost | 3 | ~9,000 |
| **Recommended** | **7** | **~21,000** |
| Audit / debugging | 14 | ~42,000 |

Keep `error` and `warning` logs longer if needed for post-incident review — the cleanup script can be extended to skip those levels:

```ts
.where("timestamp", "<", cutoffTimestamp)
.where("level", "not-in", ["error", "warning"]) // keep errors longer
```

---

## Summary

| What | Where |
|------|-------|
| Retention window config | `global` Firestore document → `log_retention_days` field |
| Dashboard read cap | `LogService.subscribeToLogs` → add `limit(500)` |
| Auto-deletion | Firebase Scheduled Function (`functions/src/cleanupLogs.ts`) — runs daily |
| No-code change to adjust | Update `log_retention_days` in Firestore console; function picks it up on next run |
