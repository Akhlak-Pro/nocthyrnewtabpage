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
            headers: {
                "User-Agent": "Mozilla/5.0", // Some RSS feeds require a User-Agent
                "Accept": "application/rss+xml, application/xml, text/xml",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch RSS feed (status: ${response.status})`);
        }

        const text = await response.text();

        // Ensure the response is valid XML and properly formatted
        return new Response(text, {
            headers: {
                "Content-Type": "application/rss+xml; charset=UTF-8",
                "Access-Control-Allow-Origin": "*",
            },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: `Failed to fetch RSS feed: ${error.message}` }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
