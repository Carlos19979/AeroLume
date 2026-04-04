import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { Boat } from '@/types/boat';

let boatsCache: Boat[] | null = null;

async function getBoats(): Promise<Boat[]> {
    if (boatsCache) return boatsCache;
    const jsonDirectory = path.join(process.cwd(), 'src', 'data');
    const fileContents = await fs.readFile(jsonDirectory + '/boats.json', 'utf8');
    boatsCache = JSON.parse(fileContents);
    return boatsCache || [];
}

function normalizeText(value: string) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function compactText(value: string) {
    return normalizeText(value).replace(/[^a-z0-9]+/g, '');
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
        return NextResponse.json([]);
    }

    const boats = await getBoats();
    const normalizedQuery = normalizeText(query);
    const compactQuery = compactText(query);

    const results = boats
        .filter((boat) => boat.model && normalizeText(boat.model).includes(normalizedQuery))
        .sort((left, right) => {
            const leftModel = left.model ?? '';
            const rightModel = right.model ?? '';
            const leftNormalized = normalizeText(leftModel);
            const rightNormalized = normalizeText(rightModel);
            const leftCompact = compactText(leftModel);
            const rightCompact = compactText(rightModel);

            const leftScore =
                Number(leftNormalized === normalizedQuery) * 5 +
                Number(leftCompact === compactQuery) * 4 +
                Number(leftNormalized.startsWith(normalizedQuery)) * 3 +
                Number(leftCompact.startsWith(compactQuery)) * 2;
            const rightScore =
                Number(rightNormalized === normalizedQuery) * 5 +
                Number(rightCompact === compactQuery) * 4 +
                Number(rightNormalized.startsWith(normalizedQuery)) * 3 +
                Number(rightCompact.startsWith(compactQuery)) * 2;

            if (leftScore !== rightScore) {
                return rightScore - leftScore;
            }

            return leftModel.localeCompare(rightModel);
        })
        .slice(0, 12);

    return NextResponse.json(results);
}
