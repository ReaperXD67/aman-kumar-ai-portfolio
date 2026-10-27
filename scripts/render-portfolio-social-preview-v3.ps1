param(
  [string]$OutputPath = (Join-Path $PSScriptRoot '../public/assets/portfolio-social-preview-v3.png'),
  [string]$PortraitPath = (Join-Path $PSScriptRoot '../public/profile/aman-portrait-20261027.png')
)

# Mechanical composition from the finished portrait; no face or photo retouch.
# Restrained 1200x630 artwork stays readable in recruiter-facing link previews.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$fontPath = Join-Path $PSScriptRoot '../public/fonts/SpaceGrotesk.ttf'
if (-not (Test-Path -LiteralPath $fontPath)) { throw 'The bundled Space Grotesk font is required.' }
$typefaces = New-Object System.Drawing.Text.PrivateFontCollection
$typefaces.AddFontFile((Resolve-Path -LiteralPath $fontPath).Path)
$family = $typefaces.Families[0]
$bitmap = New-Object System.Drawing.Bitmap(1200, 630)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#0d0f0e'))
$foreground = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#f5f3ed'))
$muted = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#bfc2ba'))
$nameFont = New-Object System.Drawing.Font($family, 72, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$roleFont = New-Object System.Drawing.Font($family, 33, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$bodyFont = New-Object System.Drawing.Font($family, 24, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$footerFont = New-Object System.Drawing.Font($family, 18, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$photo = [System.Drawing.Image]::FromFile((Resolve-Path -LiteralPath $PortraitPath).Path)
try {
  $graphics.DrawString('Aman Kumar', $nameFont, $foreground, 62, 150)
  $graphics.DrawString('AI Engineer &', $roleFont, $foreground, 67, 260)
  $graphics.DrawString('Full-Stack Developer', $roleFont, $foreground, 67, 304)
  $graphics.DrawString('AI systems. Built to be accountable.', $bodyFont, $muted, 68, 390)
  $graphics.DrawString('aman-kumar-ai-portfolio.vercel.app', $footerFont, $muted, 69, 522)
  $destination = New-Object System.Drawing.RectangleF(672, 85, 460, 460)
  $sourceSize = [Math]::Min($photo.Width, $photo.Height)
  $sourceX = ($photo.Width - $sourceSize) / 2.0
  $sourceY = ($photo.Height - $sourceSize) / 2.0
  $source = New-Object System.Drawing.RectangleF($sourceX, $sourceY, $sourceSize, $sourceSize)
  $graphics.DrawImage($photo, $destination, $source, [System.Drawing.GraphicsUnit]::Pixel)
  $directory = Split-Path -Parent $OutputPath
  if (-not (Test-Path -LiteralPath $directory)) { New-Item -ItemType Directory -Path $directory | Out-Null }
  $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
} finally {
  $photo.Dispose(); $nameFont.Dispose(); $roleFont.Dispose(); $bodyFont.Dispose(); $footerFont.Dispose()
  $foreground.Dispose(); $muted.Dispose()
  $graphics.Dispose(); $bitmap.Dispose(); $typefaces.Dispose()
}
Get-Item -LiteralPath $OutputPath | Select-Object FullName, Length
