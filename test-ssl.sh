#!/bin/bash
# =============================================================================
# Test SSL Certificate Installation
# Usage:  sudo bash test-ssl.sh
# =============================================================================

set -euo pipefail

CLOUDFLARE_CERT="/etc/ssl/certs/cloudflare-origin.pem"
CLOUDFLARE_KEY="/etc/ssl/private/cloudflare-origin.key"

echo "=========================================="
echo "  SSL CERTIFICATE TEST"
echo "=========================================="
echo ""

# Create directories
mkdir -p /etc/ssl/certs /etc/ssl/private

# Write certificate
cat > "$CLOUDFLARE_CERT" <<'EOF'
-----BEGIN CERTIFICATE-----
MIIEsDCCA5igAwIBAgIUNH4N5HeWnY0DapUa1yAMNqwLCKYwDQYJKoZIhvcNAQEL
BQAwgYsxCzAJBgNVBAYTAlVTMRkwFwYDVQQKExBDbG91ZEZsYXJlLCBJbmMuMTQw
MgYDVQQLEytDbG91ZEZsYXJlIE9yaWdpbiBTU0wgQ2VydGlmaWNhdGUgQXV0aG9y
aXR5MRYwFAYDVQQHEw1TYW4gRnJhbmNpc2NvMRMwEQYDVQQIEwpDYWxpZm9ybmlh
MB4XDTI2MDQyNDExNDEwMFoXDTQxMDQyMDExNDEwMFowYjEZMBcGA1UEChMQQ2xv
dWRGbGFyZSwgSW5jLjEdMBsGA1UECxMUQ2xvdWRGbGFyZSBPcmlnaW4gQ0ExJjAk
BgNVBAMTHUNsb3VkRmxhcmUgT3JpZ2luIENlcnRpZmljYXRlMIIBIjANBgkqhkiG
9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtAkfv2TWYUTeQV1W2ReEt4Gnj+MQX0EK858j
imUCHNWjKIiQMnMzcadxvReE/1zmGNRKgXE8uYvJjO2Bwtu9KcQsyuazP5Vpv1kN
W1eOn+i4AxTrw97dJXZanVCcR1DJT9YBAUDCJsJzDKqBxWB5BYwsbaR7TKhDRXyV
w2yhCc0iqlGakODHL9jUxGpCMWCssW10Rv4q1v5L1yWxi4i/a1jFnMPPM8vUNUOZ
ktL4nt05RlIl5lg4SED8Vb3CJfFGD0ObtpdVDRVnnh1c9hSI3apRCE5orR4RoXBF
e033CiMI1JH5iKGUdMgDt1V65pc1cdI8UqvPPUNMjiOKm5T8awIDAQABo4IBMjCC
AS4wDgYDVR0PAQH/BAQDAgWgMB0GA1UdJQQWMBQGCCsGAQUFBwMCBggrBgEFBQcD
ATAMBgNVHRMBAf8EAjAAMB0GA1UdDgQWBBRhRlo3wLr7McMq8J7g0azXp6VX2TAf
BgNVHSMEGDAWgBQk6FNXXXw0QIep65TbuuEWePwppDBABggrBgEFBQcBAQQ0MDIw
MAYIKwYBBQUHMAGGJGh0dHA6Ly9vY3NwLmNsb3VkZmxhcmUuY29tL29yaWdpbl9j
YTAzBgNVHREELDAqghQqLmFldGhlcmhvbGRpbmdzLm9yZ4ISYWV0aGVyaG9sZGlu
Z3Mub3JnMDgGA1UdHwQxMC8wLaAroCmGJ2h0dHA6Ly9jcmwuY2xvdWRmbGFyZS5j
b20vb3JpZ2luX2NhLmNybDANBgkqhkiG9w0BAQsFAAOCAQEAJ3nA0inxiBx/JXvU
L8YbhcqWQfM2kDkqcPMjIcLYKrZieqRMyDHEvCJtvc/GxFfs61vop8DBa8i0qiFV
xCcbNR7kY2gbCfoFkw91b/qhLr8Iv1JwgAI2C7fzNb+FZSgvyiJAOUVZun0O/2Mg
hQe+lgb5lXfNd8gLM735yNj/TfU6B5/WQ/drJoO2S0CaI7YjYRiNq0aBQ5frJU6v
yGzC5lnq7Raa+3SeXxs4TaxKCYXjUbCa7gGbsHgC+rt0jx/ZLVu/JpH0PaHLjB0E
zpH9mzTo163DcGi0Ia0KIPihPtWHTvfjZz3egoHyZnLkUo1h7ACnRQAq9h4VqHdx
SRX49Q==
-----END CERTIFICATE-----
EOF

