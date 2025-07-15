const forge = require('node-forge');
const fs = require('fs');

// 1. 生成CA私钥
const caKeys = forge.pki.rsa.generateKeyPair(2048);

// 2. 创建CA证书
const caCert = forge.pki.createCertificate();
caCert.publicKey = caKeys.publicKey;
caCert.serialNumber = '01';
caCert.validity.notBefore = new Date();
caCert.validity.notAfter = new Date();
caCert.validity.notAfter.setFullYear(caCert.validity.notBefore.getFullYear() + 10); // 10年有效期

// 3. 设置CA证书信息
const caAttrs = [
  { name: 'commonName', value: 'My Local CA' },
  { name: 'organizationName', value: 'Local Network' },
  { name: 'countryName', value: 'CN' },
];
caCert.setSubject(caAttrs);
caCert.setIssuer(caAttrs); // 自签名
caCert.setExtensions([
  {
    name: 'basicConstraints',
    critical: true,
    cA: true,
  },
  {
    name: 'keyUsage',
    critical: true,
    keyCertSign: true,
    digitalSignature: true,
    nonRepudiation: true,
  },
]);

// 4. 用CA私钥签名
caCert.sign(caKeys.privateKey, forge.md.sha256.create());

// 5. 导出CA证书和私钥（PEM格式）
const caCertPem = forge.pki.certificateToPem(caCert);
const caKeyPem = forge.pki.privateKeyToPem(caKeys.privateKey);

// 6. 保存到文件
fs.writeFileSync('ca.crt', caCertPem);
fs.writeFileSync('ca.key', caKeyPem);

console.log('CA证书已生成: ca.crt');
console.log('CA私钥已生成: ca.key');