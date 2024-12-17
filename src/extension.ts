import vscode from 'vscode';
import simpleGit, { SimpleGit } from 'simple-git';
import path from 'path';

const git: SimpleGit = simpleGit();

export function activate(context: vscode.ExtensionContext) {
  let addFileCommand = vscode.commands.registerCommand('git-helpers.addFile', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("Нет открытого файла.");
      return;
    }
    const filePath = editor.document.uri.fsPath;
    const repoRoot = await getGitRepoRoot(filePath);
    if (!repoRoot) {
      vscode.window.showErrorMessage("Не удалось найти корень репозитория Git.");
      return;
    }
    try {
      const gitInRepo = simpleGit(repoRoot);
      await gitInRepo.add(filePath);
      vscode.window.showInformationMessage(`Файл ${filePath} добавлен в индекс.`);
    } catch (error) {
      vscode.window.showErrorMessage(`Ошибка при добавлении файла: ${(error as Error).message}`);
    }
  });

  let removeFileCommand = vscode.commands.registerCommand('git-helpers.removeFile', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("Нет открытого файла.");
      return;
    }
    const filePath = editor.document.uri.fsPath;
    const repoRoot = await getGitRepoRoot(filePath);
    if (!repoRoot) {
      vscode.window.showErrorMessage("Не удалось найти корень репозитория Git.");
      return;
    }
    try {
      const gitInRepo = simpleGit(repoRoot);
      await gitInRepo.reset([filePath]);
      vscode.window.showInformationMessage(`Файл ${filePath} удален из индекса.`);
    } catch (error) {
      vscode.window.showErrorMessage(`Ошибка при удалении файла: ${(error as Error).message}`);
    }
  });

  let statusCommand = vscode.commands.registerCommand('git-helpers.status', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("Нет открытого файла.");
      return;
    }
    const filePath = editor.document.uri.fsPath;
    const repoRoot = await getGitRepoRoot(filePath);
    if (!repoRoot) {
      vscode.window.showErrorMessage("Не удалось найти корень репозитория Git.");
      return;
    }
    try {
      const gitInRepo = simpleGit(repoRoot);
      const status = await gitInRepo.status();
      vscode.window.showInformationMessage(`Статус репозитория:\n${JSON.stringify(status, null, 2)}`);
    } catch (error) {
      vscode.window.showErrorMessage(`Ошибка при получении статуса репозитория: ${(error as Error).message}`);
    }
  });
  context.subscriptions.push(addFileCommand);
  context.subscriptions.push(removeFileCommand);
  context.subscriptions.push(statusCommand);
}

async function getGitRepoRoot(filePath: string): Promise<string | null> {
  const fs = require('fs').promises;
  const dir = path.dirname(filePath);
  let currentDir = dir;
  while (currentDir !== '/') {
    const gitDir = path.join(currentDir, '.git');
    try {
      await fs.access(gitDir);
      return currentDir;
    } catch (err) {
      currentDir = path.dirname(currentDir);
    }
  }
  return null;
}

export function deactivate() {}
