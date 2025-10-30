#!/bin/bash

# Test Login Script
# This will help debug the login issue

echo "==================================="
echo "Testing Login API"
echo "==================================="
echo ""

# Change these to your actual credentials
EMAIL="nadeeshafernando2020@gmail.com"
PASSWORD="your-password-here"

echo "Testing login with:"
echo "Email: $EMAIL"
echo "Password: $PASSWORD"
echo ""

echo "Sending login request..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

# Extract HTTP status code
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo ""
echo "Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""
echo "HTTP Status Code: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Login successful!"
else
    echo "❌ Login failed!"
    echo ""
    echo "Check the server logs (terminal where 'npm run dev' is running) for detailed error messages."
fi

echo ""
echo "==================================="
