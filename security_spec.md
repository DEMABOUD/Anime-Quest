# Security Specification — Anime Quest (Firestore ABAC & Zero-Trust)

## 1. Data Invariants
1. **User Identity Invariant**: A user can only write/update their own profile (`/users/{userId}` where `request.auth.uid == userId`).
2. **Username Uniqueness Invariant**: `/usernames/{username}` can only be created if it matches the current user's UID and is not already taken.
3. **Friendship Invariant**: Only participants (`senderUid` or `receiverUid`) can view or update a friendship document. Only the sender can create a pending request. Only receiver can accept/decline.
4. **Private Chat Invariant**: Only users involved in the conversation can read or post messages.
5. **Guild Governance Invariant**: Only the Guild Chief can update guild settings or disband. Joining/leaving updates the member list securely.
6. **Immutable Game Record**: Terminal game states cannot be rewritten or spoofed.

## 2. The "Dirty Dozen" Payloads (Blocked by Security Rules)
1. **Ghost Field Injection**: Attempt to inject `isAdmin: true` into `/users/{uid}`.
2. **Identity Spoofing**: Attempt to update another user's profile (`uid: "otherUser"`).
3. **Username Hijack**: Attempt to claim `/usernames/luffy` when `request.auth.uid != resource.data.uid`.
4. **Arbitrary Friendship Acceptance**: Sender attempting to accept their own friendship request.
5. **Unauthorized Message Snooping**: User attempting to read private messages of another pair.
6. **Chat Message Impersonation**: Posting a message with `senderUid != request.auth.uid`.
7. **Guild Chief Usurpation**: Regular member changing `leaderUid` to themselves.
8. **Negative Stats Poisoning**: Injecting negative points or negative level.
9. **Payload Oversizing Attack**: Writing a 2MB string in `bio` or `content`.
10. **Game Terminal Tampering**: Overwriting a completed game's `winnerUid` after status is `completed`.
11. **Orphaned Message Write**: Creating a group message in a non-existent group.
12. **Unauthenticated Read/Write**: Anonymous or unauthenticated access to restricted collections.
