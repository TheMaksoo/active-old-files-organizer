"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
exports.contributes = contributes;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const OUTPUT_CHANNEL = "ActiveFilesLogger";
class ActiveOldFilesProvider {
    constructor(workspaceRoot, logger) {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.activeFiles = [];
        this.oldFiles = [];
        this.folderStats = {};
        this.workspaceRoot = workspaceRoot;
        this.logger = logger;
        this.activeDays = vscode.workspace
            .getConfiguration()
            .get("activeOldOrganizer.activeDays", 30);
        this.minFilesForGrouping = vscode.workspace
            .getConfiguration()
            .get("activeOldOrganizer.minFilesForGrouping", 5);
        this.refresh();
    }
    refresh() {
        if (!this.workspaceRoot)
            return;
        this.activeFiles = [];
        this.oldFiles = [];
        this.folderStats = {};
        const now = Date.now();
        const activeThreshold = now - this.activeDays * 24 * 60 * 60 * 1000;
        const allFiles = [];
        this.scanDir(this.workspaceRoot, "", allFiles, activeThreshold);
        // Group by top-level folder
        this.activeFiles = this.groupByTopLevel(allFiles.filter((f) => f.mtime > activeThreshold));
        this.oldFiles = this.groupByTopLevel(allFiles.filter((f) => f.mtime <= activeThreshold));
        this.logStats();
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        const treeItem = new vscode.TreeItem(element.label, element.collapsibleState);
        treeItem.resourceUri = element.resourceUri;
        treeItem.contextValue = element.contextValue;
        if (!element.isDirectory) {
            treeItem.command = {
                command: "vscode.open",
                title: "Open File",
                arguments: [element.resourceUri],
            };
        }
        return treeItem;
    }
    getChildren(element) {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage("No workspace folder found");
            return Promise.resolve([]);
        }
        if (!element) {
            return Promise.resolve([
                {
                    label: "Active Files",
                    resourceUri: vscode.Uri.file(this.workspaceRoot),
                    collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
                    contextValue: "activeGroup",
                    children: this.activeFiles,
                    isDirectory: true,
                    mtime: 0,
                    relativePath: "",
                },
                {
                    label: "Old Files",
                    resourceUri: vscode.Uri.file(this.workspaceRoot),
                    collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                    contextValue: "oldGroup",
                    children: this.oldFiles,
                    isDirectory: true,
                    mtime: 0,
                    relativePath: "",
                },
            ]);
        }
        return Promise.resolve(element.children || []);
    }
    scanDir(dir, relative, out, activeThreshold) {
        let entries = [];
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        }
        catch (e) {
            return;
        }
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relPath = path.join(relative, entry.name);
            if (entry.isDirectory()) {
                this.scanDir(fullPath, relPath, out, activeThreshold);
            }
            else {
                let stat;
                try {
                    stat = fs.statSync(fullPath);
                }
                catch (e) {
                    continue;
                }
                const topLevel = relPath.split(path.sep)[0];
                if (!this.folderStats[topLevel])
                    this.folderStats[topLevel] = { active: 0, old: 0 };
                if (stat.mtimeMs > activeThreshold) {
                    this.folderStats[topLevel].active++;
                }
                else {
                    this.folderStats[topLevel].old++;
                }
                out.push({
                    label: entry.name,
                    resourceUri: vscode.Uri.file(fullPath),
                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                    contextValue: "file",
                    isDirectory: false,
                    mtime: stat.mtimeMs,
                    relativePath: relPath,
                });
            }
        }
    }
    groupByTopLevel(files) {
        const groups = {};
        for (const file of files) {
            const topLevel = file.relativePath.split(path.sep)[0];
            if (!groups[topLevel])
                groups[topLevel] = [];
            groups[topLevel].push(file);
        }
        return Object.keys(groups)
            .map((folder) => ({
            label: folder,
            resourceUri: vscode.Uri.file(path.join(this.workspaceRoot, folder)),
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: "folder",
            children: groups[folder],
            isDirectory: true,
            mtime: 0,
            relativePath: folder,
        }))
            .filter((group) => group.children.length >= this.minFilesForGrouping);
    }
    logStats() {
        const totalActive = this.activeFiles.reduce((acc, f) => acc + (f.children ? f.children.length : 0), 0);
        const totalOld = this.oldFiles.reduce((acc, f) => acc + (f.children ? f.children.length : 0), 0);
        this.logger.clear();
        this.logger.appendLine(`[Active/Old Files Organizer]`);
        this.logger.appendLine(`Active files: ${totalActive}`);
        this.logger.appendLine(`Old files: ${totalOld}`);
        this.logger.appendLine("Breakdown by top-level folder:");
        for (const folder in this.folderStats) {
            const { active, old } = this.folderStats[folder];
            this.logger.appendLine(`- ${folder}: ${active} active, ${old} old`);
        }
    }
}
function activate(context) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showWarningMessage("Active/Old Files Organizer: No workspace folder open.");
        return;
    }
    const logger = vscode.window.createOutputChannel(OUTPUT_CHANNEL);
    const provider = new ActiveOldFilesProvider(workspaceFolders[0].uri.fsPath, logger);
    vscode.window.registerTreeDataProvider("activeOldFilesView", provider);
    // Refresh on file save/create/delete
    const watcher = vscode.workspace.createFileSystemWatcher("**/*");
    watcher.onDidChange(() => provider.refresh());
    watcher.onDidCreate(() => provider.refresh());
    watcher.onDidDelete(() => provider.refresh());
    context.subscriptions.push(watcher, logger);
}
function deactivate() { }
/**
 * @contributes
 */
function contributes() {
    return {
        configuration: {
            title: "Active/Old Files Organizer",
            properties: {
                "activeOldOrganizer.activeDays": {
                    type: "number",
                    default: 30,
                    description: "Number of days to consider a file 'active'",
                },
                "activeOldOrganizer.minFilesForGrouping": {
                    type: "number",
                    default: 5,
                    description: "Minimum files in a folder before creating Active/Old groups",
                },
            },
        },
    };
}
