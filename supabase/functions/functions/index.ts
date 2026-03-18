import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

Deno.serve(async (req) => {
  return new Response(JSON.stringify({ status: 'ok', message: 'Function is running' }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
