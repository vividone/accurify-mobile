/**
 * Hashes a plaintext password using SHA-256 for secure transmission.
 * @param password Plaintext password
 * @returns 64-character hex string
 */
export async function hashPassword(password: string): Promise<string> {
    if (!password) return '';

    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await Uint8Array.from(
        new Uint8Array(await crypto.subtle.digest('SHA-256', data))
    );

    const hashArray = Array.from(hashBuffer);
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

    return hashHex;
}
