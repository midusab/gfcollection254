# Security Specification for GF Collection

## 1. Data Invariants
- Products can only be created, updated, or deleted by authorized admins.
- Products must have a valid price, name, and status.
- Orders can be created by anyone (guest checkout supported).
- Orders, once created, can only be updated by admins (e.g., status changes, M-Pesa code verification).
- Users can only read their own orders (if `userId` is present).
- Admins have full read/write access to all collections.
- User email `gfcollection@gmail.com` is the primary admin.
- Personally Identifiable Information (PII) in orders (phone, address) must be protected.

## 2. The "Dirty Dozen" Payloads
1. **Unauthorized Product Creation**: A regular user trying to `create` a document in `/products`.
2. **Unauthorized Product Deletion**: A regular user trying to `delete` a document in `/products`.
3. **Invalid Product Price**: Creating a product with a negative price.
4. **Order Manipulation**: A user trying to update an order status they don't own (or even if they do, users shouldn't change status to "Paid").
5. **PII Leak**: An authenticated user trying to list all orders including those of other users.
6. **Shadow Field Injection**: Adding a `discount: 100` field to an order creation payload that wasn't calculated.
7. **Orphaned Order**: Creating an order without a `total` or `items`.
8. **Email Spoofing**: Trying to write to `/admins` using a non-verified email or spoofing the ID.
9. **Resource Poisoning**: Sending an extremely long string (1MB) as a `productId`.
10. **State Shortcutting**: Updating an order status directly from "Pending" to "Delivered" without intermediate steps (if strictly enforced, though here we'll focus on auth).
11. **Massive Array**: Sending 10,000 items in an order to cause "Denial of Wallet".
12. **Malicious Setting Update**: A non-admin trying to change site settings in `/settings`.

## 3. Test Runner (firestore.rules.test.ts)
(This is a conceptual outline as I don't have a local test runner environment, but I will ensure the rules address these).
- [Fail] `create /products` as unauthenticated.
- [Fail] `create /products` as non-admin.
- [Pass] `create /products` as `gfcollection@gmail.com`.
- [Pass] `create /orders` as guest.
- [Fail] `update /orders/{id}` (status) as non-admin.
- [Fail] `list /orders` as non-admin (without filter).
- [Pass] `list /orders` as admin.
