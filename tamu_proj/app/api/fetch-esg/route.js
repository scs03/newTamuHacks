import fetch from "node-fetch";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { products } = await req.json(); // Expect an array of product names

    if (!products || products.length === 0) {
      return NextResponse.json({ error: "No products provided." }, { status: 400 });
    }

    const apiResults = [];

    for (const product of products) {
      try {
        // Query the Open Food Facts API for each product name
        const response = await fetch(
          `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
            product
          )}&search_simple=1&action=process&json=1`
        );
        const data = await response.json();

        // Extract relevant data from the search results
        if (data && data.products && data.products.length > 0) {
          const productData = data.products[0]; // Take the first result
          apiResults.push({
            name: product,
            esgScore: productData.ecoscore_grade || "Unknown", // Example ESG score
            impact: productData.ecoscore_data || {}, // Example impact data
          });
        } else {
          apiResults.push({
            name: product,
            esgScore: "Not Found",
            impact: {},
          });
        }
      } catch (error) {
        console.error(`Error fetching data for ${product}:`, error.message);
        apiResults.push({
          name: product,
          esgScore: "Error",
          impact: {},
        });
      }
    }

    return NextResponse.json({ results: apiResults });
  } catch (error) {
    console.error("Error fetching ESG data:", error.message);
    return NextResponse.json({ error: "Failed to fetch ESG data." }, { status: 500 });
  }
}

