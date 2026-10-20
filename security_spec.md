# Security Specification & Threat Model (EduShare TH)

## 1. Data Invariants
1. **User Identity & Role Elevation**: Regular members cannot elevate their own role to 'admin' or 'moderator' upon signup or update. Roles must only be manageable by administrators or initialized to 'member' for standard registration. The bootstrapped admin is `millerhardcore927@gmail.com`.
2. **Resource Ownership & Immutability**: Authors can only create resources where `authorId == request.auth.uid`. During updates, `authorId` and `createdAt` are immutable. Only the author or an admin can edit/delete resources.
3. **Public Read vs Moderated State**: Public visitors and members can read resources if `status == 'active'`. Hidden or deleted resources can only be viewed by the original author or by an admin/moderator.
4. **Favorites Integrity**: A user can only create or delete a favorite record where `favorite.userId == request.auth.uid`. A favorite document ID format is strictly `${request.auth.uid}_${resourceId}` or verified to match `incoming().userId == request.auth.uid`.
5. **Reports Submission & Resolution**: Any signed-in user can submit a report where `reporterId == request.auth.uid`. Only admins and moderators can read or update report status.
6. **Site Settings & Moderation Logs**: Settings and ModerationLogs are strictly read-only for public/members (or settings readable for app config), and strictly writable only by verified administrators.

---

## 2. The "Dirty Dozen" Threat Payloads (Must Return PERMISSION_DENIED)

1. **Payload 1 - Self-Promotion to Admin**:
   - Path: `/users/{victimUid}`
   - Action: `setDoc` / `updateDoc`
   - Payload: `{"role": "admin", "uid": "attacker_123"}` by non-admin attacker.
   - Result: PERMISSION_DENIED.

2. **Payload 2 - Impersonate Author on Resource Creation**:
   - Path: `/resources/{newResId}`
   - Action: `setDoc`
   - Payload: `{"title": "Fake Material", "authorId": "innocent_teacher_id", ...}`
   - Result: PERMISSION_DENIED.

3. **Payload 3 - Hijack & Tamper Another User's Resource**:
   - Path: `/resources/{targetResId}`
   - Action: `updateDoc`
   - User: `attacker_uid` (not author, not admin)
   - Payload: `{"title": "Defaced Resource Content"}`
   - Result: PERMISSION_DENIED.

4. **Payload 4 - Shadow Field Injection**:
   - Path: `/resources/{resId}`
   - Action: `setDoc`
   - Payload: `{"title": "Test", "authorId": "me", "isVerifiedAdminBadge": true, ...}`
   - Result: PERMISSION_DENIED.

5. **Payload 5 - Denial-of-Wallet Payload (Giant 10MB String)**:
   - Path: `/resources/{resId}`
   - Action: `setDoc`
   - Payload: `{"title": "A".repeat(100000)}`
   - Result: PERMISSION_DENIED.

6. **Payload 6 - Modify Immutable Timestamp / Author**:
   - Path: `/resources/{resId}`
   - Action: `updateDoc`
   - Payload: `{"createdAt": "2020-01-01T00:00:00Z", "authorId": "other_uid"}`
   - Result: PERMISSION_DENIED.

7. **Payload 7 - Unauthenticated Resource Creation**:
   - Path: `/resources/{resId}`
   - Action: `setDoc` (Anonymous / Guest)
   - Payload: `{"title": "Spam Resource"}`
   - Result: PERMISSION_DENIED.

8. **Payload 8 - Forge Another User's Favorite Bookmark**:
   - Path: `/favorites/{victimUid_resId}`
   - Action: `setDoc`
   - Payload: `{"userId": "victim_uid", "resourceId": "res_1"}`
   - Result: PERMISSION_DENIED.

9. **Payload 9 - Public Read of Pending Reports**:
   - Path: `/reports`
   - Action: `getDocs` by unauthenticated visitor or regular member
   - Result: PERMISSION_DENIED.

10. **Payload 10 - Non-Admin Modifying Global Site Settings**:
    - Path: `/settings/general`
    - Action: `setDoc`
    - Payload: `{"siteName": "Hacked Portal"}` by regular member
    - Result: PERMISSION_DENIED.

11. **Payload 11 - Tampering Moderation Audit Logs**:
    - Path: `/moderationLogs/{logId}`
    - Action: `updateDoc` / `deleteDoc`
    - Payload: Attacker trying to erase audit trails
    - Result: PERMISSION_DENIED.

12. **Payload 12 - ID Poisoning (Junk document ID)**:
    - Path: `/resources/invalid$$$###@@@` (exceeding length or invalid pattern)
    - Action: `setDoc`
    - Result: PERMISSION_DENIED.
