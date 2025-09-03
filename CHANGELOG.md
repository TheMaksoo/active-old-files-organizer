# Change Log

All notable changes to the "Active/Old Files Organizer" extension will be documented in this file.

## [1.1.0] - 2025-09-03

### Added
- Integrated file organization within existing folder structure
- Configuration options for active days threshold and minimum files for grouping
- Smart grouping (only creates Active/Old groups when needed)
- Enhanced logging with detailed folder breakdown
- Better activation event (`onStartupFinished` instead of `*`)
- Visual icons for Active/Old groups (green circle for active, gray for old)

### Changed
- Complete rewrite of file organization logic
- TreeView now shows familiar folder structure with Active/Old subfolders
- Active files expanded by default, old files collapsed
- Improved performance for large projects

### Fixed
- Better error handling for file system operations
- More reliable file modification time detection

## [1.0.0] - 2025-09-03

### Added
- Initial release
- Basic Active/Old file organization in separate tree view
- Output channel logging
- File system watching for real-time updates
- TypeScript implementation with proper VS Code API usage

---

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.
