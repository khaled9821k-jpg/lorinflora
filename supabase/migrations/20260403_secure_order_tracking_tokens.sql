DO $$
DECLARE
  tracked_function record;
BEGIN
  FOR tracked_function IN
    SELECT p.oid::regprocedure AS function_signature
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'track_order_public'
  LOOP
    EXECUTE format(
      'REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated',
      tracked_function.function_signature
    );
  END LOOP;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS orders_tracking_token_unique_idx
  ON public.orders ((order_data ->> 'tracking_token'))
  WHERE order_data ->> 'tracking_token' IS NOT NULL;

CREATE OR REPLACE FUNCTION public.track_order_by_token(p_tracking_token text)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT jsonb_build_object(
    'order_number', order_row -> 'order_number',
    'status', order_row -> 'status',
    'created_at', order_row -> 'created_at',
    'confirmed_at', order_row -> 'confirmed_at',
    'preparing_at', order_row -> 'preparing_at',
    'out_for_delivery_at', order_row -> 'out_for_delivery_at',
    'delivered_at', order_row -> 'delivered_at',
    'items', order_row -> 'items',
    'shipping_address', order_row -> 'shipping_address',
    'total_price', order_row -> 'total_price',
    'gift_card_message', order_row -> 'gift_card_message',
    'order_data',
      CASE
        WHEN jsonb_typeof(order_row -> 'order_data') = 'object'
          THEN (order_row -> 'order_data') - 'tracking_token'
        ELSE order_row -> 'order_data'
      END,
    'prepared_photo_url', order_row -> 'prepared_photo_url',
    'ready_photo_url', order_row -> 'ready_photo_url'
  )
  FROM (
    SELECT to_jsonb(o) AS order_row
    FROM public.orders o
    WHERE p_tracking_token ~ '^[a-f0-9]{64}$'
      AND o.order_data ->> 'tracking_token' = p_tracking_token
    LIMIT 1
  ) matched;
$$;

REVOKE ALL ON FUNCTION public.track_order_by_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_order_by_token(text) TO anon, authenticated;
