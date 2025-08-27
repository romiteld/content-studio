#!/bin/bash

# Test deployed Vercel AI agents
URL="https://content-studio-theta.vercel.app"

echo "🚀 Testing Deployed AI Agents on Vercel"
echo "========================================="

# Test endpoint
echo -e "\n📍 Test Endpoint:"
curl -s -X POST "$URL/api/agents/test" \
  -H "Content-Type: application/json" \
  -d '{}' | jq . || echo "Failed"

# Generate talent ticker
echo -e "\n📊 Generate Talent Ticker:"
curl -s -X POST "$URL/api/agents/generate" \
  -H "Content-Type: application/json" \
  -d '{"type": "talent_ticker", "params": {"date": "2025-08-27"}}' | jq '.content.text' | head -c 200

# Validate compliance
echo -e "\n\n✅ Validate Compliance:"
curl -s -X POST "$URL/api/agents/validate" \
  -H "Content-Type: application/json" \
  -d '{"content": "Join our firm!", "type": "marketing"}' | jq '.validation.score'

# Visual prompt
echo -e "\n\n🎨 Generate Visual Prompt:"
curl -s -X POST "$URL/api/agents/visual" \
  -H "Content-Type: application/json" \
  -d '{"action": "prompt", "params": {"description": "wealth advisor"}}' | jq '.success'

# Weekly calendar
echo -e "\n\n📅 Generate Weekly Calendar:"
curl -s -X POST "$URL/api/agents/weekly" \
  -H "Content-Type: application/json" \
  -d '{"action": "calendar", "params": {"theme": "Q4"}}' | jq '.success'

echo -e "\n\n✨ Test Complete!"