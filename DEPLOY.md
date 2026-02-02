# Deploy HeWeGo to Azure Static Web Apps (testing)

## 1. Push to GitHub

If you don't have a remote yet:

```bash
cd hewego-next
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

(Replace `YOUR_USERNAME` and `YOUR_REPO` with your GitHub org/repo. Create the repo on GitHub first if needed.)

## 2. Create the Static Web App in Azure

**Option A – Azure Portal**

1. Go to [Azure Portal](https://portal.azure.com) → **Create a resource** → search **Static Web App** → **Create**.
2. **Subscription** and **Resource group**: choose or create one (e.g. `hewego-test`).
3. **Name**: e.g. `hewego-app`.
4. **Plan type**: **Free** (good for testing).
5. **Deployment details**:
   - **Source**: GitHub.
   - Sign in to GitHub if asked and **Authorize**.
   - **Organization**, **Repository**, **Branch**: select your repo and `main`.
   - **Build Presets**: **Custom**.
   - **App location**: `/`
   - **Output location**: `dist`
   - **Build command** (optional if using GitHub Actions): leave default or `npm run build`.
6. Click **Review + create** → **Create**.

**Option B – Azure CLI**

```bash
# Login and set subscription if needed
az login
az account set --subscription "YOUR_SUBSCRIPTION_ID"

# Create resource group (if needed)
az group create --name hewego-test --location eastus2

# Create Static Web App linked to GitHub (replace placeholders)
az staticwebapp create \
  --name hewego-app \
  --resource-group hewego-test \
  --source https://github.com/YOUR_USERNAME/YOUR_REPO \
  --branch main \
  --app-location "/" \
  --output-location "dist" \
  --location eastus2
```

## 3. Add the deployment token to GitHub

After the Static Web App is created:

1. In Azure Portal: open your **Static Web App** → **Overview** → copy **Deployment token** (or use **Manage deployment token**).
2. In **GitHub**: repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
3. **Name**: `AZURE_STATIC_WEB_APPS_API_TOKEN`
4. **Value**: paste the deployment token → **Add secret**.

The workflow (`.github/workflows/azure-static-web-apps.yml`) uses this secret. On the next push to `main`, or when you run the workflow manually (**Actions** → **Azure Static Web Apps** → **Run workflow**), it will build and deploy.

## 4. Your app URL

After the first successful run, the app will be at:

`https://<your-static-web-app-name>.azurestaticapps.net`

(e.g. `https://hewego-app.azurestaticapps.net`)

---

**Note:** The frontend calls `https://hewego.azurewebsites.net` for the API. If you need a different API URL in production, configure it via environment variables and your build (e.g. Vite `import.meta.env`).
