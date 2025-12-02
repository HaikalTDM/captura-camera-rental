import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * AI Assistant API Route for Admin Dashboard
 * Uses DeepSeek API with function calling to answer questions about bookings, availability, etc.
 */

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface FunctionCall {
  name: string;
  arguments: string;
}

// Define available functions that the AI can call
const functions = [
  {
    name: 'check_camera_availability',
    description: 'Check if a camera is available for a specific date range',
    parameters: {
      type: 'object',
      properties: {
        camera_name: {
          type: 'string',
          description: 'Name of the camera (e.g., "GoPro Hero 13", "DJI Osmo Pocket 3")'
        },
        start_date: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format'
        },
        end_date: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format'
        }
      },
      required: ['start_date', 'end_date']
    }
  },
  {
    name: 'get_booking_details',
    description: 'Get details about a specific booking by ID',
    parameters: {
      type: 'object',
      properties: {
        booking_id: {
          type: 'string',
          description: 'The booking ID'
        }
      },
      required: ['booking_id']
    }
  },
  {
    name: 'get_recent_bookings',
    description: 'Get recent bookings with optional filters',
    parameters: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'confirmed', 'cancelled', 'completed'],
          description: 'Filter by booking status'
        },
        limit: {
          type: 'number',
          description: 'Number of bookings to return (default 10)'
        }
      }
    }
  },
  {
    name: 'get_customer_info',
    description: 'Get customer information by name or email',
    parameters: {
      type: 'object',
      properties: {
        search_term: {
          type: 'string',
          description: 'Customer name or email to search for'
        }
      },
      required: ['search_term']
    }
  },
  {
    name: 'get_upcoming_pickups',
    description: 'Get upcoming equipment pickups',
    parameters: {
      type: 'object',
      properties: {
        days_ahead: {
          type: 'number',
          description: 'Number of days to look ahead (default 7)'
        }
      }
    }
  },
  {
    name: 'get_upcoming_returns',
    description: 'Get upcoming equipment returns',
    parameters: {
      type: 'object',
      properties: {
        days_ahead: {
          type: 'number',
          description: 'Number of days to look ahead (default 7)'
        }
      }
    }
  },
  {
    name: 'get_all_cameras',
    description: 'Get list of all available cameras with their details',
    parameters: {
      type: 'object',
      properties: {}
    }
  }
];

// Function implementations
async function checkCameraAvailability(params: any) {
  const { camera_name, start_date, end_date } = params;

  // Get camera info
  let query = supabaseAdmin.from('cameras').select('*');

  if (camera_name) {
    query = query.ilike('name', `%${camera_name}%`);
  }

  const { data: cameras } = await query;

  if (!cameras || cameras.length === 0) {
    return { available: false, message: 'Camera not found' };
  }

  // Check for conflicting bookings
  const results = [];
  for (const camera of cameras) {
    const { data: bookings } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('camera_id', camera.id)
      .in('booking_status', ['pending', 'confirmed'])
      .lte('start_date', end_date)
      .gte('end_date', start_date);

    results.push({
      camera: camera.name,
      available: !bookings || bookings.length === 0,
      conflicting_bookings: bookings?.length || 0,
      daily_rate: camera.daily_rate,
      weekly_rate: camera.weekly_rate
    });
  }

  return results;
}

async function getBookingDetails(params: any) {
  const { booking_id } = params;

  const { data: booking } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('id', booking_id)
    .single();

  if (!booking) {
    return { error: 'Booking not found' };
  }

  // Fetch related data
  const [{ data: customer }, { data: camera }] = await Promise.all([
    supabaseAdmin.from('customers').select('*').eq('id', booking.customer_id).single(),
    supabaseAdmin.from('cameras').select('*').eq('id', booking.camera_id).single()
  ]);

  return {
    booking_id: booking.id,
    status: booking.booking_status,
    customer: customer ? {
      name: customer.full_name || customer.name,
      email: customer.email,
      phone: customer.phone
    } : null,
    camera: camera?.name,
    start_date: booking.start_date,
    end_date: booking.end_date,
    pickup_date: booking.pickup_date,
    total_amount: booking.total_amount,
    pickup_method: booking.pickup_method,
    equipment_picked_up: booking.equipment_picked_up,
    equipment_returned: booking.equipment_returned
  };
}

