# Deployment Instructions

## Bug Fixes Applied

The following bugs were fixed in this branch:

1. **Import Error in App.js**: Changed `@mui/material` to `@material-ui/core` to match the installed dependencies
2. **Linting Errors**: Removed unused imports in Main.jsx
3. **Anonymous Export**: Changed formatDate.js to use a named function export
4. **React Hooks Warning**: Wrapped `createTransaction` in `useCallback` to fix the exhaustive-deps warning

## Build Verification

The code has been successfully built with the following command:
```bash
NODE_OPTIONS=--openssl-legacy-provider npm run build
```

The build folder is ready for deployment and located at `./build/`

## Netlify Deployment Options

### Option 1: Automatic Deployment via GitHub Integration (Recommended)

If your Netlify site is connected to this GitHub repository:

1. Push this branch to GitHub (already done)
2. Go to your Netlify dashboard at https://app.netlify.com
3. Select your site (monefy.netlify.app)
4. Navigate to "Deploys" tab
5. The branch should automatically deploy, or you can manually trigger a deploy

### Option 2: Manual Deployment via Netlify CLI

If you have Netlify authentication set up locally:

```bash
# Login to Netlify
netlify login

# Deploy to production
netlify deploy --prod --dir=build
```

### Option 3: Drag and Drop Deployment

1. Go to https://app.netlify.com/drop
2. Drag and drop the `build` folder
3. Get your deployment URL

## Netlify Configuration

The repository includes a `netlify.toml` file with the following configuration:

```toml
[build]
  command = "npm run build"
  publish = "build"

[build.environment]
  NODE_VERSION = "18"
  NODE_OPTIONS = "--openssl-legacy-provider"
```

This ensures that:
- Node.js version 18 is used
- The OpenSSL legacy provider is enabled to fix build issues with older webpack versions
- The build output directory is correctly set to `build`

## Expected Deployment URL

Based on the README.md, the site should be deployed at:
**https://monefy.netlify.app/**

## Verification

After deployment, verify that:
1. The site loads without errors
2. The Material-UI components render correctly
3. Voice recognition features work as expected
4. All transactions can be added/removed successfully
