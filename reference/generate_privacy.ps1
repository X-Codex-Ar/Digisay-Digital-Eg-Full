$ErrorActionPreference = 'Stop'
$blocks = @()
foreach ($line in Get-Content reference/txt/privacy-policy.txt) {
  if ($line -match '^(P|LI|H[1-6]) (.*)$') {
    $type = $Matches[1]
    $text = $Matches[2]
    if ($type -eq 'P' -and ($text -match '^Ac \d{4}, DigiSay$' -or $text -eq 'Privacy Policy' -or $text -eq '')) { continue }
    $kind = if ($type -eq 'P') { 'paragraph' } elseif ($type -eq 'LI') { 'bullet' } else { 'heading' }
    $blocks += @{ type = $kind; text = $text }
  }
}
$ts = 'export type PrivacyBlock = { type: "heading" | "paragraph" | "bullet"; text: string };' + "`r`n`r`n" +
      'export const privacyBlocks: PrivacyBlock[] = ' + (($blocks | ConvertTo-Json -Depth 1)) + ';' + "`r`n"
Set-Content -Path src/data/privacy.ts -Value $ts -Encoding UTF8
Write-Output ("Privacy blocks: " + $blocks.Count)
