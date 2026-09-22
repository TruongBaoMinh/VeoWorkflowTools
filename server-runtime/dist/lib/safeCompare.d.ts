/**
 * Constant-time string equality. Pads / truncates both buffers to a fixed
 * length so the comparison length is independent of the input — prevents
 * length oracles when one side is attacker-controlled.
 */
export declare function safeStringEqual(a: string, b: string): boolean;
//# sourceMappingURL=safeCompare.d.ts.map