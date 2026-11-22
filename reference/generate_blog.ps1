$ErrorActionPreference = 'Stop'
$slugMap = @{
  'blog-full-fledge-agency' = 'full-fledge-agency'
  'blog-why-growth-marketing-is-essential-for-your-business-success' = 'why-growth-marketing-is-essential-for-your-business-success'
  'blog-how-anti-piracy-practices-unlock-revenue-for-content-creators' = 'how-anti-piracy-practices-unlock-revenue-for-content-creators'
  'post-4' = 'in-todays-competitive-digital-landscape'
}
$catMap = @{
  'blog-full-fledge-agency' = 'digital-solutions'
  'blog-why-growth-marketing-is-essential-for-your-business-success' = 'growth-marketing'
  'blog-how-anti-piracy-practices-unlock-revenue-for-content-creators' = 'anti-piracy'
  'post-4' = 'digital-solutions'
}
$order = @('blog-full-fledge-agency','blog-why-growth-marketing-is-essential-for-your-business-success','blog-how-anti-piracy-practices-unlock-revenue-for-content-creators','post-4')

$posts = @{}
$curName = ''; $cur = $null; $key = $null
foreach ($line in Get-Content reference/posts/extracted.txt) {
  if ($line -match '^=== (\S+) ===$') {
    $curName = $Matches[1]; $posts[$curName] = @{ paragraphs = @() }; $cur = $posts[$curName]; $key = $null; continue
  }
  if ($line -match '^(\w+): $') { $key = $Matches[1]; continue }
  if ($line -match '^\+$') { continue }
  $line = $line.Trim()
  if (-not $line) { $key = $null; continue }
  if (-not $cur) { continue }
  if ($key -eq 'OGTITLE') { $cur['title'] = $line }
  elseif ($key -eq 'PUB') { $cur['date'] = $line }
  elseif ($key -eq 'IMAGE') { $cur['image'] = $line }
  elseif ($key -eq 'P') { if ($line -and ($line -notmatch '^Ac \d{4}, DigiSay$') -and ($line -ne 'Privacy Policy')) { $cur['paragraphs'] += $line } }
}

$objs = @()
foreach ($name in $order) {
  $p = $posts[$name]
  $title = ([string]$p['title']) -replace '\s+', ' '
  $title = $title.Replace('&amp;', '&')
  $title = $title -replace ' - DigiSay$', ''
  $title = $title -replace 'Digisay$', 'DigiSay'
  $cat = $catMap[$name]
  $slug = $slugMap[$name]
  $to = '/blog/' + $slug + '/'
  $img = ''
  if ($p['image']) {
    $base = ([System.IO.Path]::GetFileName($p['image']) -replace '\?.*$', '')
    $img = '/assets/blog/' + $base
  }
  $excerpt = ($p['paragraphs'] | Select-Object -First 2 | ForEach-Object { $_ }) -join ' '
  $objs += @{ slug = $slug; title = $title; date = $p['date']; excerpt = $excerpt; image = $img; category = $cat; tags = @($cat); author = 'DigiSay'; content = $p['paragraphs']; to = $to }
}

$cats = $objs | ForEach-Object { $_.category } | Select-Object -Unique
$tags = $objs | ForEach-Object { $_.tags } | Select-Object -Unique
$authors = $objs | ForEach-Object { $_.author } | Select-Object -Unique

$ts = @()
$ts += 'export type BlogPost = {'
$ts += '  slug: string;'
$ts += '  title: string;'
$ts += '  date: string;'
$ts += '  excerpt: string;'
$ts += '  image: string;'
$ts += '  category: string;'
$ts += '  tags: string[];'
$ts += '  author: string;'
$ts += '  content: string[];'
$ts += '  to: string;'
$ts += '};'
$ts += ''
$ts += 'export const blogPosts: BlogPost[] = ' + (($objs | ConvertTo-Json -Depth 3)) + ';'
$ts += ''
$ts += 'export function getPostBySlug(slug: string): BlogPost | undefined {'
$ts += '  return blogPosts.find((p) => p.slug === slug);'
$ts += '}'
$ts += ''
$ts += 'export function getPostsByCategory(category: string): BlogPost[] {'
$ts += '  return blogPosts.filter((p) => p.category === category);'
$ts += '}'
$ts += ''
$ts += 'export function getPostsByTag(tag: string): BlogPost[] {'
$ts += '  return blogPosts.filter((p) => p.tags.includes(tag));'
$ts += '}'
$ts += ''
$ts += 'export function getPostsByAuthor(author: string): BlogPost[] {'
$ts += '  return blogPosts.filter((p) => p.author === author);'
$ts += '}'
$ts += ''
$ts += 'export const blogCategories = ' + (($cats | ConvertTo-Json)) + ' as string[];'
$ts += 'export const blogTags = ' + (($tags | ConvertTo-Json)) + ' as string[];'
$ts += 'export const blogAuthors = ' + (($authors | ConvertTo-Json)) + ' as string[];'
Set-Content -Path src/data/blog.ts -Value (($ts -join "`r`n") + "`r`n") -Encoding UTF8
Write-Output ("Blog posts: " + $objs.Count)
$objs | ForEach-Object { Write-Output ("  " + $_.slug + " | " + $_.title + " | " + $_.date + " | " + $_.category + " | img=" + $_.image + " | contentP=" + $_.content.Count) }
