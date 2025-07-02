import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting shop payments sync...')

    // Get all orders that have commission or delivery charges but no payment records
    const { data: ordersNeedingPayments, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        shop_name,
        commission,
        delivery_charge,
        created_at,
        shop_payments!inner(id)
      `)
      .or('commission.gt.0,delivery_charge.gt.0')

    if (ordersError) {
      console.error('Error fetching orders:', ordersError)
      throw ordersError
    }

    console.log(`Found ${ordersNeedingPayments?.length || 0} orders with charges`)

    // Get orders that don't have corresponding payment records
    const { data: allOrders, error: allOrdersError } = await supabase
      .from('orders')
      .select('id, shop_name, commission, delivery_charge, created_at')
      .or('commission.gt.0,delivery_charge.gt.0')

    if (allOrdersError) {
      console.error('Error fetching all orders:', allOrdersError)
      throw allOrdersError
    }

    console.log(`Processing ${allOrders?.length || 0} orders with charges`)

    let syncedCount = 0

    for (const order of allOrders || []) {
      // Check if payment records already exist for this order
      const { data: existingPayments, error: paymentsError } = await supabase
        .from('shop_payments')
        .select('id')
        .eq('order_id', order.id)

      if (paymentsError) {
        console.error(`Error checking payments for order ${order.id}:`, paymentsError)
        continue
      }

      // Skip if payments already exist
      if (existingPayments && existingPayments.length > 0) {
        continue
      }

      const paymentsToInsert = []

      // Create commission payment record
      if (order.commission && order.commission > 0) {
        paymentsToInsert.push({
          shop_name: order.shop_name,
          amount: order.commission,
          payment_date: new Date(order.created_at).toISOString().split('T')[0],
          payment_type: 'commission',
          order_id: order.id,
          payment_status: 'pending'
        })
      }

      // Create delivery charge payment record
      if (order.delivery_charge && order.delivery_charge > 0) {
        paymentsToInsert.push({
          shop_name: order.shop_name,
          amount: order.delivery_charge,
          payment_date: new Date(order.created_at).toISOString().split('T')[0],
          payment_type: 'delivery_charge',
          order_id: order.id,
          payment_status: 'pending'
        })
      }

      if (paymentsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('shop_payments')
          .insert(paymentsToInsert)

        if (insertError) {
          console.error(`Error inserting payments for order ${order.id}:`, insertError)
        } else {
          syncedCount++
          console.log(`Synced payments for order ${order.id}: ${paymentsToInsert.length} records`)
        }
      }
    }

    console.log(`Sync completed. Created payment records for ${syncedCount} orders.`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced shop payments for ${syncedCount} orders`,
        ordersProcessed: allOrders?.length || 0,
        paymentsCreated: syncedCount
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in sync-shop-payments function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})