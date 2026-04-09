#!/bin/bash
# Comprehensive Teacher & Admin API Test Script
# Tests every teacher/admin endpoint with real data

BASE="http://localhost:5000/api"
PASS=0
FAIL=0
ERRORS=""

# Login as teacher
TRESP=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"testteacher@audit.com","password":"Test@1234"}')
T_TOKEN=$(echo "$TRESP" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# Login as admin
ARESP=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"testadmin@audit.com","password":"Test@1234"}')
A_TOKEN=$(echo "$ARESP" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$T_TOKEN" ] || [ -z "$A_TOKEN" ]; then
  echo "FATAL: Could not login. Teacher token: $T_TOKEN / Admin token: $A_TOKEN"
  echo "Teacher resp: $TRESP"
  echo "Admin resp: $ARESP"
  exit 1
fi
echo "=== Tokens acquired ==="
echo ""

check() {
  local label="$1"
  local resp="$2"
  local expect="$3"
  if echo "$resp" | grep -qi "$expect"; then
    echo "  ✅ $label"
    PASS=$((PASS+1))
  else
    echo "  ❌ $label"
    echo "     Expected: $expect"
    echo "     Got: $(echo "$resp" | head -c 200)"
    FAIL=$((FAIL+1))
    ERRORS="$ERRORS\n  - $label"
  fi
}

echo "═══ TEACHER TESTS ═══"
echo ""

# --- Profile ---
echo "── Profile ──"
R=$(curl -s "$BASE/users/me" -H "Authorization: Bearer $T_TOKEN")
check "GET /users/me (teacher profile)" "$R" '"role":"teacher"'

R=$(curl -s -X PATCH "$BASE/users/me" -H "Authorization: Bearer $T_TOKEN" \
  -H "Content-Type: application/json" -d '{"bio":"CSE Department Teacher"}')
check "PATCH /users/me (update bio)" "$R" '"bio":"CSE Department Teacher"'

# --- Students ---
echo "── Students ──"
R=$(curl -s "$BASE/students/branch/CSE" -H "Authorization: Bearer $T_TOKEN")
check "GET /students/branch/CSE" "$R" '"students"'

R=$(curl -s "$BASE/students" -H "Authorization: Bearer $T_TOKEN")
check "GET /students (all)" "$R" '"students"'

# --- Projects ---
echo "── Projects ──"
R=$(curl -s "$BASE/projects?branch=CSE" -H "Authorization: Bearer $T_TOKEN")
check "GET /projects?branch=CSE" "$R" '"projects"'

R=$(curl -s "$BASE/projects?status=pending" -H "Authorization: Bearer $T_TOKEN")
check "GET /projects?status=pending" "$R" '"projects"'

R=$(curl -s "$BASE/projects/search?q=test" -H "Authorization: Bearer $T_TOKEN")
check "GET /projects/search?q=test" "$R" '"projects"'

# --- Categories ---
echo "── Categories ──"
R=$(curl -s -X POST "$BASE/categories" -H "Authorization: Bearer $T_TOKEN" \
  -H "Content-Type: application/json" -d '{"name":"Audit Test Category","branch":"CSE"}')
check "POST /categories (create)" "$R" '"category"'
CAT_ID=$(echo "$R" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

R=$(curl -s "$BASE/categories?branch=CSE" -H "Authorization: Bearer $T_TOKEN")
check "GET /categories?branch=CSE" "$R" '"categories"'

if [ -n "$CAT_ID" ]; then
  R=$(curl -s -X DELETE "$BASE/categories/$CAT_ID" -H "Authorization: Bearer $T_TOKEN")
  check "DELETE /categories/$CAT_ID" "$R" '"Category deleted"'
fi

# --- Analytics ---
echo "── Analytics ──"
R=$(curl -s "$BASE/analytics/department/CSE" -H "Authorization: Bearer $T_TOKEN")
check "GET /analytics/department/CSE" "$R" '"branch"'

R=$(curl -s "$BASE/analytics/top-students" -H "Authorization: Bearer $T_TOKEN")
check "GET /analytics/top-students" "$R" '"students"'

R=$(curl -s "$BASE/analytics/status-distribution?branch=CSE" -H "Authorization: Bearer $T_TOKEN")
check "GET /analytics/status-distribution" "$R" '"distribution"'

R=$(curl -s "$BASE/analytics/monthly-trend?branch=CSE" -H "Authorization: Bearer $T_TOKEN")
check "GET /analytics/monthly-trend" "$R" '"trend"'

# --- Reports ---
echo "── Reports ──"
R=$(curl -s "$BASE/reports/department/CSE" -H "Authorization: Bearer $T_TOKEN")
check "GET /reports/department/CSE" "$R" '"report"'

# --- Notifications ---
echo "── Notifications ──"
R=$(curl -s "$BASE/notifications" -H "Authorization: Bearer $T_TOKEN")
check "GET /notifications" "$R" '"notifications"'

R=$(curl -s -X PATCH "$BASE/notifications/read-all" -H "Authorization: Bearer $T_TOKEN")
check "PATCH /notifications/read-all" "$R" '"All notifications"'

# --- Overdue ---
echo "── Overdue ──"
R=$(curl -s "$BASE/projects/overdue" -H "Authorization: Bearer $T_TOKEN")
check "GET /projects/overdue" "$R" '"overdue"'

# --- User Search (teacher-only) ---
echo "── User Search ──"
R=$(curl -s "$BASE/users/search?q=test" -H "Authorization: Bearer $T_TOKEN")
check "GET /users/search?q=test" "$R" '"users"'

R=$(curl -s "$BASE/users/teachers" -H "Authorization: Bearer $T_TOKEN")
check "GET /users/teachers" "$R" '"teachers"'

# --- Teacher access restrictions ---
echo "── Access Control ──"
R=$(curl -s -X POST "$BASE/projects" -H "Authorization: Bearer $T_TOKEN" \
  -H "Content-Type: application/json" -d '{"title":"test","description":"test desc here"}')
check "POST /projects (should be denied for teacher)" "$R" 'Access denied'

echo ""
echo "═══ ADMIN TESTS ═══"
echo ""

# --- Profile ---
echo "── Admin Profile ──"
R=$(curl -s "$BASE/users/me" -H "Authorization: Bearer $A_TOKEN")
check "GET /users/me (admin profile)" "$R" '"role":"admin"'

# --- Admin accessing teacher routes ---
echo "── Admin on Teacher Routes ──"
R=$(curl -s "$BASE/students/branch/CSE" -H "Authorization: Bearer $A_TOKEN")
check "GET /students/branch/CSE (admin)" "$R" '"students"'

R=$(curl -s "$BASE/students" -H "Authorization: Bearer $A_TOKEN")
check "GET /students (admin)" "$R" '"students"'

R=$(curl -s "$BASE/projects?branch=CSE" -H "Authorization: Bearer $A_TOKEN")
check "GET /projects?branch=CSE (admin)" "$R" '"projects"'

R=$(curl -s "$BASE/reports/department/CSE" -H "Authorization: Bearer $A_TOKEN")
check "GET /reports/department/CSE (admin)" "$R" '"report"'

# Test admin can update project status (need a project ID first)
PROJ_LIST=$(curl -s "$BASE/projects" -H "Authorization: Bearer $A_TOKEN")
PROJ_ID=$(echo "$PROJ_LIST" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

if [ -n "$PROJ_ID" ]; then
  echo "── Admin Project Status Update ──"
  R=$(curl -s -X PATCH "$BASE/projects/$PROJ_ID/status" -H "Authorization: Bearer $A_TOKEN" \
    -H "Content-Type: application/json" -d '{"status":"under_review"}')
  check "PATCH /projects/$PROJ_ID/status (admin)" "$R" '"status"'

  # Revert to pending
  curl -s -X PATCH "$BASE/projects/$PROJ_ID/status" -H "Authorization: Bearer $A_TOKEN" \
    -H "Content-Type: application/json" -d '{"status":"pending"}' > /dev/null
fi

# --- Admin Category Management ---
echo "── Admin Categories ──"
R=$(curl -s -X POST "$BASE/categories" -H "Authorization: Bearer $A_TOKEN" \
  -H "Content-Type: application/json" -d '{"name":"Admin Category","branch":"CSE"}')
check "POST /categories (admin)" "$R" '"category"'
ACAT_ID=$(echo "$R" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

if [ -n "$ACAT_ID" ]; then
  R=$(curl -s -X DELETE "$BASE/categories/$ACAT_ID" -H "Authorization: Bearer $A_TOKEN")
  check "DELETE /categories (admin)" "$R" '"Category deleted"'
fi

# --- Admin Analytics ---
echo "── Admin Analytics ──"
R=$(curl -s "$BASE/analytics/department/CSE" -H "Authorization: Bearer $A_TOKEN")
check "GET /analytics/department/CSE (admin)" "$R" '"branch"'

R=$(curl -s "$BASE/analytics/status-distribution" -H "Authorization: Bearer $A_TOKEN")
check "GET /analytics/status-distribution (admin, no branch filter)" "$R" '"distribution"'

R=$(curl -s "$BASE/analytics/monthly-trend" -H "Authorization: Bearer $A_TOKEN")
check "GET /analytics/monthly-trend (admin, no branch filter)" "$R" '"trend"'

# --- Admin student report---
echo "── Admin Student Report ──"
R=$(curl -s "$BASE/reports/student/3" -H "Authorization: Bearer $A_TOKEN")
check "GET /reports/student/3 (admin)" "$R" '"report"'

# --- Admin should NOT create project (not student) ---
echo "── Admin Access Control ──"
R=$(curl -s -X POST "$BASE/projects" -H "Authorization: Bearer $A_TOKEN" \
  -H "Content-Type: application/json" -d '{"title":"test","description":"test desc here"}')
check "POST /projects (admin should be denied)" "$R" 'Access denied'

# --- Check admin cannot access student route ---
R=$(curl -s "$BASE/users/search?q=test" -H "Authorization: Bearer $A_TOKEN")
check "GET /users/search (admin)" "$R" '"users"'

echo ""
echo "═══════════════════"
echo "  RESULTS: $PASS passed, $FAIL failed"
echo "═══════════════════"
if [ $FAIL -gt 0 ]; then
  echo ""
  echo "Failed tests:"
  echo -e "$ERRORS"
fi
