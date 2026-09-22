/**
 * Builds a FableCut `project.json` document from a doodle project's timeline.
 *
 * The audio-sync invariant is preserved for free: each shot clip is placed on V1
 * at `start = segment.start` (the Whisper timing), and the narration sits on A1
 * at `start = 0`. FableCut's compositor then plays everything against that clock,
 * so the prefilled timeline already matches the narration before the user edits.
 *
 * Pure/synchronous — no filesystem or network. The media files are copied into
 * FableCut's media dir separately (see DoodleVideoService.prepareFablecut).
 */
import type { WhisperSegment } from './whisperTranscribe.service.js';
import { type SubtitleConfig } from './subtitleLayout.js';
export interface FablecutBuildSettings {
    /** FableCut transition name (fade, dissolve, slide-left, …) or 'none'. */
    transitionType: string;
    /** Transition length in seconds (applied as transitionIn/Out on each clip). */
    transitionDuration: number;
    /** Add per-segment subtitle text clips on V2. */
    includeSubtitles: boolean;
    /** Apply a slow Ken Burns push (scale keyframes) to still-image shots. */
    kenBurns: boolean;
    /** Canvas/export frame rate. */
    fps: number;
    /** Subtitle style config (full — caller merges with DEFAULT_SUBTITLE_CONFIG). */
    subtitleConfig?: SubtitleConfig;
}
export interface FablecutBuildInput {
    title: string;
    aspectRatio: string | null | undefined;
    outputType: 'IMAGE' | 'VIDEO';
    audioFilename: string;
    audioDuration: number;
    /** Filenames already copied into FableCut's media dir, in shot order. */
    shotFilenames: string[];
    /** driftAdjust()-ed Whisper segments, same length/order as shotFilenames. */
    segments: WhisperSegment[];
    settings: FablecutBuildSettings;
}
export declare function buildFablecutProject(input: FablecutBuildInput): Record<string, unknown>;
//# sourceMappingURL=fablecutBuilder.d.ts.map