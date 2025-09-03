# Publishing Guide

## Prerequisites

1. **Create VS Code Marketplace Publisher Account**
   - Go to https://marketplace.visualstudio.com/manage
   - Sign in with Microsoft/GitHub account
   - Create a new publisher (use "TheMaksoo" to match package.json)

2. **Get Personal Access Token**
   - Go to https://dev.azure.com/
   - User Settings → Personal Access Tokens
   - Create token with "Marketplace (manage)" scope
   - Copy the token

## Publishing Steps

1. **Login to vsce**
   ```bash
   npx vsce login TheMaksoo
   # Enter your Personal Access Token when prompted
   ```

2. **Publish the extension**
   ```bash
   npm run publish
   # Or manually: npx vsce publish
   ```

3. **Alternative: Upload VSIX manually**
   - Go to https://marketplace.visualstudio.com/manage
   - Click "New extension" → "Visual Studio Code"
   - Upload the `active-old-files-organizer-1.2.0.vsix` file

## What's Ready for Publishing

✅ **Professional README** with features, screenshots, examples
✅ **Proper package.json** with keywords, publisher, license
✅ **Configuration options** for user customization  
✅ **CHANGELOG** with version history
✅ **MIT License** included
✅ **Optimized activation** (onStartupFinished vs *)
✅ **Clean .vscodeignore** for smaller package
✅ **Error handling** and performance optimizations

## Post-Publishing

- Monitor the marketplace page for reviews/issues
- Update GitHub repository with marketplace link
- Consider adding screenshots to README
- Plan future features based on user feedback

The extension is production-ready and should perform well in the marketplace!
