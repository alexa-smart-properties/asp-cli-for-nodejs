# Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
# Licensed under the Amazon Software License  http://aws.amazon.com/asl/

Write-Host "Sample calls for managing Enterprise Wifi"
Exit 

# Define the CA ID and output file paths
$csrFilePath = "csr.pem"
$signedCertFilePath = "signed_cert.pem"
$caCertFilePath = "ca_cert.pem"
$caKeyFilePath = "ca_key.pem"
//$caId = "amzn1.alexa.enterprise.certificateAuthority..."

$caId = asp-cli create-certificate-authority --friendlyname "My CA" --rotationperiod=6 --output "id"

asp-cli get-certificate-authority --certificateauthorityid=$caId

asp-cli update-certificate-authority --certificateauthorityid=$caId --friendlyname "My Updated CA" --rotationperiod=12

asp-cli get-certificate-authorities

asp-cli delete-certificate-authority --certificateauthorityid=$caId

$csr = asp-cli get-certificate-authority --certificateauthorityid=$caId --output "csr"

# Save the CSR to a file
$csr | Out-File -FilePath $csrFilePath -Encoding ascii

# Sign the CSR using OpenSSL
$opensslCommand = "openssl x509 -req -in $csrFilePath -CA $caCertFilePath -CAkey $caKeyFilePath -CAcreateserial -out $signedCertFilePath -days 365 -sha256"
Invoke-Expression $opensslCommand

# Output the signed certificate
$signedCert = Get-Content -Path $signedCertFilePath
Write-Output "Signed Certificate:"
Write-Output $signedCert

# Cert Chain. Only contains the CA cert for this sample
$certChain = Get-Content -Path $caCertFilePath 
Write-Output "Cert Chain:"
Write-Output $certChain

$signedCertEscaped = [Convert]::ToBase64String($signedCert)
$certChainEscaped = [Convert]::ToBase64String($certChain)

# Correctly expand variables and ensure proper spacing
asp-cli import-certificate --certificateauthorityid=$caId --certificate "$signedCertEscaped" --certificatechain "$certChainEscaped" --nocall

# Define the file paths
$caCertFilePath = "ca_cert.pem"
$caKeyFilePath = "ca_key.pem"
$csrFilePath = "csr.pem"
$signedCertFilePath = "signed_cert.pem"

# Generate a CA private key
$opensslCommand = "openssl genpkey -algorithm RSA -out $caKeyFilePath -pkeyopt rsa_keygen_bits:2048"
Invoke-Expression $opensslCommand

# Generate a self-signed CA certificate
$opensslCommand = "openssl req -x509 -new -nodes -key $caKeyFilePath -sha256 -days 365 -out $caCertFilePath -subj '...'"
Invoke-Expression $opensslCommand

# Generate a private key for the CSR
$opensslCommand = "openssl genpkey -algorithm RSA -out csr_key.pem -pkeyopt rsa_keygen_bits:2048"
Invoke-Expression $opensslCommand

# Generate a CSR
$opensslCommand = "openssl req -new -key csr_key.pem -out $csrFilePath -subj '...'"
Invoke-Expression $opensslCommand

# Sign the CSR using the CA certificate and private key
$opensslCommand = "openssl x509 -req -in $csrFilePath -CA $caCertFilePath -CAkey $caKeyFilePath -CAcreateserial -out $signedCertFilePath -days 365 -sha256"
Invoke-Expression $opensslCommand

# Output the signed certificate
$signedCert = Get-Content -Path $signedCertFilePath -Raw
Write-Output "Signed Certificate:"
Write-Output $signedCert


