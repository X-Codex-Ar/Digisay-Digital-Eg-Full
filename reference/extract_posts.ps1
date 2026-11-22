$ErrorActionPreference = 'Stop'

function GetVal($m, $i) {
  if ($m -and $m.Success) { return (($m.Groups[$i].Value -replace '\s+', ' ').Trim()) }
  return ''
}

function Clean([string]$t) {
  $t = $t -replace '<[^>]+>', ' '
  $t = $t.Replace('&nbsp;', ' ').Replace('&amp;', '&').Replace('&#38;', '&')
  $t = $t.Replace('&lt;', '<').Replace('&gt;', '>').Replace('&quot;', '"').Replace("&#39;", "'").Replace('&#039;', "'")
  $t = $t.Replace('&#8217;', "'").Replace('&#8216;', "'").Replace('&#8220;', '"').Replace('&#8221;', '"')
  $t = $t.Replace('&#8211;', '-').Replace('&#8212;', '—')
  return (($t -replace '\s+', ' ').Trim())
}

$pages = @('blog-full-fledge-agency','blog-why-growth-marketing-is-essential-for-your-business-success','blog-how-anti-piracy-practices-unlock-revenue-for-content-creators','post-4')
foreach ($p in $pages) {
  $f = 'reference/posts/' + $p + '.html'
  if (-not (Test-Path $f)) { Write-Output "=== $p MISSING ==="; continue }
  $html = Get-Content -Raw $f
  Write-Output "=== $p ==="
  $tm = [regex]::Match($html, '<title[^>]*>([\s\S]*?)</title>')
  $h1 = [regex]::Match($html, '<h1[^>]*>([\s\S]*?)<\/h1\s*>')
  $dt = [regex]::Matches($html, '<time\b[^>]*>')
  if ($h1.Success) { Write-Output "H1: " + (Clean $h1.Groups[1].Value) }
  elseif ($tm.Success) { Write-Output "TITLE: " + (GetVal $tm 1) }
  foreach ($m in $dt) { Write-Output "DATE: " + ($m.Value -replace '<[^>]+>', '').Trim() }
  foreach ($m in [regex]::Matches($html, '<meta\b[^>]*>')) {
    $tag = $m.Value
    $propM = [regex]::Match($tag, 'property="([^"]*)"')
    $ct = [regex]::Match($tag, 'content="([^"]*)"')
    if ($propM.Success -and $ct.Success) {
      $lbl = GetVal $propM 1
      if ($lbl -eq 'og:image') { Write-Output "IMAGE: " + (GetVal $ct 1) }
      if ($lbl -eq 'og:title') { Write-Output "OGTITLE: " + (GetVal $ct 1) }
      if ($lbl -eq 'article:published_time') { Write-Output "PUB: " + (GetVal $ct 1) }
    }
  }
  $count = 0
  foreach ($m in [regex]::Matches($html, '<p\b[^>]*>([\s\S]*?)<\/p\s*>')) {
    $txt = Clean $m.Groups[1].Value
    if ($txt -and $txt -notmatch '^\d+$') {
      $count++
      if ($count -le 60) { Write-Output "P: " + $txt }
    }
  }
  Write-Output "TOTAL P BLOCKS (nonempty): $count"
}
