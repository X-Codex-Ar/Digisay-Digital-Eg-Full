$ErrorActionPreference = 'SilentlyContinue'
$outDir = 'public/assets/tmp'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$urls = New-Object System.Collections.Generic.List[string]
foreach ($f in Get-ChildItem reference/txt -Filter '*.txt') {
  foreach ($line in Get-Content $f.FullName) {
    if ($line -match '^IMG src=(.+?) alt=') { $u = $Matches[1]; if ($u) { $urls.Add($u.Trim()) } }
  }
}
foreach ($f in Get-ChildItem reference/posts -Filter '*.html' -Recurse) {
  foreach ($line in Get-Content $f.FullName) {
    if ($line -match '^IMG src=(.+?) alt=') { $u = $Matches[1]; if ($u) { $urls.Add($u.Trim()) } }
  }
}

$seen = @{}
$count = 0; $skipped = 0
foreach ($u in $urls) {
  $u = $u -replace '&amp;', '&'
  if ($u -match '^https://digisay\.com/([^?]+)(\?.*)?$') { $path = $Matches[1] }
  elseif ($u -match '^https://i0\.wp\.com/digisay\.com/([^?]+)(\?.*)?$') { $path = $Matches[1] }
  elseif ($u -match '^https://digisay\.com/([^?"]+)') { $path = $Matches[1] }
  elseif ($u -match '^https://[^"]+?/([^?\s]+?\.(png|jpg|jpeg|webp))([?\s]|$)') { $path = $Matches[1] }
  else { $skipped++; continue }
  if ($path -notmatch '\.(png|jpg|jpeg|webp)$') { $skipped++; continue }
  $base = [System.IO.Path]::GetFileName($path)
  if (-not $base) { $skipped++; continue }
  $base = ($base -replace '[^A-Za-z0-9._-]', '-').Trim('-')
  if (-not $base) { $skipped++; continue }
  $key = ($base -replace '.*\.', '').ToLower() + '|' + $base.Substring(0, [Math]::Min(12, $base.Length))
  if ($seen.ContainsKey($key)) { continue }
  $seen[$key] = $base
  $dest = "$outDir/$base"
  if (Test-Path $dest) { continue }
  $fullUrl = "https://digisay.com/$path"
  curl.exe -sS -L -o $dest --max-time 90 $fullUrl 2>$null
  if (Test-Path $dest) { $sz = (Get-Item $dest).Length; if ($sz -gt 100) { $count++ } else { Remove-Item $dest -Force -ErrorAction SilentlyContinue; $skipped++ } }
  else { $skipped++ }
}
Write-Output "Downloaded: $count, skipped/failed: $skipped"
Get-ChildItem $outDir | Select Name, Length | Sort-Object Name
