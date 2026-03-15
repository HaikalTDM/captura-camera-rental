const fs = require('fs');
const file = 'Important Docs/captura-n8n-workflow.json';

try {
  let data = JSON.parse(fs.readFileSync(file, 'utf8'));

  // 1. Add the new tool node
  data.nodes.push({
    "parameters": {
      "method": "POST",
      "url": "https://www.captura.my/api/n8n/bookings/create",
      "sendBody": true,
      "specifyBody": "json",
      "jsonBody": "={\n  \"customer_name\": \"{{ $fromAI('customer_name') }}\",\n  \"customer_phone\": \"{{ $fromAI('customer_phone') }}\",\n  \"customer_email\": \"{{ $fromAI('customer_email') }}\",\n  \"camera_name\": \"{{ $fromAI('camera_name') }}\",\n  \"start_date\": \"{{ $fromAI('start_date', 'YYYY-MM-DD') }}\",\n  \"end_date\": \"{{ $fromAI('end_date', 'YYYY-MM-DD') }}\",\n  \"pickup_method\": \"{{ $fromAI('pickup_method', 'pickup or delivery') }}\",\n  \"special_requests\": \"{{ $fromAI('special_requests') }}\"\n}"
    },
    "id": "e6a12b4f-8c01-4991-bdfc-23ccd618037a",
    "name": "Create Booking API Tool",
    "type": "@n8n/n8n-nodes-langchain.toolHttpRequest",
    "typeVersion": 1.1,
    "position": [
      1440,
      16
    ]
  });

  // 2. Add the connection routing it to the GLM node
  data.connections["Create Booking API Tool"] = {
    "ai_tool": [
      [
        {
          "node": "GLM 4.7 Personal Agent",
          "type": "ai_tool",
          "index": 0
        }
      ]
    ]
  };

  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log('Successfully updated workflow JSON.');
} catch (e) {
  console.error('Error:', e);
}
