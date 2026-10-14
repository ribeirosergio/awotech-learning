param([string]$SourcePath = '')

$ErrorActionPreference = 'Stop'
$OutputEncoding = [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
Add-Type -AssemblyName System.IO.Compression.FileSystem
if (-not $SourcePath) {
  $candidates = @(Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot '..') -Filter 'Apostila*.docx')
  if ($candidates.Count -ne 1) { throw 'Specify -SourcePath: expected exactly one Apostila*.docx.' }
  $SourcePath = $candidates[0].FullName
}
$source = (Resolve-Path -LiteralPath $SourcePath).Path
$output = Join-Path $PSScriptRoot '../.tmp/apostila'
New-Item -ItemType Directory -Force -Path $output | Out-Null
$output = (Resolve-Path -LiteralPath $output).Path
$utf8 = [System.Text.UTF8Encoding]::new($false)
$zip = [System.IO.Compression.ZipFile]::OpenRead($source)

function Read-ZipXml([string]$Name) {
  $entry = $zip.GetEntry($Name)
  if (-not $entry) { throw "Entrada DOCX ausente: $Name" }
  $reader = [System.IO.StreamReader]::new($entry.Open())
  try { return [xml]$reader.ReadToEnd() } finally { $reader.Dispose() }
}

try {
  $doc = Read-ZipXml 'word/document.xml'
  $rels = Read-ZipXml 'word/_rels/document.xml.rels'
  $ns = [System.Xml.XmlNamespaceManager]::new($doc.NameTable)
  $ns.AddNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main')
  $ns.AddNamespace('a', 'http://schemas.openxmlformats.org/drawingml/2006/main')
  $paragraphs = $doc.SelectNodes('//w:body//w:p', $ns)
  $lines = [System.Collections.Generic.List[string]]::new()
  $images = [System.Collections.Generic.List[string]]::new()

  for ($i = 0; $i -lt $paragraphs.Count; $i++) {
    $paragraph = $paragraphs[$i]
    $text = ($paragraph.SelectNodes('.//w:t', $ns) | ForEach-Object { $_.InnerText }) -join ''
    if ($text.Trim()) { $lines.Add("[$i] $text") }
    foreach ($image in $paragraph.SelectNodes('.//a:blip', $ns)) {
      $id = $image.GetAttribute('embed', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')
      $target = ($rels.Relationships.Relationship | Where-Object Id -EQ $id).Target
      if (-not $target) { continue }
      $entry = $zip.GetEntry('word/' + $target)
      if (-not $entry) { continue }
      $images.Add("[$i] $target")
      # Use the filename only, never arbitrary paths embedded in the ZIP.
      $destination = Join-Path $output ([System.IO.Path]::GetFileName($target))
      [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $destination, $true)
    }
  }
  [System.IO.File]::WriteAllLines((Join-Path $output 'paragraphs.txt'), $lines, $utf8)
  [System.IO.File]::WriteAllLines((Join-Path $output 'images.txt'), $images, $utf8)
  $hash = (Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash
  [System.IO.File]::WriteAllText((Join-Path $output 'source.sha256'), "$hash`n", $utf8)
  Write-Output "Extracted to $output"
  Write-Output "Paragraphs: $($paragraphs.Count); image references: $($images.Count)"
  Write-Output "SHA-256: $hash"
} finally {
  $zip.Dispose()
}