async function getRecentBookings(params: any) {
  const { status, limit = 30 } = params;

  let query = supabaseAdmin
    .from('bookings')
    .select('id, booking_status, start_date, end_date, pickup_date, total_amount, customer_id, camera_id, created_at')
    .order('start_date', { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq('booking_status', status);
  }

  const { data: bookings } = await query;

  if (!bookings || bookings.length === 0) {
    return { message: 'No bookings found' };
  }

  // Batch fetch customers and cameras
  const customerIds = Array.from(new Set(bookings.map(b => b.customer_id)));
  const cameraIds = Array.from(new Set(bookings.map(b => b.camera_id)));

  const [{ data: customers }, { data: cameras }] = await Promise.all([
    supabaseAdmin.from('customers').select('*').in('id', customerIds),
    supabaseAdmin.from('cameras').select('*').in('id', cameraIds)
  ]);

  const customerMap = new Map(customers?.map(c => [c.id, c]));
  const cameraMap = new Map(cameras?.map(c => [c.id, c]));

  return bookings.map(b => ({
    id: b.id.substring(0, 8),
    customer: customerMap.get(b.customer_id)?.full_name || 'N/A',
    camera: cameraMap.get(b.camera_id)?.name || 'N/A',
    rental_dates: `${b.start_date} to ${b.end_date}`,
    pickup_date: b.pickup_date,
    status: b.booking_status,
    amount: `RM${b.total_amount}`,
    booked_on: b.created_at?.split('T')[0]
  }));
}

async function getCustomerInfo(params: any) {
  const { search_term } = params;

  const { data: customers } = await supabaseAdmin
    .from('customers')
    .select('*')
    .or(`full_name.ilike.%${search_term}%,email.ilike.%${search_term}%,phone.ilike.%${search_term}%`)
    .limit(5);

  return customers?.map(c => ({
    name: c.full_name || c.name,
    email: c.email,
    phone: c.phone,
    ic_number: c.ic_number
  })) || [];
}

async function getUpcomingPickups(params: any) {
  const { days_ahead = 7 } = params;

  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days_ahead);

  const { data: bookings } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('equipment_picked_up', false)
    .eq('booking_status', 'confirmed')
    .gte('pickup_date', today.toISOString().split('T')[0])
    .lte('pickup_date', futureDate.toISOString().split('T')[0])
    .order('pickup_date', { ascending: true });

  if (!bookings || bookings.length === 0) {
    return { message: 'No upcoming pickups in the next ' + days_ahead + ' days' };
  }

  // Batch fetch customers and cameras
  const customerIds = Array.from(new Set(bookings.map(b => b.customer_id)));
  const cameraIds = Array.from(new Set(bookings.map(b => b.camera_id)));

  const [{ data: customers }, { data: cameras }] = await Promise.all([
    supabaseAdmin.from('customers').select('*').in('id', customerIds),
    supabaseAdmin.from('cameras').select('*').in('id', cameraIds)
  ]);

  const customerMap = new Map(customers?.map(c => [c.id, c]));
  const cameraMap = new Map(cameras?.map(c => [c.id, c]));

  return bookings.map(b => ({
    pickup_date: b.pickup_date,
    customer: customerMap.get(b.customer_id)?.full_name || 'N/A',
    camera: cameraMap.get(b.camera_id)?.name || 'N/A',
    rental_period: `${b.start_date} to ${b.end_date}`,
    method: b.pickup_method
  }));
}

async function getUpcomingReturns(params: any) {
  const { days_ahead = 7 } = params;

  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days_ahead);

  const { data: bookings } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('equipment_picked_up', true)
    .eq('equipment_returned', false)
    .eq('booking_status', 'confirmed')
    .gte('end_date', today.toISOString().split('T')[0])
    .lte('end_date', futureDate.toISOString().split('T')[0])
    .order('end_date', { ascending: true });

  if (!bookings || bookings.length === 0) {
    return { message: 'No upcoming returns in the next ' + days_ahead + ' days' };
  }

  // Batch fetch customers and cameras
  const customerIds = Array.from(new Set(bookings.map(b => b.customer_id)));
  const cameraIds = Array.from(new Set(bookings.map(b => b.camera_id)));

  const [{ data: customers }, { data: cameras }] = await Promise.all([
    supabaseAdmin.from('customers').select('*').in('id', customerIds),
    supabaseAdmin.from('cameras').select('*').in('id', cameraIds)
  ]);

  const customerMap = new Map(customers?.map(c => [c.id, c]));
  const cameraMap = new Map(cameras?.map(c => [c.id, c]));

  return bookings.map(b => ({
    return_date: b.end_date,
    customer: customerMap.get(b.customer_id)?.full_name || 'N/A',
    camera: cameraMap.get(b.camera_id)?.name || 'N/A',
    rental_period: `${b.start_date} to ${b.end_date}`
  }));
}

