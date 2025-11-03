#!/bin/bash

# Script to remove .js extensions from all local imports in TypeScript files
# Reverting back to CommonJS

echo "Removing .js extensions from imports..."

# Find all .ts files in src directory (excluding node_modules and dist)
find src -name "*.ts" -type f | while read -r file; do
  # Remove .js from imports that have it
  sed -i -E 's|from ["'\'']([@\.][^"'\'']+)\.js["'\'']|from "\1"|g' "$file"
  
  echo "Processed: $file"
done

echo "Done! All .js extensions removed."
