/**
 * Script para sincronizar código do Arcádia Suite com GitHub
 * Versão otimizada com rate limiting e filtros mais agressivos
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
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
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

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

const OWNER = 'JonasRodriguesPachceo';
const REPO = 'ArcadiaSuite-';
const BRANCH = 'main';

// Aggressive ignore patterns
const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  '.cache',
  '.upm',
  'dist',
  '.replit',
  'replit.nix',
  '.config',
  'package-lock.json',
  '__pycache__',
  '.pyc',
  '.env',
  'plus/vendor',
  'plus/node_modules',
  'plus/storage',
  'plus/bootstrap/cache',
  '.local',
  '.npm',
  '.nix-profile',
  'generated-icon.png',
  '.breakpoints',
  'attached_assets',
  'tmp',
  '.pythonlibs',
  '.replit.nix',
];

// Only include these directories
const INCLUDE_DIRS = [
  'client',
  'server',
  'shared',
  'scripts',
  'docs',
  'plus/app',
  'plus/config',
  'plus/database',
  'plus/resources',
  'plus/routes',
  'plus/public',
  'plus/bootstrap/app.php',
  'plus/artisan',
  'plus/composer.json',
  'plus/.env.example',
];

function shouldIgnore(filePath: string): boolean {
  // Check ignore patterns
  for (const pattern of IGNORE_PATTERNS) {
    if (filePath.includes(pattern)) return true;
  }
  return false;
}

function shouldInclude(filePath: string, projectRoot: string): boolean {
  const relativePath = path.relative(projectRoot, filePath);
  
  // Always include root files
  if (!relativePath.includes('/')) {
    const ext = path.extname(relativePath);
    const allowed = ['.json', '.ts', '.js', '.md', '.txt', '.yml', '.yaml'];
    return allowed.includes(ext) || relativePath === 'replit.md';
  }
  
  // Check if in included directories
  for (const dir of INCLUDE_DIRS) {
    if (relativePath.startsWith(dir)) return true;
  }
  
  return false;
}

function getAllFiles(dirPath: string, projectRoot: string, arrayOfFiles: string[] = []): string[] {
  try {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
      const fullPath = path.join(dirPath, file);
      if (shouldIgnore(fullPath)) return;
      
      try {
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          arrayOfFiles = getAllFiles(fullPath, projectRoot, arrayOfFiles);
        } else if (stats.isFile() && shouldInclude(fullPath, projectRoot)) {
          // Skip files larger than 1MB
          if (stats.size <= 1024 * 1024) {
            arrayOfFiles.push(fullPath);
          }
        }
      } catch (e) {
        // Ignore permission errors
      }
    });
  } catch (e) {
    // Ignore permission errors
  }

  return arrayOfFiles;
}

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function syncToGitHub() {
  console.log('🚀 Iniciando sincronização com GitHub...');
  console.log(`📦 Repositório: ${OWNER}/${REPO}`);
  
  const octokit = await getGitHubClient();
  
  // Get current user
  const { data: user } = await octokit.users.getAuthenticated();
  console.log(`✅ Autenticado como: ${user.login}`);
  
  // Get all files to upload
  const projectRoot = process.cwd();
  const files = getAllFiles(projectRoot, projectRoot);
  console.log(`📁 Encontrados ${files.length} arquivos para sincronizar`);
  
  // Get the latest commit SHA
  let baseSha: string;
  try {
    const { data: ref } = await octokit.git.getRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${BRANCH}`
    });
    baseSha = ref.object.sha;
    console.log(`📌 Branch ${BRANCH}, SHA: ${baseSha.substring(0, 7)}`);
  } catch (e) {
    console.error('❌ Branch não encontrado. Verifique se o repositório existe.');
    return;
  }
  
  // Get the base tree
  const { data: baseCommit } = await octokit.git.getCommit({
    owner: OWNER,
    repo: REPO,
    commit_sha: baseSha
  });
  
  // Create blobs with rate limiting
  console.log('📤 Enviando arquivos (com rate limiting)...');
  const treeItems: any[] = [];
  let uploaded = 0;
  let errors = 0;
  
  for (const filePath of files) {
    try {
      const relativePath = path.relative(projectRoot, filePath);
      const content = fs.readFileSync(filePath);
      
      // Rate limiting: wait 100ms between requests
      if (uploaded > 0 && uploaded % 10 === 0) {
        await sleep(1000);
      }
      
      const { data: blob } = await octokit.git.createBlob({
        owner: OWNER,
        repo: REPO,
        content: content.toString('base64'),
        encoding: 'base64'
      });
      
      treeItems.push({
        path: relativePath,
        mode: '100644',
        type: 'blob',
        sha: blob.sha
      });
      
      uploaded++;
      if (uploaded % 50 === 0) {
        console.log(`   ${uploaded}/${files.length} arquivos enviados...`);
      }
    } catch (err: any) {
      if (err.message?.includes('rate limit')) {
        console.log('⏳ Rate limit atingido, aguardando 60s...');
        await sleep(60000);
        // Retry
        try {
          const relativePath = path.relative(projectRoot, filePath);
          const content = fs.readFileSync(filePath);
          const { data: blob } = await octokit.git.createBlob({
            owner: OWNER,
            repo: REPO,
            content: content.toString('base64'),
            encoding: 'base64'
          });
          treeItems.push({
            path: relativePath,
            mode: '100644',
            type: 'blob',
            sha: blob.sha
          });
          uploaded++;
        } catch (retryErr) {
          errors++;
        }
      } else {
        errors++;
        if (errors <= 3) {
          console.error(`❌ Erro: ${err.message?.substring(0, 80)}`);
        }
      }
    }
  }
  
  console.log(`✅ ${uploaded} arquivos preparados${errors > 0 ? `, ${errors} erros` : ''}`);
  
  if (treeItems.length === 0) {
    console.log('⚠️ Nenhum arquivo para enviar');
    return;
  }
  
  // Create new tree
  console.log('🌳 Criando árvore de arquivos...');
  const { data: newTree } = await octokit.git.createTree({
    owner: OWNER,
    repo: REPO,
    base_tree: baseCommit.tree.sha,
    tree: treeItems
  });
  
  // Create commit
  const commitMessage = `Sync Arcádia Suite - ${new Date().toISOString().split('T')[0]}`;
  console.log('💾 Criando commit...');
  const { data: newCommit } = await octokit.git.createCommit({
    owner: OWNER,
    repo: REPO,
    message: commitMessage,
    tree: newTree.sha,
    parents: [baseSha]
  });
  
  // Update branch reference
  await octokit.git.updateRef({
    owner: OWNER,
    repo: REPO,
    ref: `heads/${BRANCH}`,
    sha: newCommit.sha
  });
  
  console.log('');
  console.log('🎉 Sincronização concluída com sucesso!');
  console.log(`📝 Commit: ${newCommit.sha.substring(0, 7)}`);
  console.log(`🔗 URL: https://github.com/${OWNER}/${REPO}`);
}

syncToGitHub().catch(err => {
  console.error('❌ Erro na sincronização:', err.message);
  process.exit(1);
});
