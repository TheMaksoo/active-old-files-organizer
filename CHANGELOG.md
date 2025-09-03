# Change Log

All notable changes to the "Active/Old Files Organizer" extension will be documented in this file.

## [1.2.2] - 2025-09-03 🚀 **PUBLISHED TO MARKETPLACE**

### Added

- 📦 **Published to VS Code Marketplace** as `TheMaksoo.active-old-files-organizer`
- 🎯 Marketplace badges and installation instructions in README
- 📊 Enhanced documentation with usage stats and contribution guidelines
- 🔧 Added proper GitHub issue templates and contributing guidelines

### Changed

- 🏠 Updated README with professional marketplace presentation
- 📝 Enhanced documentation for open source contributors

### Removed

- 🔒 Removed PUBLISHING.md from repository (contains sensitive info)

## [1.2.1] - 2025-09-03

### Fixed

- 🔧 Corrected integrated file organization logic
- ✅ Active/Old subfolders now properly show within normal Explorer structure
- 🎨 Improved labeling and visual indicators for Active/Old groups
- 🐛 Fixed TreeView integration to work with existing folder structure

## [1.2.0] - 2025-09-03

### Added

- 🎨 Professional README with marketplace-ready content
- 📝 MIT License and proper package.json fields for publishing
- 🔧 Enhanced package.json with keywords, publisher, and metadata
- 📚 Comprehensive documentation improvements
- 🏷️ Added marketplace badges and installation methods

### Changed

- 🔄 Improved activation events for better performance
- 📦 Optimized package structure for marketplace distribution

## [1.1.0] - 2025-09-03

### Added

- 🔄 **Major Rewrite**: Integrated file organization within existing folder structure
- ⚙️ Configuration options for active days threshold (default: 30 days)
- ⚙️ Configuration for minimum files before grouping (default: 5 files)
- 🎯 Smart grouping (only creates Active/Old groups when folders have enough files)
- 📊 Enhanced logging with detailed folder breakdown
- 🔄 Better activation event (`onStartupFinished` instead of `*`)
- 🎨 Visual icons for Active/Old groups (green circle for active, gray for old)

### Changed

- 🏗️ Complete rewrite of file organization logic
- 🌲 TreeView now shows familiar folder structure with Active/Old subfolders
- 📂 Active files expanded by default, old files collapsed
- ⚡ Improved performance for large projects (Laravel, Vue, React, etc.)

### Fixed

- 🛡️ Better error handling for file system operations
- 📅 More reliable file modification time detection
- 🔍 Better file scanning for nested directories

## [1.0.0] - 2025-09-03

### Added

- 🎉 **Initial release** - Active/Old Files Organizer extension
- 📁 Basic Active/Old file organization in separate tree view
- 📊 Output channel logging (`ActiveFilesLogger`)
- 👀 File system watching for real-time updates
- 💻 TypeScript implementation with proper VS Code API usage
- 🔄 Automatic refresh on file changes (create/modify/delete)
- 📈 File statistics and folder breakdown logging

### Features

- 📅 30-day threshold for Active vs Old classification
- 🌲 Custom TreeView in Explorer sidebar
- 🔍 Workspace file scanning and organization
- 📝 Detailed logging with per-folder statistics

---

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.
