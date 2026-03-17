import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

Deno.serve(async (req: Request) => {
  return new Response(JSON.stringify({ message: 'Hello from functions!' }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
