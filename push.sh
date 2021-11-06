echo "getting origin"

node getorigin.js

echo "exporting"

. exports.sh

echo "removing exports script"

rm exports.sh

echo "setting git user $GIT_USER $GIT_EMAIL"

git config --global user.name $GIT_USER
git config --global user.email $GIT_EMAIL

echo "adding files to commit"

git add .

echo "making commit"

git commit -m "$*"

echo "adding or setting origin with credentials"

git remote add origin $GIT_PUSH_URL
git remote set-url origin $GIT_PUSH_URL

echo "pushing to remote"

git push --set-upstream --force origin main

echo "setting origin url plain"

git remote set-url origin $GIT_URL

echo "done"