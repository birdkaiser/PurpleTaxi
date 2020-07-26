$StaticPath = ".\static"
$SourcePath = ".\build"
$OutputPath = "C:\Program Files (x86)\World of Warcraft\_classic_\Interface\AddOns\PurpleTaxi"

Robocopy $StaticPath $SourcePath /MIR /NFL /NDL /NJH /NC /NS /NP
# npm run lint
npm run build
Robocopy $SourcePath $OutputPath /MIR /NFL /NDL /NJH /NC /NS /NP