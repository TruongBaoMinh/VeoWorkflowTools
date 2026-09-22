interface StandardCookie {
    name: string;
    value: string;
    domain: string;
    path: string;
    expires?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: string;
    session?: boolean;
    url?: string;
}
/**
 * Convert JSON cookies to Netscape format string
 * Format: domain_flag_path_secure_expiration_name_value
 */
export declare function jsonToNetscape(cookies: StandardCookie[]): string;
/**
 * Write JSON cookies to a temporary Netscape format file
 * Returns the path to the temporary file
 */
export declare function writeCookiesToTempFile(cookiesJson: string): string;
export {};
//# sourceMappingURL=cookieConverter.d.ts.map