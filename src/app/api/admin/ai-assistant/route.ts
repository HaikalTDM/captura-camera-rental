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
  const { status, limit = 10 } = params;
  
  let query = supabaseAdmin
    .from('bookings')
    .select('*, customers!customer_id(full_name, email, phone), cameras!camera_id(name)')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (status) {
    query = query.eq('booking_status', status);
  }
  
  const { data: bookings } = await query;
  
  return bookings?.map(b => ({
    id: b.id.substring(0, 8),
    customer: b.customers?.full_name || 'N/A',
    camera: b.cameras?.name || 'N/A',
    dates: `${b.start_date} to ${b.end_date}`,
    status: b.booking_status,
    amount: `RM${b.total_amount}`
  })) || [];
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
      return NextResponse.json(
        { error: 'DeepSeek API key not configured' },
        { status: 500 }
      );
    }
    
    // Add system message with context
    const systemMessage = {
      role: 'system',
      content: `You are an AI assistant for Captura's camera rental business admin dashboard. 
You help the admin check bookings, availability, customer information, and answer questions about the business.

Current date: ${new Date().toLocaleDateString('en-MY')}

Guidelines:
- Be concise and professional
- Use the available functions to query real data from the database
- When checking availability, always mention the specific dates and camera names
- Format prices in Malaysian Ringgit (RM)
- For date queries, use YYYY-MM-DD format
- If asked about "today" or "tomorrow", calculate the appropriate dates

Available cameras:
- GoPro Hero 13 Black
- DJI Osmo Pocket 3
- DJI Osmo Pocket 3 (ii)
- Sony A7 IV

Pickup time: After 9:30 PM
Return time: By 10:00 PM on the end date`
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
        function_call: 'auto',
        temperature: 0.7,
        max_tokens: 2000
      })
    });
    
    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    const assistantMessage = data.choices[0].message;
    
    // Check if AI wants to call a function
    if (assistantMessage.function_call) {
      const functionName = assistantMessage.function_call.name;
      const functionArgs = JSON.parse(assistantMessage.function_call.arguments);
      
      // Execute the function
      const functionResult = await executeFunction(functionName, functionArgs);
      
      // Send function result back to AI
      const secondResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            ...allMessages,
            assistantMessage,
            {
              role: 'function',
              name: functionName,
              content: JSON.stringify(functionResult)
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });
      
      const secondData = await secondResponse.json();
      return NextResponse.json({
        message: secondData.choices[0].message.content,
        function_called: functionName
      });
    }
    
    // Return direct response if no function call
    return NextResponse.json({
      message: assistantMessage.content
    });
    
  } catch (error) {
    console.error('AI Assistant error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

