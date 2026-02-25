# Firestore Security Rules

## Overview

These rules control who can read and write data in Firestore. All access requires authentication except where explicitly denied.

## Helper Function

### `isSuperAdmin()`

Returns `true` when:
1. The request has an authenticated user (`request.auth != null`)
2. The user's document at `/users/{uid}` exists and has `role == 'superadmin'`

## Collection Rules

### `/users/{userId}`

| Operation | Who can access |
|-----------|----------------|
| **read** | Any authenticated user |
| **create** | Only superadmins |
| **update** | Only superadmins |
| **delete** | Only superadmins |

- Authenticated users can view any user profile.
- Only superadmins can create, edit, or delete users.

### Other Collections (e.g. `printers`, `logs`, `templates`)

| Operation | Who can access |
|-----------|----------------|
| **read** | Any authenticated user |
| **write** | Any authenticated user |

- Applies to all collections except `users`.
- Any signed-in user can read and write to these collections.

## Summary

- **Users collection**: Superadmins manage users; all authenticated users can read.
- **Other collections**: Read/write allowed for any authenticated user.
