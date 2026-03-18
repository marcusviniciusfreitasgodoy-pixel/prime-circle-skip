import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

Deno.serve(async (req: Request) => {
  return new Response(
    JSON.stringify({ status: 'ok', message: 'Functions edge function is active' }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    },
  )
})
