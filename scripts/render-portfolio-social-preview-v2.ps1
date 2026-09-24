param(
  [string]$OutputPath = (Join-Path $PSScriptRoot '../public/assets/portfolio-social-preview-v2.png'),
  [string]$PortraitPath = (Join-Path $PSScriptRoot '../public/profile/aman-portrait-20260924.png')
)

# Code-native editorial card: readable in chat, without decorative telemetry.
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
$graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#111310'))
$foreground = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#f5f3ed'))
$muted = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#bec2b9'))
$accent = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#d8ff4f'))
$line = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml('#353932'), 1)
$nameFont = New-Object System.Drawing.Font($family, 76, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$roleFont = New-Object System.Drawing.Font($family, 34, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$bodyFont = New-Object System.Drawing.Font($family, 23, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$footerFont = New-Object System.Drawing.Font($family, 18, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$photo = [System.Drawing.Image]::FromFile((Resolve-Path -LiteralPath $PortraitPath).Path)
try {
  $graphics.DrawString('Aman Kumar.', $nameFont, $foreground, 64, 138)
  $graphics.DrawString('AI Engineer &', $roleFont, $foreground, 70, 255)
  $graphics.DrawString('Full-Stack Developer', $roleFont, $foreground, 70, 299)
  $graphics.DrawString('Thoughtful AI. Reliable software.', $bodyFont, $muted, 71, 390)
  $graphics.FillRectangle($accent, 73, 450, 36, 3)
  $destination = New-Object System.Drawing.RectangleF(780, 70, 348, 428)
  $sourceWidth = $photo.Height * (348.0 / 428.0)
  $sourceX = ($photo.Width - $sourceWidth) / 2.0
  $source = New-Object System.Drawing.RectangleF($sourceX, 0, $sourceWidth, $photo.Height)
  $graphics.DrawImage($photo, $destination, $source, [System.Drawing.GraphicsUnit]::Pixel)
  $graphics.DrawLine($line, 73, 535, 1128, 535)
  $graphics.DrawString('Bengaluru, India', $footerFont, $muted, 71, 560)
  $website = 'aman-kumar-ai-portfolio.vercel.app'
  $websiteWidth = $graphics.MeasureString($website, $footerFont).Width
  $graphics.DrawString($website, $footerFont, $muted, 1128 - $websiteWidth, 560)
  $directory = Split-Path -Parent $OutputPath
  if (-not (Test-Path -LiteralPath $directory)) { New-Item -ItemType Directory -Path $directory | Out-Null }
  $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
} finally {
  $photo.Dispose(); $nameFont.Dispose(); $roleFont.Dispose(); $bodyFont.Dispose(); $footerFont.Dispose()
  $foreground.Dispose(); $muted.Dispose(); $accent.Dispose(); $line.Dispose()
  $graphics.Dispose(); $bitmap.Dispose(); $typefaces.Dispose()
}
Get-Item -LiteralPath $OutputPath | Select-Object FullName, Length
