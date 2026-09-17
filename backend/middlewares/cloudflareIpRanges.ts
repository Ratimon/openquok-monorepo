/**
 * Published Cloudflare edge IP ranges (https://www.cloudflare.com/ips-v4/ and /ips-v6/).
 * Update when Cloudflare announces range changes.
 */
export const CLOUDFLARE_IPV4_CIDRS: readonly string[] = [
    "173.245.48.0/20",
    "103.21.244.0/22",
    "103.22.200.0/22",
    "103.31.4.0/22",
    "141.101.64.0/18",
    "108.162.192.0/18",
    "190.93.240.0/20",
    "188.114.96.0/20",
    "197.234.240.0/22",
    "198.41.128.0/17",
    "162.158.0.0/15",
    "104.16.0.0/13",
    "104.24.0.0/14",
    "172.64.0.0/13",
    "131.0.72.0/22",
];

export const CLOUDFLARE_IPV6_CIDRS: readonly string[] = [
    "2400:cb00::/32",
    "2606:4700::/32",
    "2803:f800::/32",
    "2405:b500::/32",
    "2405:8100::/32",
    "2a06:98c0::/29",
    "2c0f:f248::/32",
];

const ipv4ToInt = (ip: string): number =>
    ip.split(".").reduce((acc, oct) => (acc << 8) + Number.parseInt(oct, 10), 0) >>> 0;

const isIpv4InCidr = (ip: string, cidr: string): boolean => {
    const [range, bitsStr] = cidr.split("/");
    const bits = Number.parseInt(bitsStr, 10);
    if (!range || Number.isNaN(bits) || bits < 0 || bits > 32) return false;
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    return (ipv4ToInt(ip) & mask) === (ipv4ToInt(range) & mask);
};

const expandIpv6 = (ip: string): bigint => {
    const normalized = ip.trim().toLowerCase();
    const [head, tail = ""] = normalized.split("::");
    const headParts = head ? head.split(":").filter(Boolean) : [];
    const tailParts = tail ? tail.split(":").filter(Boolean) : [];
    const missing = 8 - headParts.length - tailParts.length;
    const parts = [...headParts, ...Array(Math.max(missing, 0)).fill("0"), ...tailParts];
    if (parts.length !== 8) return BigInt(-1);
    return parts.reduce((acc, part) => (acc << BigInt(16)) + BigInt(`0x${part}`), BigInt(0));
};

const isIpv6InCidr = (ip: string, cidr: string): boolean => {
    const [range, bitsStr] = cidr.split("/");
    const bits = Number.parseInt(bitsStr, 10);
    if (!range || Number.isNaN(bits) || bits < 0 || bits > 128) return false;
    const ipNum = expandIpv6(ip);
    const rangeNum = expandIpv6(range);
    if (ipNum < BigInt(0) || rangeNum < BigInt(0)) return false;
    const shift = BigInt(128 - bits);
    return ipNum >> shift === rangeNum >> shift;
};

export const isCloudflareIp = (ip: string): boolean => {
    const normalized = normalizeIpAddress(ip);
    if (!normalized) return false;
    if (normalized.includes(":")) {
        return CLOUDFLARE_IPV6_CIDRS.some((cidr) => isIpv6InCidr(normalized, cidr));
    }
    return CLOUDFLARE_IPV4_CIDRS.some((cidr) => isIpv4InCidr(normalized, cidr));
};

export const normalizeIpAddress = (ip: string | undefined | null): string | null => {
    if (!ip) return null;
    const trimmed = ip.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("::ffff:")) return trimmed.slice("::ffff:".length);
    return trimmed;
};
