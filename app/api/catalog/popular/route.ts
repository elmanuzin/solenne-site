import { NextResponse } from "next/server";
import { listBestSellerProducts } from "@/lib/catalog";

export const revalidate = 60;

export async function GET() {
    try {
        const products = await listBestSellerProducts(8);
        return NextResponse.json(products);
    } catch {
        return NextResponse.json([]);
    }
}
