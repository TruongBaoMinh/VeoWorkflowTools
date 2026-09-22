/**
 * Seed node-tls-client's native shared library from the app bundle into the
 * OS temp dir BEFORE node-tls-client loads.
 *
 * node-tls-client (bogdanfinn/tls-client) ships no binary — at runtime it
 * downloads `tls-client-<plat>.<ext>` from GitHub releases into `os.tmpdir()`
 * and then reuses whatever file is already there WITHOUT any integrity check.
 * That design has bitten us twice:
 *   1. On networks that throttle/block GitHub the download fails → server can't
 *      start the TLS lane at all.
 *   2. A corrupt/partial cached file (interrupted download, AV tampering, a temp
 *      cleanup that truncates it) is silently reused → `koffi.load` crashes the
 *      server child with "Failed to load shared library" and there is NO
 *      self-recovery (it only re-downloads when the file is MISSING, never when
 *      it is present-but-broken).
 *
 * We ship the correct lib for every platform inside the app
 * (`resources/server/binaries/tls-client/`) and copy the matching one into
 * `os.tmpdir()` here, overwriting a missing or wrong-sized cache. This removes
 * the runtime GitHub download entirely and self-heals a corrupt cache. It is
 * best-effort: on any failure we leave node-tls-client to its own download path.
 */
/**
 * Copy the bundled native lib into `os.tmpdir()` if it is missing or differs in
 * size from the bundled copy. Synchronous and idempotent — safe to call right
 * before `import('node-tls-client')`. Never throws.
 */
export declare function ensureBundledTlsLibrary(): void;
//# sourceMappingURL=tlsClientNativeSetup.d.ts.map