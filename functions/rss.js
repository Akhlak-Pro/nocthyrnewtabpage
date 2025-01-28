export async function onRequest(context) {
    const url = new URL(context.request.url);
    const feedUrl = url.searchParams.get("url");

    if (!feedUrl) {
        return new Response(JSON.stringify({ error: "Missing RSS URL parameter" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const response = await fetch(feedUrl, {
            headers: { "User-Agent": "Mozilla/5.0" },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch RSS feed (status: ${response.status})`);
        }

        const xml = await response.text();
        return new Response(xml, {
            headers: {
                "Content-Type": "application/rss+xml",
                "Access-Control-Allow-Origin": "*", // Allow frontend requests
            },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to fetch RSS feed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
