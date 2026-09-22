/**
 * Record that the user DB has been reconciled to the current template schema.
 * The raw-text CREATE TABLE hash is order/format-sensitive: after an additive
 * reconcile (ALTER TABLE ADD COLUMN) the user schema is equivalent to the
 * template but its serialized text — and thus its hash — never equals the
 * template's again. Without this marker the app would back up + reconcile on
 * EVERY launch forever. Call after a successful reconcile.
 */
export declare function markSchemaReconciled(userDbPath: string, templateDbPath: string): void;
/**
 * Compare schema between template.db and user.db.
 *  - Method 1 (primary): hash all CREATE TABLE SQL statements
 *  - Method 2 (fallback): SQLite schema_cookie at byte 40
 */
export declare function checkSchemaVersion(userDbPath: string, templateDbPath: string): {
    needsUpdate: boolean;
    reason: string;
    userCookie: number | null;
    templateCookie: number | null;
};
/**
 * Force reset: backup user DB and replace with a fresh copy of template.
 */
export declare function forceResetDatabase(userDbPath: string, templateDbPath: string): boolean;
/**
 * Có dữ liệu người dùng thực sự không? Dùng để CẤM mọi thao tác wipe/replace
 * lên DB đang chứa profile/project. Bảng không tồn tại → coi như 0 (không chặn).
 *
 * Trả về `true` / `false` chỉ khi xác minh được. Khi không mở được DB (ví dụ
 * better-sqlite3 native module fail load do mismatch arch/ABI), hàm **throw**
 * để caller bắt buộc xử lý case "không biết". Trước đây silent-return false
 * dẫn đến code fallback "install fresh template" đè mất DB user — fix gốc
 * của lỗi mất dữ liệu khi reinstall trên Windows.
 */
export declare function databaseHasUserData(userDbPath: string): boolean;
export declare function dbFileLooksOccupied(userDbPath: string, templateDbPath: string): boolean;
/**
 * Reconcile schema theo hướng CỘNG DỒN (additive) — KHÔNG phá dữ liệu.
 * Thêm bảng / cột / index còn thiếu từ template vào DB user; KHÔNG bao giờ drop.
 * Toàn bộ chạy trong 1 transaction: hoặc áp dụng trọn vẹn, hoặc giữ nguyên DB.
 *
 * Trả `{ ok }`: ok=false nghĩa là không reconcile được (DB hỏng) → caller fallback.
 */
export declare function reconcileSchemaAdditive(userDbPath: string, templateDbPath: string): {
    ok: boolean;
    applied: string[];
    error?: string;
};
//# sourceMappingURL=databaseSchemaChecker.d.ts.map