import fs from 'fs'

export const GET = async (request: Request) => {
    const { getExecutionLogs } = await import("../../services/executionLogs");
    const url = new URL(request.url);
    const current = url.searchParams.get('current') || 1;
    const [count, rows] = await getExecutionLogs(+current);
    return new Response(JSON.stringify({ count, rows }), {
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export const POST = async (request: Request) => {
    const requestBody = await request.json();
    fs.appendFileSync(
        "./logs/execution.log",
        '\n' + new Date() + JSON.stringify(requestBody),
        "utf-8"
    );
    return Response.json([])
}