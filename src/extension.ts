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
    relativePath: string;
}

class ActiveOldFilesProvider implements vscode.TreeDataProvider<FileItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<FileItem | undefined | void> = new vscode.EventEmitter<FileItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<FileItem | undefined | void> = this._onDidChangeTreeData.event;
    private workspaceRoot: string | undefined;
    private activeFiles: FileItem[] = [];
    private oldFiles: FileItem[] = [];
    private logger: vscode.OutputChannel;
    private folderStats: Record<string, { active: number; old: number } > = {};

    constructor(workspaceRoot: string | undefined, logger: vscode.OutputChannel) {
        this.workspaceRoot = workspaceRoot;
        this.logger = logger;
        this.refresh();
    }

    refresh(): void {
        if (!this.workspaceRoot) return;
        this.activeFiles = [];
        this.oldFiles = [];
        this.folderStats = {};
        const now = Date.now();
        const activeThreshold = now - ACTIVE_DAYS * 24 * 60 * 60 * 1000;
        const allFiles: FileItem[] = [];
        this.scanDir(this.workspaceRoot, '', allFiles, activeThreshold);
        // Group by top-level folder
        this.activeFiles = this.groupByTopLevel(allFiles.filter(f => f.mtime > activeThreshold));
        this.oldFiles = this.groupByTopLevel(allFiles.filter(f => f.mtime <= activeThreshold));
        this.logStats();
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: FileItem): vscode.TreeItem {
        const treeItem = new vscode.TreeItem(element.label, element.collapsibleState);
        treeItem.resourceUri = element.resourceUri;
        treeItem.contextValue = element.contextValue;
        if (!element.isDirectory) {
            treeItem.command = {
                command: 'vscode.open',
                title: 'Open File',
                arguments: [element.resourceUri]
            };
        }
        return treeItem;
    }

    getChildren(element?: FileItem): Thenable<FileItem[]> {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No workspace folder found');
            return Promise.resolve([]);
        }
        if (!element) {
            return Promise.resolve([
                {
                    label: 'Active Files',
                    resourceUri: vscode.Uri.file(this.workspaceRoot),
                    collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
                    contextValue: 'activeGroup',
                    children: this.activeFiles,
                    isDirectory: true,
                    mtime: 0,
                    relativePath: '',
                },
                {
                    label: 'Old Files',
                    resourceUri: vscode.Uri.file(this.workspaceRoot),
                    collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                    contextValue: 'oldGroup',
                    children: this.oldFiles,
                    isDirectory: true,
                    mtime: 0,
                    relativePath: '',
                }
            ]);
        }
        return Promise.resolve(element.children || []);
    }

    private scanDir(dir: string, relative: string, out: FileItem[], activeThreshold: number) {
        let entries: fs.Dirent[] = [];
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch (e) {
            return;
        }
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relPath = path.join(relative, entry.name);
            if (entry.isDirectory()) {
                this.scanDir(fullPath, relPath, out, activeThreshold);
            } else {
                let stat: fs.Stats;
                try {
                    stat = fs.statSync(fullPath);
                } catch (e) {
                    continue;
                }
                const topLevel = relPath.split(path.sep)[0];
                if (!this.folderStats[topLevel]) this.folderStats[topLevel] = { active: 0, old: 0 };
                if (stat.mtimeMs > activeThreshold) {
                    this.folderStats[topLevel].active++;
                } else {
                    this.folderStats[topLevel].old++;
                }
                out.push({
                    label: entry.name,
                    resourceUri: vscode.Uri.file(fullPath),
                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                    contextValue: 'file',
                    isDirectory: false,
                    mtime: stat.mtimeMs,
                    relativePath: relPath,
                });
            }
        }
    }

    private groupByTopLevel(files: FileItem[]): FileItem[] {
        const groups: Record<string, FileItem[]> = {};
        for (const file of files) {
            const topLevel = file.relativePath.split(path.sep)[0];
            if (!groups[topLevel]) groups[topLevel] = [];
            groups[topLevel].push(file);
        }
        return Object.keys(groups).map(folder => ({
            label: folder,
            resourceUri: vscode.Uri.file(path.join(this.workspaceRoot!, folder)),
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: 'folder',
            children: groups[folder],
            isDirectory: true,
            mtime: 0,
            relativePath: folder,
        }));
    }

    private logStats() {
        const totalActive = this.activeFiles.reduce((acc, f) => acc + (f.children ? f.children.length : 0), 0);
        const totalOld = this.oldFiles.reduce((acc, f) => acc + (f.children ? f.children.length : 0), 0);
        this.logger.clear();
        this.logger.appendLine(`[Active/Old Files Organizer]`);
        this.logger.appendLine(`Active files: ${totalActive}`);
        this.logger.appendLine(`Old files: ${totalOld}`);
        this.logger.appendLine('Breakdown by top-level folder:');
        for (const folder in this.folderStats) {
            const { active, old } = this.folderStats[folder];
            this.logger.appendLine(`- ${folder}: ${active} active, ${old} old`);
        }
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Active/Old Files Organizer extension is activating...');
    
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showWarningMessage('Active/Old Files Organizer: No workspace folder open.');
        return;
    }
    
    console.log('Workspace folder found:', workspaceFolders[0].uri.fsPath);
    
    const logger = vscode.window.createOutputChannel(OUTPUT_CHANNEL);
    logger.appendLine('Extension activated successfully!');
    logger.show();
    
    const provider = new ActiveOldFilesProvider(workspaceFolders[0].uri.fsPath, logger);
    vscode.window.registerTreeDataProvider('activeOldFilesView', provider);
    
    // Show a notification that the extension is working
    vscode.window.showInformationMessage('Active/Old Files Organizer extension activated!');
    
    // Refresh on file save/create/delete
    const watcher = vscode.workspace.createFileSystemWatcher('**/*');
    watcher.onDidChange(() => provider.refresh());
    watcher.onDidCreate(() => provider.refresh());
    watcher.onDidDelete(() => provider.refresh());
    context.subscriptions.push(watcher, logger);
}

export function deactivate() {}
