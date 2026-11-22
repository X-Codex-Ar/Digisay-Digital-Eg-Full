$ErrorActionPreference = 'Stop'
$entries = @()
$seen = @{}

function Make-Entry([string]$src, [string]$page, [string]$w, [string]$h) {
  if (-not $src) { return $null }
  $base = ([System.IO.Path]::GetFileName($src) -replace '\?.*$', '')
  if (-not $base) { return $null }
  if ($seen.ContainsKey($base)) { return $null }
  $seen[$base] = $true
  $dest = $null
  foreach ($d in Get-ChildItem public/assets -Directory -Recurse) {
    $p = Join-Path $d.FullName $base
    if (Test-Path $p) { $dest = $p; break }
  }
  if (-not $dest) { return $null }
  $dw = $w; $dh = $h
  try { $img = [System.Drawing.Image]::FromFile($dest); $dw = $img.Width; $dh = $img.Height; $img.Dispose() } catch { }
  return @{ filename = $base; sourcePage = $page; sourceUrl = $src; localDestination = $dest; width = $dw; height = $dh }
}

foreach ($f in Get-ChildItem reference/txt -Filter '*.txt') {
  $page = ([System.IO.Path]::GetFileNameWithoutExtension($f.Name))
  foreach ($line in Get-Content $f.FullName) {
    if ($line -match '^IMG src=(\S+) alt=(.*?) w=(\S*) h=(\S*)$') {
      $e = Make-Entry $Matches[1] $page $Matches[3] $Matches[4]
      if ($e) { $entries += $e }
    }
  }
}

$cur = ''
foreach ($line in Get-Content reference/posts/extracted.txt) {
  if ($line -match '^=== (\S+) ===') { $cur = $Matches[1] }
  if ($line -match '^IMG src=(\S+) alt=(.*?) w=(\S*) h=(\S*)$') {
    $e = Make-Entry $Matches[1] $cur $Matches[3] $Matches[4]
    if ($e) { $entries += $e }
  }
}

$e = Make-Entry 'https://digisay.com/wp-content/uploads/2021/12/clb_blog_21-scaled-1.jpeg' 'blog-full-fledge-agency' '' ''
if ($e) { $entries += $e }

Set-Content -Path reference/asset-manifest.json -Value (($entries | ConvertTo-Json -Depth 2) + "`r`n") -Encoding UTF8
Write-Output ("Manifest entries: " + $entries.Count)
foreach ($en in ($entries | Sort-Object filename)) { Write-Output ("  " + $en.filename) }
