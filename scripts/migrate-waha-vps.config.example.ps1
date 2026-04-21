@{
  # VPS lama tempat WAHA aktif saat ini.
  OldHost = "113.29.226.146"
  OldUser = "ridho"
  OldPort = 22
  OldKeyPath = "$HOME\.ssh\id_ed25519"
  OldPassword = ""

  # VPS baru tujuan migrasi.
  NewHost = "IP_VPS_BARU"
  NewUser = "root"
  NewPort = 22
  NewKeyPath = ""
  NewPassword = "PASSWORD_VPS_BARU"

  # Lokasi WAHA di server lama dan baru.
  OldWahaDir = "/opt/catatwang-waha"
  NewWahaDir = "/opt/catatwang-waha"

  # Opsi lokal.
  WorkingDir = "$env:TEMP\catatwang-waha-migration"
  VercelScope = "dhodhos-projects"

  # Kosongkan agar otomatis:
  # - pakai https://IP_VPS_BARU jika HTTPS aktif
  # - pakai http://IP_VPS_BARU:3001 jika -SkipHttps dipakai
  WahaBaseUrl = ""

  # Opsi boolean:
  SkipHttps = $false
  SkipVercelUpdate = $false
  SkipDeploy = $false
  SkipOldStop = $false
  KeepArtifacts = $false
}
