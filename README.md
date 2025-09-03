# Active/Old Files Organizer VS Code Extension

This extension automatically organizes your workspace files into **Active** and **Old** groups in a custom TreeView, with logging to an Output channel.

## Features

- **Active Files**: Modified within the last 30 days (shown expanded)
- **Old Files**: Not modified in the last 30 days (shown collapsed)
- Custom TreeView in Explorer sidebar
- Logging of totals and per-folder breakdown to `ActiveFilesLogger` Output channel
- Handles large projects efficiently
- Runs automatically on VS Code startup

## How to Build and Install Locally

1. **Install dependencies**
   ```sh
   npm install
   ```
2. **Build the extension**
   ```sh
   npm run compile
   ```
3. **Package the extension**
   ```sh
   npx vsce package
   ```
   This will create a `.vsix` file in your folder.
4. **Install the extension in VS Code**
   - Open VS Code
   - Press `Ctrl+Shift+P` and select `Extensions: Install from VSIX...`
   - Select your generated `.vsix` file

## Notes

- This extension is for local use only. Do **not** commit it to git.
- No manual command is needed; it runs automatically on startup.
- Logs are available in the Output panel under `ActiveFilesLogger`.

---

**Enjoy organized files!**
