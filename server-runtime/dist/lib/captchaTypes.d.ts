/**
 * Shared type contracts between captchaManager, captchaBridge, and job handlers.
 */
export type CaptchaAction = 'IMAGE_GENERATION' | 'VIDEO_GENERATION';
export type CaptchaMethod = 'get_captcha' | 'soft_reset' | 'hard_reset';
export interface CaptchaCommand {
    commandId: string;
    method: CaptchaMethod;
    action?: CaptchaAction;
}
export interface CaptchaResultPayload {
    commandId: string;
    token?: string;
    error?: string;
}
export interface CaptchaToken {
    token: string;
    applicationType: 'RECAPTCHA_APPLICATION_TYPE_WEB';
}
export type CaptchaResetKind = 'soft_reset' | 'hard_reset';
//# sourceMappingURL=captchaTypes.d.ts.map