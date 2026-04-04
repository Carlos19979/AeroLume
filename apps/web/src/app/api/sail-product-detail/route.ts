import { NextResponse } from 'next/server';

type ProductDetail = {
    name: string;
    price: string | null;
    priceTaxExc: string | null;
    currency: string;
    sku: string | null;
    shortDescription: string;
    fullDescription: string;
    images: string[];
    breadcrumbs: { name: string; url: string }[];
    weight: string | null;
    availability: string | null;
    configuration: { label: string; options: string[] }[];
    url: string;
};

function extractJsonLd(html: string): Record<string, unknown>[] {
    const schemas: Record<string, unknown>[] = [];
    const regex = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
        try {
            const parsed = JSON.parse(match[1]);
            if (Array.isArray(parsed)) schemas.push(...parsed);
            else schemas.push(parsed);
        } catch { /* skip */ }
    }
    return schemas;
}

function decodeHtml(value: string): string {
    return value
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&rsquo;/g, "'")
        .replace(/&laquo;/g, '"')
        .replace(/&raquo;/g, '"')
        .replace(/&euro;/g, 'EUR')
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function stripHtml(value: string): string {
    return decodeHtml(value)
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<\/li>/gi, '\n')
        .replace(/<li[^>]*>/gi, '- ')
        .replace(/<[^>]*>/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function upgradeToLarge(url: string): string {
    return url.replace(/-(?:small|medium|home|cart|thickbox)_default\//i, '-large_default/');
}

function extractImages(html: string): string[] {
    const seen = new Set<string>();
    const images: string[] = [];

    function addImage(url: string) {
        const large = upgradeToLarge(url);
        // Normalize for dedup — strip size suffix
        const normalized = large.replace(/-\w+_default\//, '-NORM/');
        if (!seen.has(normalized) && !url.includes('stores') && !url.includes('logo') && !url.includes('flag')) {
            seen.add(normalized);
            images.push(large);
        }
    }

    // 1. Extract from JSON-LD Product schema (most reliable)
    const schemas = extractJsonLd(html);
    for (const schema of schemas) {
        if (schema['@type'] === 'Product') {
            const schemaImages = schema['image'];
            if (Array.isArray(schemaImages)) {
                for (const img of schemaImages) {
                    const url = typeof img === 'string' ? img : (img as Record<string, string>)?.url;
                    if (url) addImage(url);
                }
            } else if (typeof schemaImages === 'string') {
                addImage(schemaImages);
            }
        }
    }

    // 2. Extract from data-image-large-src attributes (gallery)
    const largeRegex = /data-image-large-src\s*=\s*["'](https?:\/\/[^"']+)["']/gi;
    let m;
    while ((m = largeRegex.exec(html)) !== null) addImage(m[1]);

    // 3. Extract from img tags with product image patterns
    const imgRegex = /(?:src|href)\s*=\s*["'](https?:\/\/www\.sailonet\.com\/\d+-[^"']*default\/[^"']+)["']/gi;
    while ((m = imgRegex.exec(html)) !== null) addImage(m[1]);

    return images;
}

function extractConfiguration(html: string): { label: string; options: string[] }[] {
    const configs: { label: string; options: string[] }[] = [];

    // Method 1: Extract <select> dropdowns with their labels
    // Pattern: <label ...>Label text</label> ... <select ...><option>...</option></select>
    const selectBlockRegex = /<(?:label|span)[^>]*class="[^"]*(?:control-label|form-control-label)[^"]*"[^>]*>([\s\S]*?)<\/(?:label|span)>[\s\S]*?<select[^>]*>([\s\S]*?)<\/select>/gi;
    let blockMatch;
    while ((blockMatch = selectBlockRegex.exec(html)) !== null) {
        const label = stripHtml(blockMatch[1]).replace(/:\s*$/, '').trim();
        const optionsHtml = blockMatch[2];
        const options: string[] = [];
        const optRegex = /<option[^>]*>\s*(.*?)\s*<\/option>/gi;
        let optMatch;
        while ((optMatch = optRegex.exec(optionsHtml)) !== null) {
            const val = stripHtml(optMatch[1]).trim();
            if (val && val !== '--' && !options.includes(val)) options.push(val);
        }
        if (label && options.length > 0) {
            configs.push({ label, options });
        }
    }

    // Method 2: Extract radio button groups
    const radioGroupRegex = /<(?:label|span)[^>]*class="[^"]*(?:control-label|form-control-label)[^"]*"[^>]*>([\s\S]*?)<\/(?:label|span)>[\s\S]*?(<input[^>]*type\s*=\s*["']radio["'][\s\S]*?)(?=<(?:label|span)[^>]*class="[^"]*(?:control-label|form-control-label)|<div[^>]*class="[^"]*product-add|$)/gi;
    let radioMatch;
    while ((radioMatch = radioGroupRegex.exec(html)) !== null) {
        const label = stripHtml(radioMatch[1]).replace(/:\s*$/, '').trim();
        // Skip if we already have this label from selects
        if (configs.some((c) => c.label === label)) continue;

        const radioHtml = radioMatch[2];
        const options: string[] = [];
        const titleRegex = /title\s*=\s*["']([^"']+)["']/gi;
        let titleMatch;
        while ((titleMatch = titleRegex.exec(radioHtml)) !== null) {
            const val = decodeHtml(titleMatch[1]).trim();
            if (val && !options.includes(val)) options.push(val);
        }
        if (label && options.length > 0) {
            configs.push({ label, options });
        }
    }

    // Method 3: Fallback — look for known sailonet config patterns in JS
    const jsConfigPatterns = [
        { pattern: /["']Número de rizos["']\s*[:,]\s*([\s\S]*?)(?=["']\w|$)/i, label: 'Numero de rizos' },
        { pattern: /["']Elección (?:del )?tejido["']\s*[:,]\s*([\s\S]*?)(?=["']\w|$)/i, label: 'Eleccion del tejido' },
    ];
    for (const { pattern, label } of jsConfigPatterns) {
        if (configs.some((c) => c.label.toLowerCase().includes(label.toLowerCase()))) continue;
        const match = pattern.exec(html);
        if (match) {
            const values = match[1].match(/["']([^"']{2,})["']/g);
            if (values) {
                const options = values.map((v) => decodeHtml(v.replace(/["']/g, '')).trim()).filter((v, i, a) => v && a.indexOf(v) === i);
                if (options.length > 0) configs.push({ label, options });
            }
        }
    }

    return configs;
}

function extractFullDescription(html: string): string {
    // Try multiple selectors for description content
    const patterns = [
        /<div[^>]*id="description"[^>]*>([\s\S]*?)<\/div>/i,
        /<div[^>]*class="[^"]*product-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
        /<div[^>]*class="[^"]*rte-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
        /<div[^>]*class="[^"]*tab-pane[^"]*"[^>]*id="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i,
    ];

    for (const pattern of patterns) {
        const match = pattern.exec(html);
        if (match?.[1]?.trim()) {
            const text = stripHtml(match[1]);
            if (text.length > 20) return text;
        }
    }

    return '';
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const productUrl = searchParams.get('url');

    if (!productUrl) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    try {
        const parsed = new URL(productUrl);
        if (!parsed.hostname.includes('sailonet.com')) {
            return NextResponse.json({ error: 'Invalid URL domain' }, { status: 400 });
        }
    } catch {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    try {
        const response = await fetch(productUrl, {
            headers: {
                'Accept': 'text/html,application/xhtml+xml',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
                'Accept-Language': 'es-ES,es;q=0.9',
            },
            next: { revalidate: 60 * 60 * 24 },
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch product page' }, { status: 502 });
        }

        const html = await response.text();
        const schemas = extractJsonLd(html);
        const productSchema = schemas.find((s) => s['@type'] === 'Product') as Record<string, unknown> | undefined;
        const breadcrumbSchema = schemas.find((s) => s['@type'] === 'BreadcrumbList') as Record<string, unknown> | undefined;

        // Name & SKU
        const name = (productSchema?.name as string) ?? '';
        const sku = (productSchema?.sku as string) ?? null;

        // Price
        let price: string | null = null;
        let priceTaxExc: string | null = null;
        let currency = 'EUR';
        const offers = productSchema?.offers as Record<string, unknown> | undefined;
        if (offers) {
            price = String(offers.price ?? '');
            currency = (offers.priceCurrency as string) ?? 'EUR';
        }
        const taxExcMatch = /["']price["']\s*:\s*["']([\d.,]+)["']/i.exec(html);
        if (taxExcMatch) priceTaxExc = taxExcMatch[1];

        // Descriptions
        const shortDescription = stripHtml((productSchema?.description as string) ?? '');
        const fullDescription = extractFullDescription(html);

        // Images — large only
        const images = extractImages(html);

        // Breadcrumbs
        const breadcrumbs: { name: string; url: string }[] = [];
        if (breadcrumbSchema) {
            const items = (breadcrumbSchema.itemListElement as Array<Record<string, unknown>>) ?? [];
            for (const item of items) {
                const itemObj = (item.item ?? item) as Record<string, unknown>;
                breadcrumbs.push({
                    name: (item.name as string) ?? (itemObj.name as string) ?? '',
                    url: (itemObj['@id'] as string) ?? (itemObj.url as string) ?? '',
                });
            }
        }

        // Weight
        const weightMatch = /["']weight["']\s*:\s*["']([\d.,]+\s*kg)["']/i.exec(html);
        const weight = weightMatch ? weightMatch[1] : null;

        // Availability
        const availMatch = /availability["']\s*:\s*["']https?:\/\/schema\.org\/(\w+)["']/i.exec(html);
        const availability = availMatch ? availMatch[1] : null;

        // Configuration options
        const configuration = extractConfiguration(html);

        const detail: ProductDetail = {
            name,
            price: price || null,
            priceTaxExc,
            currency,
            sku,
            shortDescription,
            fullDescription,
            images,
            breadcrumbs,
            weight,
            availability,
            configuration,
            url: productUrl,
        };

        return NextResponse.json(detail);
    } catch (error) {
        console.error('Product detail fetch failed:', error);
        return NextResponse.json({ error: 'Failed to fetch product details' }, { status: 500 });
    }
}
