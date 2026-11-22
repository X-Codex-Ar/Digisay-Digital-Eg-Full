$ErrorActionPreference = 'Stop'
$lines = foreach ($d in Get-ChildItem public/assets -Directory) {
  $n = (Get-ChildItem $d.FullName -File).Count
  "$($d.Name): $n files"
}
$lines | Out-String -Width 160
Write-Output "---- privacy h2/h3 in SSR ----"
$priv = Get-Content -Raw reference/ssr-privacy-policy.html
$headings = [regex]::Matches($priv, '<h([1-3])>([^<]*)</h[1-3]>') | ForEach-Object { "h" + $_.Groups[1].Value + ": " + $_.Groups[2].Value }
$headings | Select-Object -First 8 | Out-String -Width 160
