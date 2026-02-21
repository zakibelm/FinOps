## Security Policy

### Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

### Reporting a Vulnerability

If you discover a security vulnerability within FinOps, please send an email to **zakibelm@gmail.com**. All security vulnerabilities will be promptly addressed.

### Security Measures

- **Data Encryption**: All data is encrypted at rest (AES-256) and in transit (TLS 1.3)
- **API Keys**: Never commit API keys. Use environment variables
- **Authentication**: JWT tokens with secure refresh mechanism
- **Multi-tenancy**: Complete isolation between CPA accounts

### Best Practices

1. **Never commit `.env` files** - They are automatically ignored by `.gitignore`
2. **Rotate API keys regularly** - Especially for production deployments
3. **Use strong JWT secrets** - Minimum 256 bits entropy
4. **Enable MFA** - For production deployments

### Known Issues

None at this time. Check [Security Advisories](https://github.com/zakibelm/FinOps/security/advisories) for updates.
