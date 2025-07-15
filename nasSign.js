const forge = require('node-forge');
const fs = require('fs');

// 1. 读取CA证书和私钥
const caCertPem = fs.readFileSync('ca.crt', 'utf8');
const caKeyPem = fs.readFileSync('ca.key', 'utf8');
const caCert = forge.pki.certificateFromPem(caCertPem);
const caKey = forge.pki.privateKeyFromPem(caKeyPem);

// 2. 生成NAS的密钥对
const nasKeys = forge.pki.rsa.generateKeyPair(2048);

// 3. 创建NAS证书
const nasCert = forge.pki.createCertificate();
nasCert.publicKey = nasKeys.publicKey;
nasCert.serialNumber = '02';
nasCert.validity.notBefore = new Date();
nasCert.validity.notAfter = new Date();
nasCert.validity.notAfter.setFullYear(nasCert.validity.notBefore.getFullYear() + 2); // 2年有效期

// 4. 设置NAS证书信息
const nasAttrs = [
  { name: 'commonName', value: '192.168.1.194' }, // 可以是IP或域名（如 nas.local）
  { name: 'organizationName', value: 'My NAS' },
  { name: 'countryName', value: 'CN' },
];
nasCert.setSubject(nasAttrs);
nasCert.setIssuer(caCert.subject.attributes); // 由CA签发

// 5. 设置SAN（可选，支持多个IP/域名）
nasCert.setExtensions([
  {
    name: 'subjectAltName',
    altNames: [
      { type: 7, ip: '192.168.1.194' },    // IP
    ],
  },
]);

// 6. 用CA私钥签名
nasCert.sign(caKey, forge.md.sha256.create());

// 7. 导出NAS证书和私钥（PEM格式）
const nasCertPem = forge.pki.certificateToPem(nasCert);
const nasKeyPem = forge.pki.privateKeyToPem(nasKeys.privateKey);

// 8. 保存到文件
fs.writeFileSync('./stash/nas.crt', nasCertPem);
fs.writeFileSync('./stash/nas.key', nasKeyPem);

console.log('NAS证书已生成: nas.crt');
console.log('NAS私钥已生成: nas.key');