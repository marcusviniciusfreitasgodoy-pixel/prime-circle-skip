-- Migration to add a function for incrementing video views safely
CREATE OR REPLACE FUNCTION public.increment_video_views(doc_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.documents
  SET metadata = jsonb_set(
    metadata,
    '{video_views}',
    to_jsonb(COALESCE((metadata->>'video_views')::int, 0) + 1)
  )
  WHERE id = doc_id;
END;
$function$;

-- Ensure authenticated users can execute the RPC
GRANT EXECUTE ON FUNCTION public.increment_video_views(bigint) TO authenticated;
