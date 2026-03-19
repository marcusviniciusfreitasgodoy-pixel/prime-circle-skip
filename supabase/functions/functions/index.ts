import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

Deno.serve(async (req) => {
  return new Response(JSON.stringify({ status: 'ok', message: 'functions endpoint' }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
