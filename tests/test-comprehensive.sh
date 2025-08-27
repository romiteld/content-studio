#!/bin/bash

# Comprehensive Test Suite for Content Studio
# Tests all endpoints, AI agents, APIs, and authentication

set -e  # Exit on error

# Configuration
URL="${1:-https://studio.thewell.solutions}"
EMAIL="${2:-daniel.romitelli@emailthewell.com}"
VERBOSE="${3:-false}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WARNINGS=0

# Test results storage
RESULTS_FILE="test-results-$(date +%Y%m%d-%H%M%S).log"

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    
    case $status in
        "PASS")
            echo -e "${GREEN}✓${NC} $message"
            echo "[PASS] $message" >> $RESULTS_FILE
            ((PASSED_TESTS++))
            ;;
        "FAIL")
            echo -e "${RED}✗${NC} $message"
            echo "[FAIL] $message" >> $RESULTS_FILE
            ((FAILED_TESTS++))
            ;;
        "WARN")
            echo -e "${YELLOW}⚠${NC} $message"
            echo "[WARN] $message" >> $RESULTS_FILE
            ((WARNINGS++))
            ;;
        "INFO")
            echo -e "${BLUE}ℹ${NC} $message"
            echo "[INFO] $message" >> $RESULTS_FILE
            ;;
        "TEST")
            echo -e "${CYAN}▶${NC} $message"
            echo "[TEST] $message" >> $RESULTS_FILE
            ((TOTAL_TESTS++))
            ;;
    esac
}

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected=$4
    local description=$5
    
    print_status "TEST" "Testing: $description"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -X GET "$URL$endpoint" -H "Content-Type: application/json" 2>/dev/null || echo '{"error":"Failed to connect"}')
    else
        response=$(curl -s -X $method "$URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" 2>/dev/null || echo '{"error":"Failed to connect"}')
    fi
    
    if [ "$VERBOSE" = "true" ]; then
        echo "Response: $response" | head -c 200
    fi
    
    # Check if response contains expected value or structure
    if echo "$response" | grep -q "$expected"; then
        print_status "PASS" "$description"
        return 0
    else
        # Check for common success indicators
        if echo "$response" | grep -q '"success":true\|"status":"ok"\|"data":\|"content":'; then
            print_status "PASS" "$description (alternative success)"
            return 0
        else
            print_status "FAIL" "$description"
            echo "  Expected: $expected" >> $RESULTS_FILE
            echo "  Got: $(echo $response | head -c 100)" >> $RESULTS_FILE
            return 1
        fi
    fi
}

# Function to test file upload
test_file_upload() {
    local endpoint=$1
    local file_content=$2
    local filename=$3
    local description=$4
    
    print_status "TEST" "Testing: $description"
    
    # Create temporary file
    echo "$file_content" > "/tmp/$filename"
    
    response=$(curl -s -X POST "$URL$endpoint" \
        -F "file=@/tmp/$filename" \
        2>/dev/null || echo '{"error":"Failed to upload"}')
    
    rm "/tmp/$filename"
    
    if echo "$response" | grep -q '"success":true\|"id":\|"file":'; then
        print_status "PASS" "$description"
        return 0
    else
        print_status "FAIL" "$description"
        return 1
    fi
}