# Write private key
cat > "$CLOUDFLARE_KEY" <<'EOF'
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC0CR+/ZNZhRN5B
XVbZF4S3gaeP4xBfQQrznyOKZQIc1aMoiJAyczNxp3G9F4T/XOYY1EqBcTy5i8mM
7YHC270pxCzK5rM/lWm/WQ1bV46f6LgDFOvD3t0ldlqdUJxHUMlP1gEBQMImwnMM
qoHFYHkFjCxtpHtMqENFfJXDbKEJzSKqUZqQ4Mcv2NTEakIxYKyxbXRG/irW/kvX
JbGLiL9rWMWcw88zy9Q1Q5mS0vie3TlGUiXmWDhIQPxVvcIl8UYPQ5u2l1UNFWee
HVz2FIjdqlEITmitHhGhcEV7TfcKIwjUkfmIoZR0yAO3VXrmlzVx0jxSq889Q0yO
I4qblPxrAgMBAAECggEAB754uh/ZRNfUg5VDPhVP5SDTl1HaC27dzLrkqXhMzfa2
jPDK2xCvfs0IDG0tkFprn1fKWKUJSqXjpoc01K/lBB3nG1cvEKYZpVxsQaiTfvdg
qulEduloM8tSfH/SKRMlhaSb6HTjpQ0qK7pN2LKcogt0gcbYcuSt+BgyzPQoPSae
LX695PldFVq1VXYHnoYo2HWh3bp63SFvoWVMKbWHrXG8mMYJB3jBxns0Wq+d4OsI
DL+ZhyPiFSZoV7z0+wAZb6lqM6AuaefDg3JfVQKdL4m/IdtuIucFjpOsKbnP7ECh
ZK8CsBDGWXUBfaowLWb0K6if1o0oDUiH56Z1F9ODSQKBgQDtsqvgyikqlCQUk3jn
RAFXQAtbqgCaIC0ey5Pw6VyA5aWMdZ/lrscObAkzzC6uCA/9jqo/8ykq3mwRQGu0
m/2n6YL63LVBJvcFGS0TIeH0tZxAF+TSIovWs+iFI8sGSKQ2rfUEfSUmOE7N6gwP
5YxHR6bvVfiEEGGTDXJmPgLFtQKBgQDB5dr/RgNA0pNcMQAmemyPDXI7LhPCsj/O
nZoltP+2CJ0m8a9q+NLk6b2i5xB9CDwG+bVQOVgrj2ItdDE0UdKFvZquYOLkNuzx
5JMLULTJLVQFiGGY30jnJP7rtsagp0qLj6V1uBQMrsYiCOOKdlw/BdzicsHE0uyy
IWWcB8oNnwKBgHj8rrvWaqm/ibXncmzUkpIkiSN5HqFUq2K3YHAJeAor2d3qqR6x
naRbnTt+PGxcsjbvfPzb+iJV4E/PqILfu3bSRtcFrESjXqx7qhPI9UgngIanItNK
vj7kh//svhROuTcTyFkmkdgoZQQuk0EsKADIGdJMwhgGdoPxHj+oZKTZAoGABT+h
k/NjNyf8ESzKYkBCHAUzKGLw6f5FN+SQPaEOovDMwDcelnixzLx/A5/ZlGjapx2v
SMKknlk9QRm6Ez57wl8Fht7chWzvMQUM7et7WU6+zX+JlMfGg2s+80Z5TfP5UpnK
0sru0AETH+y5rA/UI2iXOBH/KMLE4XWB+J1FXOUCgYEA4ttDL1D3UVvmEn1RQBlu
kHWNc6e6xUXXxl60+QZHg7okPuWi6T0nPeFOR+FwZ+WmUSMCL4ydpQfza12+oLiz
UjEYImesxD6RoeuPa/zU/T5CYUeDYgDsyGZDcuu7GAApD0KjRvplSprTfGGtW0Qo
DmaCQbgEMpkMlL3/h2+W2IU=
-----END PRIVATE KEY-----
EOF

chmod 644 "$CLOUDFLARE_CERT"
chmod 600 "$CLOUDFLARE_KEY"

echo "✓ Certificate files created"
echo ""

# Test certificate validity
echo "Testing certificate..."
if openssl x509 -in "$CLOUDFLARE_CERT" -text -noout > /dev/null 2>&1; then
    echo "✓ Certificate is valid"
    echo ""
    echo "Certificate details:"
    openssl x509 -in "$CLOUDFLARE_CERT" -subject -issuer -dates -noout
else
    echo "✗ Certificate is INVALID"
    exit 1
fi

echo ""

# Test private key validity
echo "Testing private key..."
if openssl rsa -in "$CLOUDFLARE_KEY" -check -noout > /dev/null 2>&1; then
    echo "✓ Private key is valid"
else
    echo "✗ Private key is INVALID"
    exit 1
fi

echo ""

# Test if certificate and key match
CERT_MODULUS=$(openssl x509 -noout -modulus -in "$CLOUDFLARE_CERT" | openssl md5)
KEY_MODULUS=$(openssl rsa -noout -modulus -in "$CLOUDFLARE_KEY" | openssl md5)

if [ "$CERT_MODULUS" = "$KEY_MODULUS" ]; then
    echo "✓ Certificate and private key MATCH"
else
    echo "✗ Certificate and private key DO NOT MATCH"
    exit 1
fi

echo ""
echo "=========================================="
echo "✓ ALL SSL TESTS PASSED"
echo "=========================================="
echo ""
echo "You can now run: sudo bash deploy.sh"
echo ""
