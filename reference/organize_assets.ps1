$ErrorActionPreference = 'SilentlyContinue'
$map = @{
  'Digisay-logo-transparent-1-e1709464890607.png' = 'brand'
  'Digisay-logo-big.jpg' = 'brand'
  'AL-Arabya-01.png' = 'partners'
  'AL-Ghad-tv-01.png' = 'partners'
  'Googlr-01.png' = 'partners'
  'Netflix-01-01.png' = 'partners'
  'ON-01-01.png' = 'partners'
  'Ro_ya-01.png' = 'partners'
  'ROTANA-01.png' = 'partners'
  'SHahid-01-01.png' = 'partners'
  'Sony-01-01.png' = 'partners'
  'Synergy-01.png' = 'partners'
  'Ten-Tv-01.png' = 'partners'
  'USAID-01.png' = 'partners'
  'Viu-01.png' = 'partners'
  'Bill-and-Melinda-01.png' = 'partners'
  'Hill-International-01.png' = 'partners'
  'MAgdi-Yacoub-01-01.png' = 'partners'
  'MBC-01-e1703983164691.png' = 'partners'
  'GFF-01.png' = 'partners'
  'cubitcode-logo.webp' = 'partners'
  'immersive-logo.webp' = 'partners'
  'Mangos24-logo-e1703376100960.webp' = 'partners'
  'reviveco-logo.webp' = 'partners'
  'RightsHero-logo-e1703375640984.webp' = 'partners'
  'RightsHero-logo-e1710964585186.png' = 'partners'
  'Silkbytes-logo.webp' = 'partners'
  'CubitCode-team-2-scaled.jpeg' = 'about'
  'Outstanding_Tech_Implementation_of_2023-award_from_BroadcastPro_Middle_East-e1704240639702.png' = 'awards'
  'The_Best_Digital_Asset_Piracy_Protection_Solution_award_by_UAE_Business_Awards_in_2023-e1704240438568.png' = 'awards'
  'award_01.png' = 'awards'
  'award_02.png' = 'awards'
  'award_03.png' = 'awards'
  'customer-acquisition.png' = 'services'
  'one-stop-agency.jpeg' = 'services'
  'Analytics-e1706999819809.png' = 'services'
  'RightsHero-Dashboard.jpg' = 'services'
  'phoneSS1-min.png' = 'services'
  'phoneSS2-min.png' = 'services'
  'YouTube-anti-piracy.webp' = 'blog'
  'SelectionAll.png' = 'icons'
  'CirclesThreePlus.png' = 'icons'
  'ChatDots.png' = 'icons'
  'FigmaLogo.png' = 'icons'
  'mobile-notification-2.png' = 'icons'
  'AB-Testing.png' = 'icons'
  'Untitled-design-2024-12-11T121319.739.png' = 'backgrounds'
}
$moved = 0; $missing = 0
foreach ($item in $map.GetEnumerator()) {
  $src = Join-Path 'public/assets/tmp' $item.Key
  if (-not (Test-Path $src)) { Write-Output "MISSING: $($item.Key)"; $missing++; continue }
  $dir = Join-Path 'public/assets' $item.Value
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $dest = Join-Path $dir $item.Key
  if (-not (Test-Path $dest)) { Move-Item -LiteralPath $src -Destination $dest -Force }
  $moved++
}
# Remove MBC-01.png (355B placeholder, not referenced anywhere meaningful)
Remove-Item -LiteralPath public/assets/tmp/MBC-01.png -Force -ErrorAction SilentlyContinue
Get-ChildItem public/assets -Recurse | Select-Object DirectoryName, Name, Length | Sort-Object DirectoryName, Name | Out-String -Width 100
Write-Output ("moved: $moved, missing: $missing")
