import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

const ACTIVE_DAYS = 30;
const OUTPUT_CHANNEL = 'ActiveFilesLogger';

interface FileItem {
    label: string;
    resourceUri: vscode.Uri;
    collapsibleState: vscode.TreeItemCollapsibleState;
    contextValue: string;
    children?: FileItem[];
    isDirectory: boolean;
    mtime: number;
    fullPath: string;
    isActiveOldGroup?: boolean;
}

class ActiveOldFilesProvider implements vscode.TreeDataProvider<FileItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<FileItem | undefined | void> = new vscode.EventEmitter<FileItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<FileItem | undefined | void> = this._onDidChangeTreeData.event;
    private workspaceRoot: string | undefined;
    private logger: vscode.OutputChannel;
    private folderStats: Record<string, { active: number; old: number } > = {};

    constructor(workspaceRoot: string | undefined, logger: vscode.OutputChannel) {
        this.workspaceRoot = workspaceRoot;
        this.logger = logger;
        this.refresh();
    }

    refresh(): void {
        this.folderStats = {};
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: FileItem): vscode.TreeItem {
        const treeItem = new vscode.TreeItem(element.label, element.collapsibleState);
        treeItem.resourceUri = element.resourceUri;
        treeItem.contextValue = element.contextValue;
        
        if (!element.isDirectory && !element.isActiveOldGroup) {
            treeItem.command = {
                command: 'vscode.open',
                title: 'Open File',
                arguments: [element.resourceUri]
            };
        }
        
        // Add icons for Active/Old groups
        if (element.isActiveOldGroup) {
            if (element.label.startsWith('Active')) {
                treeItem.iconPath = new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('charts.green'));
            } else if (element.label.startsWith('Old')) {
                treeItem.iconPath = new vscode.ThemeIcon('circle-outline', new vscode.ThemeColor('charts.gray'));
            }
        }
        
        return treeItem;
    }

    getChildren(element?: FileItem): Thenable<FileItem[]> {
        if (!this.workspaceRoot) {
            return Promise.resolve([]);
        }

        if (!element) {
            // Root level - show the workspace folder structure
            return Promise.resolve(this.getDirectoryContents(this.workspaceRoot, ''));
        }

        if (element.isActiveOldGroup) {
            // Show files in the Active/Old group
            return Promise.resolve(element.children || []);
        }

        if (element.isDirectory) {
            // Show directory contents with Active/Old organization
            return Promise.resolve(this.getDirectoryContents(element.fullPath, element.fullPath));
        }

        return Promise.resolve([]);
    }

    private getDirectoryContents(dirPath: string, relativePath: string): FileItem[] {
        try {
            const entries = fs.readdirSync(dirPath, { withFileTypes: true });
            const directories: FileItem[] = [];
            const files: FileItem[] = [];
            const now = Date.now();
            const activeThreshold = now - ACTIVE_DAYS * 24 * 60 * 60 * 1000;

            // Separate directories and files
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                const relPath = relativePath ? path.join(relativePath, entry.name) : entry.name;

                if (entry.isDirectory()) {
                    directories.push({
                        label: entry.name,
                        resourceUri: vscode.Uri.file(fullPath),
                        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                        contextValue: 'folder',
                        isDirectory: true,
                        mtime: 0,
                        fullPath: fullPath,
                    });
                } else {
                    try {
                        const stat = fs.statSync(fullPath);
                        files.push({
                            label: entry.name,
                            resourceUri: vscode.Uri.file(fullPath),
                            collapsibleState: vscode.TreeItemCollapsibleState.None,
                            contextValue: 'file',
                            isDirectory: false,
                            mtime: stat.mtimeMs,
                            fullPath: fullPath,
                        });
                    } catch (e) {
                        // Skip files we can't read
                    }
                }
            }

            const result: FileItem[] = [...directories];

            // If there are files, organize them into Active/Old groups
            if (files.length > 0) {
                const activeFiles = files.filter(f => f.mtime > activeThreshold);
                const oldFiles = files.filter(f => f.mtime <= activeThreshold);

                // Update stats for logging
                const folderKey = relativePath || 'root';
                if (!this.folderStats[folderKey]) {
                    this.folderStats[folderKey] = { active: 0, old: 0 };
                }
                this.folderStats[folderKey].active += activeFiles.length;
                this.folderStats[folderKey].old += oldFiles.length;

                if (activeFiles.length > 0) {
                    result.push({
                        label: `Active (${activeFiles.length} files)`,
                        resourceUri: vscode.Uri.file(dirPath),
                        collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
                        contextValue: 'activeGroup',
                        isDirectory: true,
                        mtime: 0,
                        fullPath: dirPath,
                        isActiveOldGroup: true,
                        children: activeFiles,
                    });
                }

                if (oldFiles.length > 0) {
                    result.push({
                        label: `Old (${oldFiles.length} files)`,
                        resourceUri: vscode.Uri.file(dirPath),
                        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                        contextValue: 'oldGroup',
                        isDirectory: true,
                        mtime: 0,
                        fullPath: dirPath,
                        isActiveOldGroup: true,
                        children: oldFiles,
                    });
                }
            }

            return result;
        } catch (e) {
            return [];
        }
    }

    private logStats() {
        const totalActive = Object.values(this.folderStats).reduce((acc, stats) => acc + stats.active, 0);
        const totalOld = Object.values(this.folderStats).reduce((acc, stats) => acc + stats.old, 0);
        
        this.logger.clear();
        this.logger.appendLine(`[Active/Old Files Organizer - Integrated View]`);
        this.logger.appendLine(`Total Active files: ${totalActive}`);
        this.logger.appendLine(`Total Old files: ${totalOld}`);
        this.logger.appendLine('Breakdown by folder:');
        
        for (const folder in this.folderStats) {
            const { active, old } = this.folderStats[folder];
            if (active > 0 || old > 0) {
                this.logger.appendLine(`- ${folder}: ${active} active, ${old} old`);
            }
        }
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Active/Old Files Organizer (Integrated) extension is activating...');
    
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showWarningMessage('Active/Old Files Organizer: No workspace folder open.');
        return;
    }
    
    console.log('Workspace folder found:', workspaceFolders[0].uri.fsPath);
    
    const logger = vscode.window.createOutputChannel(OUTPUT_CHANNEL);
    logger.appendLine('Extension activated successfully! Files are now organized with Active/Old subfolders.');
    logger.show();
    
    const provider = new ActiveOldFilesProvider(workspaceFolders[0].uri.fsPath, logger);
    vscode.window.registerTreeDataProvider('activeOldFilesView', provider);
    
    // Show a notification that the extension is working
    vscode.window.showInformationMessage('Active/Old Files Organizer (Integrated) activated! Check the "Files (Active/Old Organized)" view.');
    
    // Refresh on file save/create/delete
    const watcher = vscode.workspace.createFileSystemWatcher('**/*');
    watcher.onDidChange(() => provider.refresh());
    watcher.onDidCreate(() => provider.refresh());
    watcher.onDidDelete(() => provider.refresh());
    context.subscriptions.push(watcher, logger);
    
    // Log stats after initial load
    setTimeout(() => {
        (provider as any).logStats();
    }, 2000);
}

export function deactivate() {}
