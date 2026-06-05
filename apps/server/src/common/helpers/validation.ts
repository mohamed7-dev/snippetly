export function normalizeInput(input: string): string {
    return isEmailAddressLike(input) ? input.trim().toLowerCase() : input.trim();
}

export function isEmailAddressLike(input: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.trim());
}