async function getAllCameras() {
  const { data: cameras } = await supabaseAdmin
    .from('cameras')
    .select('*')
    .order('name', { ascending: true });

  return cameras?.map(c => ({
    name: c.name,
    daily_rate: `RM${c.daily_rate}`,
    weekly_rate: c.weekly_rate ? `RM${c.weekly_rate}` : 'N/A',
    status: c.status
  })) || [];
}

// Execute function calls
async function executeFunction(name: string, args: any) {
  switch (name) {
    case 'check_camera_availability':
      return await checkCameraAvailability(args);
    case 'get_booking_details':
      return await getBookingDetails(args);
    case 'get_recent_bookings':
      return await getRecentBookings(args);
    case 'get_customer_info':
      return await getCustomerInfo(args);
    case 'get_upcoming_pickups':
      return await getUpcomingPickups(args);
    case 'get_upcoming_returns':
      return await getUpcomingReturns(args);
    case 'get_all_cameras':
      return await getAllCameras();
    default:
      return { error: 'Unknown function' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!process.env.DEEPSEEK_API_KEY) {
      console.error('❌ DEEPSEEK_API_KEY is not set');
      return NextResponse.json(
        { error: 'DeepSeek API key not configured. Please add DEEPSEEK_API_KEY to environment variables.' },
        { status: 500 }
      );
    }

    console.log('✅ DeepSeek API key found, processing request...');

    // Fetch actual cameras from database
    const { data: cameras } = await supabaseAdmin
      .from('cameras')
      .select('name, daily_rate, weekly_rate, monthly_rate, discount_threshold, status')
      .eq('status', 'available')
      .order('name', { ascending: true });

    const cameraList = cameras && cameras.length > 0
      ? cameras.map(c => {
        const threshold = c.discount_threshold || 3;
        const discountRate = c.weekly_rate ? Math.round(c.weekly_rate / 7) : c.daily_rate;
        return `- ${c.name} (Daily: RM${c.daily_rate}, ${threshold}+ days: RM${discountRate}/day)`;
      }).join('\n')
      : '- No cameras currently available';

    // Fetch recent booking stats
    const { data: recentBookings } = await supabaseAdmin
      .from('bookings')
      .select('booking_status')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const bookingStats = recentBookings ? {
      total: recentBookings.length,
      pending: recentBookings.filter(b => b.booking_status === 'pending').length,
      confirmed: recentBookings.filter(b => b.booking_status === 'confirmed').length
    } : { total: 0, pending: 0, confirmed: 0 };

    // Add system message with context
    const systemMessage = {
      role: 'system',
      content: `You are an AI assistant for Captura's camera rental business admin dashboard in Malaysia.

CRITICAL RULES - YOU MUST FOLLOW THESE:
1. NEVER make up data or give fake information
2. ALWAYS call the appropriate function to get real data from the database
3. If you don't know something, call a function to find out
4. NEVER assume or guess - only use real database data

Current date: ${new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}
Current time: ${new Date().toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })}

ACTUAL CAMERAS IN DATABASE (as of now):
${cameraList}

Recent Activity (Last 30 days):
- Total bookings: ${bookingStats.total}
- Pending approvals: ${bookingStats.pending}
- Confirmed bookings: ${bookingStats.confirmed}

AVAILABLE FUNCTIONS YOU MUST USE:
1. get_all_cameras - Get complete list of cameras with pricing
2. check_camera_availability - Check if camera is available for dates
3. get_booking_details - Get specific booking information
4. get_recent_bookings - Get recent bookings (with status filter)
5. get_customer_info - Search for customer by name/email/phone
6. get_upcoming_pickups - Get pickups in next X days
7. get_upcoming_returns - Get returns due in next X days

HOW TO RESPOND TO QUESTIONS:
- "What cameras do you have?" → CALL get_all_cameras function
- "Is [camera] available on [date]?" → CALL check_camera_availability function
- "Show me recent bookings" or "this week/month bookings" → CALL get_recent_bookings function
- "What pickups today/tomorrow?" → CALL get_upcoming_pickups function
- "Find customer [name]" → CALL get_customer_info function
- "Show booking [id]" → CALL get_booking_details function
- "What returns are due?" → CALL get_upcoming_returns function

IMPORTANT: 
- When user asks about "this week" or "this month" bookings, use get_recent_bookings with appropriate limit
- "This week" means show at least 10-20 recent bookings (not just current week)
- "This month" or "October" means show recent bookings from the past 30 days
- The get_recent_bookings function shows recent bookings in chronological order

IMPORTANT:
- Format all prices in Malaysian Ringgit (RM)
- Use YYYY-MM-DD format for dates
- Today's date: ${new Date().toISOString().split('T')[0]}
- Tomorrow's date: ${new Date(Date.now() + 86400000).toISOString().split('T')[0]}

BUSINESS RULES:
- Pickup time: After 10:00 PM (day before rental starts)
- Return time: By 8:00 PM on rental end date
- Standard rate: RM50/day
- Discount rate: RM45/day for 3+ days rental

If the user asks ANY question about:
- Cameras → Call get_all_cameras or check_camera_availability
- Bookings → Call get_recent_bookings or get_booking_details
- Customers → Call get_customer_info
- Pickups → Call get_upcoming_pickups
- Returns → Call get_upcoming_returns

NEVER say things like "you have 5 cameras" or "here are your bookings" without calling the function first!

FUNCTION CALLING FORMAT:
You MUST use the function_call feature. When you need data, immediately call the appropriate function.
DO NOT respond with text first - call the function IMMEDIATELY and let me handle showing the user the results.`
    };

    const allMessages = [systemMessage, ...messages];

    // Call DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: allMessages,
        functions: functions,
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ DeepSeek API error:', response.status, errorText);

      // Parse error if possible
      try {
        const errorJson = JSON.parse(errorText);
        console.error('❌ Error details:', errorJson);
        throw new Error(`DeepSeek API error: ${errorJson.error?.message || errorText}`);
      } catch {
        throw new Error(`DeepSeek API error (${response.status}): ${errorText}`);
      }
    }

    const data = await response.json();
    console.log('✅ Received response from DeepSeek');

    if (!data.choices || data.choices.length === 0) {
      console.error('❌ No choices in response:', JSON.stringify(data, null, 2));
      throw new Error('DeepSeek returned empty response');
    }

    const assistantMessage = data.choices[0].message;
    let functionName = null;
    let functionArgs = null;

    // Check if AI wants to call a function (new tools format)
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolCall = assistantMessage.tool_calls[0];
      if (toolCall.type === 'function') {
        functionName = toolCall.function.name;
        functionArgs = JSON.parse(toolCall.function.arguments);
      }
    }
    // Check if AI wants to call a function (old function_call format)
    else if (assistantMessage.function_call) {
      functionName = assistantMessage.function_call.name;
      functionArgs = JSON.parse(assistantMessage.function_call.arguments);
    }
    // Check if function call is in the content (XML format - fallback)
    else if (assistantMessage.content && assistantMessage.content.includes('<function_calls>')) {
      console.log('🔍 Detected function call in content (XML format)');
      const invokeMatch = assistantMessage.content.match(/<invoke name="([^"]+)">/);
      if (invokeMatch) {
        functionName = invokeMatch[1];
        functionArgs = {};

        // Extract parameters
        const paramMatches = [...assistantMessage.content.matchAll(/<parameter name="([^"]+)">([^<]+)<\/parameter>/g)];
        for (const match of paramMatches) {
          const paramName = match[1];
          const paramValue = match[2];
          // Try to parse as JSON, otherwise use as string
          try {
            functionArgs[paramName] = JSON.parse(paramValue);
          } catch {
            functionArgs[paramName] = paramValue;
          }
        }
      }
    }

    // If we have a function to call, execute it
    if (functionName && functionArgs) {
      console.log(`🔧 AI called function: ${functionName}`);
      console.log(`📝 With arguments:`, functionArgs);

      // Execute the function
      const functionResult = await executeFunction(functionName, functionArgs);
      console.log(`✅ Function result:`, JSON.stringify(functionResult).substring(0, 200) + '...');

      // Format the function result into a readable response
      let formattedResult = '';

      if (Array.isArray(functionResult)) {
        if (functionResult.length === 0) {
          formattedResult = 'No results found.';
        } else {
          formattedResult = JSON.stringify(functionResult, null, 2);
        }
      } else if (typeof functionResult === 'object') {
        formattedResult = JSON.stringify(functionResult, null, 2);
      } else {
        formattedResult = String(functionResult);
      }

      // Send function result back to AI with simplified context
      const secondResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `You are a helpful assistant for Captura camera rental business in Malaysia. Your responses must be BEAUTIFUL, CLEAR, and EASY TO SCAN.

🎨 FORMATTING RULES (STRICTLY FOLLOW):

1. **Use Emojis Consistently:**
   • 📊 Summary/Stats
   • 📅 Dates
   • 👤 Customers
   • 📸 Cameras
   • 💰 Money/Amounts
   • ✅ Confirmed/Available/Success
   • ❌ Cancelled/Unavailable/Error
   • 📦 Pickup
   • 🔙 Return
   • 🎯 Total/Summary

2. **Bold Important Info:** Use **bold** for:
   • Customer names
   • Camera names
   • Amounts (RM)
   • Dates
   • Status

3. **Structure Your Response:**
   ### Summary (if multiple items)
   
   [Main content with bullet points]
   
   ---
   💡 **Key Insight or Total**

4. **Use Bullet Points (•) for Details:**
   • Each detail on its own line
   • Start with relevant emoji
   • Keep it concise

5. **Spacing & Readability:**
   • Use blank lines between different bookings/items
   • Group related information together
   • Add a separator (---) before summary

PERFECT EXAMPLE FOR BOOKINGS:

### 📊 October 2025 Bookings (8 Total)

**📅 Oct 29** (1 day)
• 👤 **Nur amy ardillah**
• 📸 DJI Osmo Pocket 3
• 💰 **RM50**
• 📦 Pickup: Oct 28
• ✅ Confirmed

**📅 Oct 26** (1 day)
• 👤 **Siti Noranis Izzati**
• 📸 DJI Osmo Pocket 3
• 💰 **RM50**
• 📦 Pickup: Oct 25
• ✅ Confirmed

**📅 Oct 25 - Nov 2** (9 days)
• 👤 **Syed Fauzi**
• 📸 DJI Osmo Pocket 3 (ii)
• 💰 **RM405**
• 📦 Pickup: Oct 24
• ✅ Confirmed

---
🎯 **Total Revenue:** RM1,280 | **Average:** RM160/booking

PERFECT EXAMPLE FOR CAMERAS:

### 📸 Available Cameras (3)

1. **DJI Action 5 Pro**
   • 💰 RM50/day | RM45/day (3+ days)
   • ✅ Available

2. **DJI Osmo Pocket 3**
   • 💰 RM50/day | RM45/day (3+ days)
   • ✅ Available

3. **DJI Osmo Pocket 3 (ii)**
   • 💰 RM50/day | RM45/day (3+ days)
   • ✅ Available

PERFECT EXAMPLE FOR AVAILABILITY:

✅ **DJI Action 5 Pro is AVAILABLE**

📅 Requested: Oct 20-22, 2025

• No conflicting bookings
• Ready for rental
• Pickup after 10:00 PM (Oct 19)

💡 Daily rate: RM50 | 3+ days: RM45/day

REMEMBER:
• Always start with a summary for multiple items
• Use visual hierarchy (headings, bold, bullets)
• Add emojis for quick scanning
• End with helpful insights or totals
• Keep it professional but friendly
• Make numbers stand out with bold`
            },
            {
              role: 'user',
              content: messages[messages.length - 1].content
            },
            {
              role: 'assistant',
              content: `I retrieved this data:\n\n${formattedResult}\n\nFormatting it beautifully:`
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      if (!secondResponse.ok) {
        const errorText = await secondResponse.text();
        console.error('❌ DeepSeek second call error:', secondResponse.status, errorText);
        throw new Error(`DeepSeek second call failed: ${errorText}`);
      }

      const secondData = await secondResponse.json();
      console.log('📦 Second response:', JSON.stringify(secondData, null, 2));

      if (!secondData.choices || secondData.choices.length === 0) {
        console.error('❌ No choices in second response');
        throw new Error('DeepSeek returned empty response after function call');
      }

      const finalMessage = secondData.choices[0].message?.content || 'Function executed successfully.';
      console.log(`💬 Final response after function call:`, finalMessage.substring(0, 100) + '...');

      return NextResponse.json({
        message: finalMessage,
        function_called: functionName
      });
    }

    // Return direct response if no function call
    console.log('⚠️ No function was called - AI responded directly');
    console.log(`💬 Direct response:`, assistantMessage.content?.substring(0, 100) + '...');

    return NextResponse.json({
      message: assistantMessage.content || 'Sorry, I could not process that request.'
    });

  } catch (error) {
    console.error('❌ AI Assistant error:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Return more detailed error
    return NextResponse.json(
      {
        error: 'Failed to process request',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

