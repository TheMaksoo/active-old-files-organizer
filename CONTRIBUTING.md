# Contributing to Active/Old Files Organizer

Thank you for your interest in contributing to the Active/Old Files Organizer extension!

## Extension Overview

This VS Code extension automatically organizes files in your workspace into "Active" and "Old" groups based on when they were last modified. The extension integrates seamlessly with VS Code's existing Explorer view.

### Key Features

- **Smart Classification**: Files modified within 30 days = Active, older files = Old
- **Integrated Structure**: Works within existing folder structure (not a separate view)
- **Configurable**: Adjust the active days threshold and minimum files for grouping
- **Detailed Logging**: Complete file organization statistics in output channel

## Development Setup

### Prerequisites

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)
- **VS Code** (for testing the extension)
- **Git** (for version control)

### Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/TheMaksoo/active-old-files-organizer.git
   cd active-old-files-organizer
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Open in VS Code**

   ```bash
   code .
   ```

4. **Run the extension in development mode**
   - Press `F5` or go to Run > Start Debugging
   - This opens a new Extension Development Host window
   - Open a workspace with files to test the organization

## Project Structure

```
active-old-files-organizer/
 src/
    extension.ts         # Main extension logic
 package.json            # Extension manifest and configuration
 README.md              # User documentation
 CHANGELOG.md           # Version history
 tsconfig.json          # TypeScript configuration
 .vscode/
     launch.json        # Debug configuration
```

## Architecture

### Core Components

1. **ActiveOldTreeDataProvider** (`src/extension.ts`)

   - Implements VS Code's TreeDataProvider<FileItem> interface
   - Scans workspace folders and organizes files by modification date
   - Creates Active/Old subfolders only when folders have 5+ files (configurable)

2. **FileItem Class**

   - Represents each item in the tree (folders, files, Active/Old groups)
   - Handles collapsible state (Active = expanded, Old = collapsed)
   - Manages file system paths and VS Code commands

3. **Configuration**
   - `activeDays`: Threshold for Active vs Old classification (default: 30 days)
   - `minFilesForGrouping`: Minimum files in folder before creating Active/Old groups (default: 5)

### Key Functionality

```typescript
// Example of how files are classified
const daysSinceModified =
  (Date.now() - fileStat.mtime.getTime()) / (1000 * 60 * 60 * 24);
const isActive = daysSinceModified < activeDays;
```

## Making Changes

### Code Style

- Use **TypeScript** with strict typing
- Follow existing naming conventions (camelCase for variables, PascalCase for classes)
- Add comments for complex logic
- Use VS Code API best practices

### Testing Your Changes

1. Make your code changes
2. Press `F5` to launch Extension Development Host
3. Open a workspace with various files (different ages)
4. Check the Explorer view for proper organization
5. Test configuration changes in VS Code settings
6. Check the "ActiveFilesLogger" output channel for logging

### Configuration Testing

Test these VS Code settings:

```json
{
  "activeOldFilesOrganizer.activeDays": 30,
  "activeOldFilesOrganizer.minFilesForGrouping": 5
}
```

## Submitting Changes

### Pull Request Process

1. **Fork** the repository on GitHub
2. **Create a feature branch** from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following the coding standards
4. **Test thoroughly** in the Extension Development Host
5. **Update documentation** if needed (README.md, CHANGELOG.md)
6. **Commit with clear messages**
   ```bash
   git commit -m "Add feature: description of what you added"
   ```
7. **Push to your fork** and submit a pull request

### Commit Message Guidelines

- Use clear, descriptive commit messages
- Start with a verb (Add, Fix, Update, Remove)
- Include context about what and why
- Examples:
  - `Add configuration for custom active days threshold`
  - `Fix file organization for nested directories`
  - `Update documentation with new installation instructions`

## Debugging

### Common Issues

1. **Files not organizing**: Check the output channel "ActiveFilesLogger" for errors
2. **Configuration not applying**: Restart the Extension Development Host after config changes
3. **Performance issues**: Check if you're testing with very large projects (1000+ files)

### Debugging Tools

- **VS Code Debugger**: Set breakpoints in `src/extension.ts`
- **Output Channel**: View detailed logging in "ActiveFilesLogger"
- **Developer Tools**: Use `Help > Toggle Developer Tools` in Extension Development Host

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality additions
- **PATCH** version for backwards-compatible bug fixes

### Publishing to Marketplace

The extension is published as `TheMaksoo.active-old-files-organizer` on the VS Code Marketplace.

## Questions and Support

- **Issues**: Report bugs or request features on [GitHub Issues](https://github.com/TheMaksoo/active-old-files-organizer/issues)
- **Discussions**: General questions and ideas in [GitHub Discussions](https://github.com/TheMaksoo/active-old-files-organizer/discussions)

## Credits

**Created by**: [TheMaksoo](https://github.com/TheMaksoo)

Thank you for contributing to make file organization in VS Code better for everyone!