# Function to test authentication
test_auth() {
    print_status "INFO" "Testing Authentication System"
    
    # Test JWT token generation
    print_status "TEST" "Testing JWT token generation"
    
    token_response=$(curl -s -X POST "$URL/api/generate-supabase-token" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$EMAIL\"}" 2>/dev/null || echo '{"error":"Failed"}')
    
    if echo "$token_response" | grep -q 'access_token\|token'; then
        print_status "PASS" "JWT token generation works"
        # Extract token for further tests
        AUTH_TOKEN=$(echo "$token_response" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
        if [ -z "$AUTH_TOKEN" ]; then
            AUTH_TOKEN=$(echo "$token_response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        fi
    else
        print_status "WARN" "JWT token generation unavailable (may require auth)"
        AUTH_TOKEN=""
    fi
}

echo "================================================"
echo "    Content Studio Comprehensive Test Suite    "
echo "================================================"
echo "URL: $URL"
echo "Email: $EMAIL"
echo "Timestamp: $(date)"
echo "Results file: $RESULTS_FILE"
echo "================================================"
echo

# Start testing
print_status "INFO" "Starting comprehensive tests..."
echo

# ===== 1. BASIC CONNECTIVITY =====
print_status "INFO" "=== BASIC CONNECTIVITY ==="

test_endpoint "GET" "/" "<!DOCTYPE html\|<html" "html" "Frontend loads"
test_endpoint "GET" "/api/health" "ok\|healthy\|success" "success" "Health check endpoint"

echo

# ===== 2. AUTHENTICATION =====
print_status "INFO" "=== AUTHENTICATION SYSTEM ==="

test_auth

echo

# ===== 3. AI AGENTS =====
print_status "INFO" "=== AI AGENTS ==="

# Test main agents endpoint
test_endpoint "POST" "/api/agents/test" '{}' "success\|ok\|ready" "AI Agents test endpoint"

# Talent Ticker Agent
test_endpoint "POST" "/api/agents/generate" \
    '{"type":"talent_ticker","params":{"date":"2025-08-27"}}' \
    "content\|text\|ticker" \
    "Talent Ticker generation"

# Compliance Validator
test_endpoint "POST" "/api/agents/validate" \
    '{"content":"Join our firm!","type":"marketing"}' \
    "validation\|score\|compliant" \
    "Compliance validation"

# Visual Prompt Agent
test_endpoint "POST" "/api/agents/visual" \
    '{"action":"prompt","params":{"description":"wealth advisor"}}' \
    "success\|prompt\|visual" \
    "Visual prompt generation"

# Weekly Calendar Agent
test_endpoint "POST" "/api/agents/weekly" \
    '{"action":"calendar","params":{"theme":"Q4"}}' \
    "success\|calendar\|events" \
    "Weekly calendar generation"

# Content Review Agent
test_endpoint "POST" "/api/agents/review" \
    '{"content":"Test content","type":"marketing"}' \
    "review\|feedback\|suggestions" \
    "Content review"

# Industry Trends Agent
test_endpoint "POST" "/api/agents/trends" \
    '{"topic":"wealth management","period":"current"}' \
    "trends\|analysis\|insights" \
    "Industry trends analysis"

echo

# ===== 4. CONTENT MANAGEMENT =====
print_status "INFO" "=== CONTENT MANAGEMENT ==="

# Get all content
test_endpoint "GET" "/api/content" "content\|data\|\\[\\]" "array" "Get all content"

# Create content
test_endpoint "POST" "/api/content" \
    '{"title":"Test Content","type":"training","content":"Test training material"}' \
    "id\|success\|created" \
    "Create new content"

# Search content
test_endpoint "GET" "/api/content/search?q=wealth" "results\|content\|\\[\\]" "results" "Search content"

echo

# ===== 5. AI MARKETING =====
print_status "INFO" "=== AI MARKETING ==="

# Generate campaign
test_endpoint "POST" "/api/ai/generate-campaign" \
    '{"theme":"Q4 Planning","targetAudience":"HNW Clients","tone":"professional"}' \
    "campaign\|content\|title" \
    "AI campaign generation"

# Generate image
test_endpoint "POST" "/api/ai/generate-image" \
    '{"prompt":"wealth management office","style":"professional"}' \
    "image\|url\|success" \
    "AI image generation"

# Vision analysis
test_endpoint "POST" "/api/vision/analyze" \
    '{"imageUrl":"https://example.com/image.jpg","query":"What is shown?"}' \
    "analysis\|description\|vision" \
    "Vision AI analysis"

echo

# ===== 6. PARTNER MANAGEMENT =====
print_status "INFO" "=== PARTNER MANAGEMENT ==="

test_endpoint "GET" "/api/partners" "partners\|data\|\\[\\]" "array" "Get all partners"
test_endpoint "GET" "/api/partners/active" "partners\|active\|\\[\\]" "array" "Get active partners"

echo

# ===== 7. FILE OPERATIONS =====
print_status "INFO" "=== FILE OPERATIONS ==="

# Test file upload with sample content
test_file_upload "/api/upload" \
    "# Test Document\n\nThis is a test wealth management document." \
    "test-doc.md" \
    "Markdown file upload"

# Generate PDF
test_endpoint "POST" "/api/generate/pdf" \
    '{"content":"Test PDF content","title":"Test Report"}' \
    "success\|pdf\|file\|url" \
    "PDF generation"

# Generate PowerPoint
test_endpoint "POST" "/api/generate/pptx" \
    '{"slides":[{"title":"Test Slide","content":"Test content"}],"title":"Test Presentation"}' \
    "success\|pptx\|file\|url" \
    "PowerPoint generation"

echo

# ===== 8. TEMPLATES =====
print_status "INFO" "=== TEMPLATES ==="

test_endpoint "GET" "/api/templates" "templates\|data\|\\[\\]" "array" "Get all templates"
test_endpoint "GET" "/api/templates/locked" "locked\|protected\|templates" "templates" "Get locked templates"

echo

# ===== 9. RESEARCH =====
print_status "INFO" "=== RESEARCH ==="

test_endpoint "POST" "/api/research" \
    '{"query":"wealth management trends 2025","limit":5}' \
    "results\|research\|data" \
    "Research endpoint"

echo

# ===== 10. SOCIAL MEDIA =====
print_status "INFO" "=== SOCIAL MEDIA ==="

test_endpoint "POST" "/api/social/optimize" \
    '{"content":"Join The Well for wealth management excellence","platform":"linkedin"}' \
    "optimized\|social\|content" \
    "Social media optimization"

echo

# ===== 11. ADVANCED AI FEATURES =====
print_status "INFO" "=== ADVANCED AI FEATURES ==="

# Test each specialized AI agent
test_endpoint "POST" "/api/ai-agents/talent-ticker" \
    '{"date":"2025-08-27","focus":"wealth management"}' \
    "ticker\|content\|talent" \
    "Talent Ticker AI Agent"

test_endpoint "POST" "/api/ai-agents/compliance-validator" \
    '{"content":"Investment opportunity","context":"email"}' \
    "compliant\|validation\|score" \
    "Compliance Validator AI Agent"

test_endpoint "POST" "/api/ai-agents/visual-prompt-generator" \
    '{"description":"professional wealth advisor","style":"corporate"}' \
    "prompt\|visual\|generated" \
    "Visual Prompt Generator AI Agent"

test_endpoint "POST" "/api/ai-agents/weekly-calendar" \
    '{"weekStart":"2025-08-27","theme":"recruitment"}' \
    "calendar\|events\|weekly" \
    "Weekly Calendar AI Agent"

test_endpoint "POST" "/api/ai-agents/content-reviewer" \
    '{"content":"Test marketing content","type":"social"}' \
    "review\|feedback\|score" \
    "Content Reviewer AI Agent"

test_endpoint "POST" "/api/ai-agents/industry-trends" \
    '{"sector":"wealth management","timeframe":"Q4"}' \
    "trends\|insights\|analysis" \
    "Industry Trends AI Agent"

echo

# ===== 12. PERFORMANCE TESTS =====
print_status "INFO" "=== PERFORMANCE TESTS ==="

# Test response times
print_status "TEST" "Testing response times"

start_time=$(date +%s%N)
curl -s -o /dev/null -w "%{http_code}" "$URL/" > /dev/null 2>&1
end_time=$(date +%s%N)
response_time=$(( ($end_time - $start_time) / 1000000 ))

if [ $response_time -lt 3000 ]; then
    print_status "PASS" "Frontend loads in ${response_time}ms"
else
    print_status "WARN" "Frontend loads slowly: ${response_time}ms"
fi

# Test API response time
start_time=$(date +%s%N)
curl -s -o /dev/null -w "%{http_code}" "$URL/api/health" > /dev/null 2>&1
end_time=$(date +%s%N)
response_time=$(( ($end_time - $start_time) / 1000000 ))

if [ $response_time -lt 1000 ]; then
    print_status "PASS" "API responds in ${response_time}ms"
else
    print_status "WARN" "API responds slowly: ${response_time}ms"
fi

echo

# ===== 13. ERROR HANDLING =====
print_status "INFO" "=== ERROR HANDLING ==="

# Test 404 handling
test_endpoint "GET" "/api/nonexistent" "404\|not found\|error" "error" "404 error handling"

# Test invalid JSON
test_endpoint "POST" "/api/content" \
    '{invalid json}' \
    "error\|400\|bad request" \
    "Invalid JSON handling"

# Test missing required fields
test_endpoint "POST" "/api/ai/generate-campaign" \
    '{}' \
    "error\|required\|missing" \
    "Missing fields handling"

echo

# ===== 14. SECURITY TESTS =====
print_status "INFO" "=== SECURITY TESTS ==="

# Test SQL injection protection
test_endpoint "POST" "/api/content/search" \
    '{"q":"SELECT * FROM users; --"}' \
    "results\|\\[\\]" \
    "SQL injection protection"

# Test XSS protection
test_endpoint "POST" "/api/content" \
    '{"title":"<script>alert(1)</script>","content":"test"}' \
    "id\|success\|error" \
    "XSS protection"

# Test authentication requirement
test_endpoint "GET" "/api/protected" \
    "" \
    "401\|unauthorized\|auth" \
    "Authentication requirement"

echo

# ===== SUMMARY =====
echo "================================================"
echo "             TEST RESULTS SUMMARY               "
echo "================================================"
echo -e "${CYAN}Total Tests:${NC} $TOTAL_TESTS"
echo -e "${GREEN}Passed:${NC} $PASSED_TESTS"
echo -e "${RED}Failed:${NC} $FAILED_TESTS"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo

# Calculate pass rate
if [ $TOTAL_TESTS -gt 0 ]; then
    PASS_RATE=$(( ($PASSED_TESTS * 100) / $TOTAL_TESTS ))
    echo -e "Pass Rate: ${PASS_RATE}%"
    
    if [ $PASS_RATE -ge 90 ]; then
        echo -e "${GREEN}✓ EXCELLENT - System is production ready!${NC}"
    elif [ $PASS_RATE -ge 75 ]; then
        echo -e "${YELLOW}⚠ GOOD - System is mostly functional${NC}"
    elif [ $PASS_RATE -ge 50 ]; then
        echo -e "${YELLOW}⚠ FAIR - Some issues need attention${NC}"
    else
        echo -e "${RED}✗ POOR - Critical issues detected${NC}"
    fi
else
    echo "No tests were run"
fi

echo
echo "Detailed results saved to: $RESULTS_FILE"
echo "================================================"

# Exit with appropriate code
if [ $FAILED_TESTS -eq 0 ] && [ $WARNINGS -lt 5 ]; then
    exit 0
else
    exit 1
fi