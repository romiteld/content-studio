#!/bin/bash

# Fix brandConfig imports
find src/ -name "*.js" -exec sed -i 's|../server-config/brandLock|../config/brandLock|g' {} \;

# Fix database imports
find src/ -name "*.js" -exec sed -i 's|../database/supabase-client|../database/supabase-client|g' {} \;
find src/ -name "*.js" -exec sed -i 's|../database/supabase|../database/supabase|g' {} \;

# Fix server-api imports
find src/ -name "*.js" -exec sed -i 's|../server-api/|../api/|g' {} \;

# Fix middleware imports
find src/ -name "*.js" -exec sed -i 's|../middleware/|../middleware/|g' {} \;

# Fix server-vercel import
find src/ -name "*.js" -exec sed -i 's|../server-vercel|../../server-vercel|g' {} \;

echo "Import paths fixed!"
