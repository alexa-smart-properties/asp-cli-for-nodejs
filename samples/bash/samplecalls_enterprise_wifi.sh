#!/bin/bash
# Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
# Licensed under the Amazon Software License  http://aws.amazon.com/asl/

echo "Sample calls for managing Enterprise Wifi"
exit 

# Define the CA ID and output file paths
csrFilePath="csr.pem"
signedCertFilePath="signed_cert.pem"
caCertFilePath="ca_cert.pem"
caKeyFilePath="ca_key.pem"

# caId="amzn1.alexa.enterprise.certificateAuthority...."

# asp-cli create-certificate-authority --friendlyname "My CA" --rotationperiod=6
caId=$(asp-cli create-certificate-authority --friendlyname "My CA" --rotationperiod=6 --output "id")

asp-cli get-certificate-authority --certificateauthorityid="${caId}"

asp-cli update-certificate-authority --certificateauthorityid="${caId}" --friendlyname "My Updated CA" --rotationperiod=12

asp-cli get-certificate-authorities

asp-cli delete-certificate-authority --certificateauthorityid="${caId}"

csr=$(asp-cli get-certificate-authority --certificateauthorityid="${caId}" --output "csr")

# Save the CSR to a file
echo "$csr" > "${csrFilePath}"

# Sign the CSR using OpenSSL
openssl x509 -req -in "${csrFilePath}" -CA "${caCertFilePath}" -CAkey "${caKeyFilePath}" -CAcreateserial -out "${signedCertFilePath}" -days 365 -sha256

# Output the signed certificate
signedCert=$(cat "${signedCertFilePath}")
echo "Signed Certificate:"
echo "$signedCert"

# Cert Chain. Only contains the CA cert for this sample
certChain=$(cat "${caCertFilePath}")
echo "Cert Chain:"
echo "$certChain"

signedCertBase64=$(cat "${signedCertFilePath}" | base64 -w 0)
certChainBase64=$(cat "${caCertFilePath}" | base64 -w 0)

asp-cli import-certificate --certificateauthorityid="${caId}" --certificate-base64 "${signedCertBase64}" --certificatechain-base64 "${certChainBase64}" 

# Define the file paths
caCertFilePath="ca_cert.pem"
caKeyFilePath="ca_key.pem"
csrFilePath="csr.pem"
signedCertFilePath="signed_cert.pem"

# Generate a CA private key
openssl genpkey -algorithm RSA -out "${caKeyFilePath}" -pkeyopt rsa_keygen_bits:2048

# Generate a self-signed CA certificate
openssl req -x509 -new -nodes -key "${caKeyFilePath}" -sha256 -days 365 -out "${caCertFilePath}" -subj '...'

# Generate a private key for the CSR
openssl genpkey -algorithm RSA -out csr_key.pem -pkeyopt rsa_keygen_bits:2048

# Generate a CSR
openssl req -new -key csr_key.pem -out "${csrFilePath}" -subj '....'

# Sign the CSR using the CA certificate and private key
openssl x509 -req -in "${csrFilePath}" -CA "${caCertFilePath}" -CAkey "${caKeyFilePath}" -CAcreateserial -out "${signedCertFilePath}" -days 365 -sha256

# Output the signed certificate
signedCert=$(cat "${signedCertFilePath}")
echo "Signed Certificate:"
echo "$signedCert"


