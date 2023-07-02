declare function buf2hex(buffer: ArrayBuffer): string;

declare function hex2buf(hex: string): ArrayBuffer;

declare class RollingTokenManager {
    constructor(secret: string, interval: number, tolerance?: number);

    currentTimestamp(): number;

    generateToken(offset?: number): Promise<string>;

    isValid(token: string): Promise<boolean>;
}

export = RollingTokenManager;