/**
 * Script para sincronizar arquivos ESSENCIAIS do Arcádia Suite com GitHub
 * Versão minimalista para evitar rate limiting
 */

import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;
  if (!connectionSettings || !accessToken) throw new Error('GitHub not connected');
  return accessToken;
}

async function getGitHubClient() {
  return new Octokit({ auth: await getAccessToken() });
}

const OWNER = 'JonasRodriguesPachceo';
const REPO = 'ArcadiaSuite-';
const BRANCH = 'main';

// Essential files only - the core structure
const ESSENTIAL_FILES = [
  // Root config
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
  'tailwind.config.ts',
  'postcss.config.js',
  'drizzle.config.ts',
  'replit.md',
  
  // Shared
  'shared/schema.ts',
  
  // Server core
  'server/index.ts',
  'server/routes.ts',
  'server/storage.ts',
  'server/vite.ts',
  'server/db.ts',
  
  // Client core
  'client/index.html',
  'client/src/main.tsx',
  'client/src/App.tsx',
  'client/src/index.css',
  
  // Docs
  'docs/ARCADIA_SUITE_ARQUITETURA.md',
];

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

function getFilesRecursive(dir: string, base: string = ''): string[] {
  const files: string[] = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(base, entry.name);
      if (entry.isDirectory()) {
        files.push(...getFilesRecursive(fullPath, relativePath));
      } else {
        files.push(relativePath);
      }
    }
  } catch (e) {}
  return files;
}

async function syncToGitHub() {
  console.log('🚀 Sincronização ESSENCIAL com GitHub');
  console.log(`📦 Repositório: ${OWNER}/${REPO}\n`);
  
  const octokit = await getGitHubClient();
  const { data: user } = await octokit.users.getAuthenticated();
  console.log(`✅ Autenticado: ${user.login}`);
  
  const projectRoot = process.cwd();
  
  // Collect all files from key directories
  const filesToSync: string[] = [...ESSENTIAL_FILES];
  
  // Add client/src files
  const clientSrcFiles = getFilesRecursive(path.join(projectRoot, 'client/src'), 'client/src');
  filesToSync.push(...clientSrcFiles.filter(f => f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.css')));
  
  // Add server files
  const serverFiles = getFilesRecursive(path.join(projectRoot, 'server'), 'server');
  filesToSync.push(...serverFiles.filter(f => f.endsWith('.ts')));
  
  // Add shared files
  const sharedFiles = getFilesRecursive(path.join(projectRoot, 'shared'), 'shared');
  filesToSync.push(...sharedFiles.filter(f => f.endsWith('.ts')));
  
  // Filter to only existing files (unique)
  const uniqueFiles = [...new Set(filesToSync)].filter(f => {
    try {
      const stats = fs.statSync(path.join(projectRoot, f));
      return stats.isFile() && stats.size < 500 * 1024; // < 500KB
    } catch { return false; }
  });
  
  console.log(`📁 ${uniqueFiles.length} arquivos para sincronizar\n`);
  
  // Get branch SHA
  const { data: ref } = await octokit.git.getRef({
    owner: OWNER, repo: REPO, ref: `heads/${BRANCH}`
  });
  const baseSha = ref.object.sha;
  
  const { data: baseCommit } = await octokit.git.getCommit({
    owner: OWNER, repo: REPO, commit_sha: baseSha
  });
  
  // Upload files with delays
  const treeItems: any[] = [];
  let uploaded = 0;
  
  for (const filePath of uniqueFiles) {
    try {
      const content = fs.readFileSync(path.join(projectRoot, filePath));
      
      const { data: blob } = await octokit.git.createBlob({
        owner: OWNER,
        repo: REPO,
        content: content.toString('base64'),
        encoding: 'base64'
      });
      
      treeItems.push({
        path: filePath,
        mode: '100644',
        type: 'blob',
        sha: blob.sha
      });
      
      uploaded++;
      process.stdout.write(`\r📤 ${uploaded}/${uniqueFiles.length}`);
      
      // Rate limiting
      await sleep(200);
      
    } catch (err: any) {
      if (err.message?.includes('rate limit')) {
        console.log('\n⏳ Rate limit - aguardando 30s...');
        await sleep(30000);
      }
    }
  }
  
  console.log(`\n✅ ${uploaded} arquivos prontos\n`);
  
  if (treeItems.length === 0) {
    console.log('⚠️ Nenhum arquivo enviado');
    return;
  }
  
  // Create tree and commit
  console.log('🌳 Criando commit...');
  
  const { data: newTree } = await octokit.git.createTree({
    owner: OWNER, repo: REPO,
    base_tree: baseCommit.tree.sha,
    tree: treeItems
  });
  
  const { data: newCommit } = await octokit.git.createCommit({
    owner: OWNER, repo: REPO,
    message: `Arcádia Suite Core - ${new Date().toLocaleDateString('pt-BR')}`,
    tree: newTree.sha,
    parents: [baseSha]
  });
  
  await octokit.git.updateRef({
    owner: OWNER, repo: REPO,
    ref: `heads/${BRANCH}`,
    sha: newCommit.sha
  });
  
  console.log('\n🎉 Sincronização concluída!');
  console.log(`📝 Commit: ${newCommit.sha.substring(0, 7)}`);
  console.log(`🔗 https://github.com/${OWNER}/${REPO}`);
}

syncToGitHub().catch(err => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
