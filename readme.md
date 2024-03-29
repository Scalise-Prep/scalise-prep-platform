# Scalise Prep
Core web application for scaliseprep.com.

## Set up remote
In your local version of the repo, add the deployment remote. From within the repo folder, paste the following:

```git remote add deploy ssh://admin@104.197.179.244/home/admin/scalise-prep-platform.git```

## Deploying
You can deploy Scalise Prep using git push. To do so follow the steps below.

1. Make note of what git branch you're on (you can find out by running 	`git branch`). You should make all changes on the development branch of the code, so if you're on master, use `git checkout development` to checkout development.

2. Make changes to the codebase on your local computer.

3. When you're satisfied, run `git add .` to add any new files you've created, then `git commit -am "a short message describing what your commit does"` to commit your code.

4. After this has completed, run `git push deploy development` to deploy your code to the development server. You'll be prompted for a password. It's the first name of the Scalise Prep CEO :)

5. Once this step is complete, you should be able to view your changes on dev.scaliseprep.com

## Deploying to Production

1. After you've tested your changes on the development app instance, you're ready to deploy to production. To do so, check out the master branch using `git checkout master`.

2. Then merge your changes from development into master using `git merge development`.

3. Lastly, deploy your changes the same way as to development, using `git push deploy master`.

4. Once this step is complete, your changes should be live on www.scaliseprep.com. 
