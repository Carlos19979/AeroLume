import { NextResponse } from 'next/server';

type SailonetAttribute = {
    group?: string;
    name?: string;
} | string;

type SailonetProduct = {
    id_product?: string;
    id_product_attribute?: string | number;
    name?: string;
    price?: number;
    price_tax_exc?: number;
    image?: string;
    link?: string;
    gamme?: string;
    description_short?: string;
    attributes?: Record<string, SailonetAttribute>;
    on_sale?: string;
    quantity_all_versions?: number;
};

function upgradeImageUrl(url: string): string {
    // Upgrade to large_default for better quality
    return url.replace(/-(?:small|medium|home|cart)_default\//i, '-large_default/');
}

function decodeHtmlEntities(value: string) {
    return value
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&rsquo;/g, "'")
        .replace(/&euro;/g, 'EUR');
}

function stripHtml(value: string) {
    return decodeHtmlEntities(value)
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function extractHighlights(value: string) {
    const matches = [...value.matchAll(/<li>(.*?)<\/li>/gi)];
    if (matches.length === 0) {
        const summary = stripHtml(value);
        return summary ? [summary] : [];
    }

    return matches
        .map((match) => stripHtml(match[1] ?? ''))
        .filter(Boolean)
        .slice(0, 4);
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const boatLength = searchParams.get('boatLength');
    const sail = searchParams.get('sail');
    const area = searchParams.get('area');

    if (!boatLength || !sail || !area) {
        return NextResponse.json([]);
    }

    const upstreamUrl = new URL('https://www.sailonet.com/es/module/sailonet/sailquote');
    upstreamUrl.searchParams.set('ajax', '1');
    upstreamUrl.searchParams.set('action', 'getSailProducts');
    upstreamUrl.searchParams.set('boat_length', boatLength);
    upstreamUrl.searchParams.set('sail', sail);
    upstreamUrl.searchParams.set('area', area);

    try {
        const response = await fetch(upstreamUrl.toString(), {
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
            },
            next: { revalidate: 60 * 60 * 24 },
        });

        if (!response.ok) {
            return NextResponse.json([]);
        }

        const data = (await response.json()) as SailonetProduct[] | false;
        if (!Array.isArray(data)) {
            return NextResponse.json([]);
        }

        const products = data.map((product) => {
            // Handle attributes — can be { group, name } objects or plain strings
            const attrs: string[] = [];
            if (product.attributes) {
                for (const [key, val] of Object.entries(product.attributes)) {
                    if (typeof val === 'string') {
                        // Direct key-value format: { weight: "320 AP / 300 SF" }
                        attrs.push(`${key}: ${val}`);
                    } else if (val && typeof val === 'object' && val.group && val.name) {
                        // PrestaShop format: { group: "Peso", name: "320 AP" }
                        attrs.push(`${val.group}: ${val.name}`);
                    }
                }
            }

            return {
                id: `${product.id_product ?? 'unknown'}-${product.id_product_attribute ?? 'base'}`,
                name: product.name ?? 'Vela personalizada',
                price: typeof product.price === 'number' ? product.price : null,
                priceTaxExc: typeof product.price_tax_exc === 'number' ? product.price_tax_exc : null,
                image: product.image ? upgradeImageUrl(product.image) : null,
                link: product.link ?? null,
                gamme: product.gamme === 'PasdeGamme' ? null : (product.gamme ?? null),
                highlights: extractHighlights(product.description_short ?? ''),
                attributes: attrs.slice(0, 6),
                onSale: product.on_sale === '1',
            };
        });

        return NextResponse.json(products);
    } catch {
        return NextResponse.json([]);
    }
}
