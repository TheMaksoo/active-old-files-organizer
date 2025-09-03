# Active/Old Files Organizer

**Automatically organize your workspace files into Active and Old groups within your familiar folder structure.**

Perfect for large projects like Laravel, Vue, React, and any codebase with hundreds of files. Stop wasting time scrolling through long lists of unused files!

## ✨ Features

- 🚀 **Automatic Organization**: Files are automatically grouped by modification date
- 📁 **Integrated Structure**: Works within your existing folder structure - no separate views
- ⚡ **Smart Grouping**: Only creates Active/Old groups when folders have enough files
- 🎯 **Focus on Recent**: Active files (< 30 days) are expanded, old files are collapsed
- 📊 **Detailed Logging**: See statistics in the Output panel
- ⚙️ **Configurable**: Customize the active days threshold and minimum files for grouping
- 🔄 **Real-time Updates**: Automatically refreshes when files change

## 🎯 Perfect For

- **Laravel Projects**: Organize migrations, controllers, models by activity
- **Vue/React Apps**: Sort components, pages, and utilities
- **Large Codebases**: Any project with 100+ files
- **Legacy Projects**: Quickly identify unused vs active code

## 📸 How It Works

Instead of seeing this overwhelming list:

```
📁 database/migrations/
  📄 2020_01_01_create_users_table.php
  📄 2020_02_15_create_posts_table.php
  📄 2021_03_10_add_column_to_users.php
  📄 2024_08_15_create_orders_table.php  ← Recently modified
  📄 2024_09_01_add_status_to_orders.php ← Recently modified
```

You see this organized structure:

```
📁 database/migrations/
  📁 Active (2 files) ← Expanded by default
    📄 2024_08_15_create_orders_table.php
    📄 2024_09_01_add_status_to_orders.php
  📁 Old (3 files) ← Collapsed by default
    📄 2020_01_01_create_users_table.php
    📄 2020_02_15_create_posts_table.php
    📄 2021_03_10_add_column_to_users.php
```

## 🚀 Getting Started

1. **Install** the extension from the VS Code Marketplace
2. **Open** any workspace with files
3. **Look** for "Files (Active/Old Organized)" in the Explorer sidebar
4. **Enjoy** your organized file structure!

## ⚙️ Configuration

Customize the extension in VS Code Settings:

- **Active Days**: How many days to consider a file "active" (default: 30)
- **Min Files for Grouping**: Minimum files in a folder before creating groups (default: 5)

```json
{
  "activeOldOrganizer.activeDays": 30,
  "activeOldOrganizer.minFilesForGrouping": 5
}
```

## 📊 Logging

Check the **Output** panel → **ActiveFilesLogger** for detailed statistics:

- Total active vs old files
- Breakdown by folder
- Performance metrics

## 🔧 Development

Want to contribute or modify?

```bash
git clone https://github.com/TheMaksoo/active-old-files-organizer.git
cd active-old-files-organizer
npm install
npm run compile
npx vsce package
```

## 📝 License

MIT License - feel free to use in your projects!

## 🙋‍♂️ Support

Found a bug or have a feature request? [Open an issue](https://github.com/TheMaksoo/active-old-files-organizer/issues) on GitHub!

---

**⭐ If this extension helps you stay organized, please leave a review!**
