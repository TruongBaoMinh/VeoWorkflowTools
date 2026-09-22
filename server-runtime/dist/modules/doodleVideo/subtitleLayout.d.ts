/**
 * Shared subtitle layout: wrapping and time-slicing.
 *
 * Pure/synchronous — no filesystem, no FFmpeg, no FableCut dependencies. Both
 * subtitle paths (FFmpeg burn-in SRT and FableCut text clips) consume the cues
 * this module produces, so "max N lines on screen" is enforced in exactly one
 * place and stays identical across paths.
 */
export interface SubtitleConfig {
    enabled: boolean;
    maxLines: 1 | 2;
    fontSize: number;
    textColor: string;
    outline: boolean;
    outlineWidth: number;
    outlineColor: string;
    background: boolean;
    backgroundColor: string;
    backgroundOpacity: number;
    position: 'bottom' | 'center' | 'top';
    /** Percent of video width removed from each side (e.g. 8 = 8%). */
    sideMargin: number;
    /**
     * Max characters shown on screen per cue. A long segment is split into several
     * short cues that flip in sequence — smaller value = shorter, faster captions.
     */
    maxCharsPerCue: number;
}
export declare const DEFAULT_SUBTITLE_CONFIG: SubtitleConfig;
export interface SubtitleCue {
    start: number;
    end: number;
    /** Length is always <= config.maxLines. */
    lines: string[];
}
/**
 * Wrap a single Whisper segment into cues of at most `cfg.maxLines` lines each.
 *
 * When the wrapped text exceeds `maxLines`, the segment is split into sequential
 * cues, time-sliced proportionally to each chunk's character count. Text is
 * never dropped; empty/whitespace segments return an empty array.
 *
 * @param seg        Whisper segment (start/end in seconds, raw text).
 * @param cfg        Full SubtitleConfig — merge with DEFAULT_SUBTITLE_CONFIG first.
 * @param videoWidth Canvas width in pixels (drives the chars-per-line heuristic).
 */
export declare function wrapAndSplit(seg: {
    start: number;
    end: number;
    text: string;
}, cfg: SubtitleConfig, videoWidth: number): SubtitleCue[];
//# sourceMappingURL=subtitleLayout.d.ts.map