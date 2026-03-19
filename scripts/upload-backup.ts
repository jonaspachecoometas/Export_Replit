/**
 * Upload backup file to existing GitHub release
 */

import { Octokit } from '@octokit/rest';
import * as fs from 'fs';

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

  if (!xReplitToken) throw new Error('Token não encontrado');

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
  if (!connectionSettings || !accessToken) throw new Error('GitHub não conectado');
  return accessToken;
}

const OWNER = 'JonasRodriguesPachceo';
const REPO = 'ArcadiaSuite-';

async function uploadBackup() {
  const backupFile = '/tmp/arcadia-suite-backup-2026-02-02T23-07-53.tar.gz';
  
  if (!fs.existsSync(backupFile)) {
    console.log('❌ Arquivo de backup não encontrado');
    return;
  }
  
  const stats = fs.statSync(backupFile);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`📦 Arquivo: ${sizeMB} MB\n`);
  
  const accessToken = await getAccessToken();
  const octokit = new Octokit({ auth: accessToken });
  
  // Get latest release
  const { data: releases } = await octokit.repos.listReleases({
    owner: OWNER,
    repo: REPO,
    per_page: 1
  });
  
  if (releases.length === 0) {
    console.log('❌ Nenhuma release encontrada');
    return;
  }
  
  const release = releases[0];
  console.log(`📝 Release: ${release.name}`);
  console.log(`🔗 ${release.html_url}\n`);
  
  // Check if asset already exists
  const existingAsset = release.assets.find(a => a.name.includes('backup'));
  if (existingAsset) {
    console.log('✅ Backup já foi uploaded!');
    console.log(`📥 Download: ${existingAsset.browser_download_url}`);
    return;
  }
  
  console.log('📤 Fazendo upload via API...\n');
  
  // Read file and upload
  const fileBuffer = fs.readFileSync(backupFile);
  
  try {
    const result = await octokit.repos.uploadReleaseAsset({
      owner: OWNER,
      repo: REPO,
      release_id: release.id,
      name: 'arcadia-suite-backup-2026-02-02.tar.gz',
      // @ts-ignore
      data: fileBuffer,
      headers: {
        'content-type': 'application/gzip',
        'content-length': stats.size
      }
    });
    
    console.log('🎉 Upload concluído!');
    console.log(`📥 Download: ${result.data.browser_download_url}`);
  } catch (err: any) {
    console.log('Tentando upload alternativo via fetch...');
    
    // Try using direct fetch for large files
    const uploadUrl = release.upload_url.replace('{?name,label}', `?name=arcadia-suite-full-backup.tar.gz`);
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/gzip',
        'Content-Length': stats.size.toString()
      },
      body: fileBuffer
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('🎉 Upload concluído!');
      console.log(`📥 Download: ${data.browser_download_url}`);
    } else {
      console.log(`❌ Erro: ${response.status} ${response.statusText}`);
    }
  }
}

uploadBackup().catch(err => {
  console.error('❌ Erro:', err.message);
});
