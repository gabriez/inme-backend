#!/bin/bash

# Script to add .js extensions to all local imports in TypeScript files
# Required for ES modules with nodenext module resolution

echo "Adding .js extensions to imports..."

# Find all .ts files in src directory (excluding node_modules and dist)
find src -name "*.ts" -type f | while read -r file; do
  # Add .js to imports that start with @ or . (local imports)
  # Skip imports that already have .js extension
  # Skip imports from node_modules (no @ or . prefix)
  sed -i -E 's|from ["'\'']([@\.][^"'\'']+)["'\'']|from "\1.js"|g' "$file"
  
  # Remove duplicate .js.js if it was added twice
  sed -i 's/\.js\.js/.js/g' "$file"
  
  echo "Processed: $file"
done

echo "Done! All imports updated."
