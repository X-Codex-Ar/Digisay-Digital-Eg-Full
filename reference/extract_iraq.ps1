$ErrorActionPreference = 'Stop'

$pages = @('content-management-and-monetization-iraq')

function GetVal($m, $i) {
  if ($m -and $m.Success) { return (($m.Groups[$i].Value -replace '\s+', ' ').Trim()) }
  return ''
}

function Clean([string]$t) {
  $t = $t -replace '<[^>]+>', ' '
  $t = $t.Replace('&nbsp;', ' ').Replace('&amp;', '&').Replace('&#38;', '&')
  $t = $t.Replace('&lt;', '<').Replace('&gt;', '>').Replace('&quot;', '"').Replace("&#39;", "'").Replace('&#039;', "'")
  $t = $t.Replace('&#8217;', "'").Replace('&#8216;', "'").Replace('&#8220;', '"').Replace('&#8221;', '"')
  return (($t -replace '\s+', ' ').Trim())
}

New-Item -ItemType Directory -Force reference/txt | Out-Null
$summary = @()
foreach ($p in $pages) {
  $f = 'reference/' + $p + '.html'
  if (-not (Test-Path $f)) { $summary += ($p + ' MISSING'); continue }
  $html = Get-Content -Raw -Encoding UTF8 $f
  $out = New-Object System.Collections.Generic.List[string]
  $out.Add('=== ' + $p + ' ===')

  $tm = [regex]::Match($html, '<title[^>]*>([\s\S]*?)</title>')
  $t = GetVal $tm 1
  if ($t) { $out.Add('TITLE: ' + $t) }

  foreach ($m in [regex]::Matches($html, '<meta\b[^>]*>')) {
    $tag = $m.Value
    $nm = [regex]::Match($tag, 'name="([^"]+)"'); $pr = [regex]::Match($tag, 'property="([^"]+)"')
    $ct = [regex]::Match($tag, 'content="([^"]*)"')
    $lbl = GetVal $nm 1; if (-not $lbl) { $lbl = GetVal $pr 1 }
    if (($nm.Success -or $pr.Success) -and $ct.Success) {
      $out.Add('META [' + $lbl + ']: ' + (GetVal $ct 1))
    }
  }

  foreach ($m in [regex]::Matches($html, '<img\b[^>]*>')) {
    $tag = $m.Value
    $s = GetVal ([regex]::Match($tag, 'src="([^"]*)"')) 1
    $a = GetVal ([regex]::Match($tag, 'alt="([^"]*)"')) 1
    $w = GetVal ([regex]::Match($tag, 'width="([^"]*)"')) 1
    $h = GetVal ([regex]::Match($tag, 'height="([^"]*)"')) 1
    $out.Add('IMG src=' + $s + ' alt=' + $a + ' w=' + $w + ' h=' + $h)
  }

  foreach ($m in [regex]::Matches($html, '<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)</a>')) {
    $href = GetVal $m 1
    $txt = Clean ($m.Groups[2].Value)
    if ($txt -and $href) { $out.Add('LINK [' + $txt + '] ' + $href) }
  }

  foreach ($m in [regex]::Matches($html, '<(h[1-6]|p|li|td|th|blockquote|figcaption|dt|dd)\b[^>]*>([\s\S]*?)<\/\1\s*>')) {
    $txt = Clean ($m.Groups[2].Value)
    if ($txt) { $out.Add($m.Groups[1].Value.ToUpper() + ' ' + $txt) }
  }

  $out.Add('=== end ' + $p + ' (' + $out.Count + ' lines) ===')
  Set-Content -Path ('reference/txt/' + $p + '.txt') -Value ($out -join "`r`n") -Encoding UTF8
  $summary += ($p + ' lines: ' + $out.Count)
}
Set-Content -Path reference/txt/summary.txt -Value ($summary -join "`r`n")
Write-Output ("Extracted: " + (($summary -join ', ')))
