set -e

bash auth.sh
node bump.js
npm publish --access=public
