/**
 * electron-builder afterPack 钩子
 * 用途：修复 asar 包中 package.json 被写成全 null 字节的已知 bug
 *
 * 原理：在 electron-builder 完成打包（写出 app.asar）之后，
 * 用 @electron/asar 解包 → 验证 package.json → 如果损坏则用源文件覆盖 → 重新打包
 */
const fs = require('fs')
const path = require('path')
const asar = require('@electron/asar')

exports.default = async function afterPack(context) {
  const appOutDir = context.appOutDir
  const resourcesDir = path.join(appOutDir, 'resources')
  const asarPath = path.join(resourcesDir, 'app.asar')

  if (!fs.existsSync(asarPath)) {
    console.log('[afterPack] app.asar 不存在，跳过检查')
    return
  }

  console.log('[afterPack] 正在验证 asar 中的 package.json ...')

  // 从 asar 中提取 package.json
  let pkgContent
  try {
    pkgContent = asar.extractFile(asarPath, 'package.json')
  } catch (e) {
    console.error('[afterPack] 无法从 asar 提取 package.json:', e.message)
    return
  }

  // 检查是否损坏（全 null 字节或不是合法 JSON）
  const isCorrupted = pkgContent.every((byte) => byte === 0)
  let isValidJson = true
  if (!isCorrupted) {
    try {
      JSON.parse(pkgContent.toString('utf8'))
    } catch {
      isValidJson = false
    }
  }

  if (!isCorrupted && isValidJson) {
    console.log('[afterPack] ✅ package.json 验证通过，内容正常')
    return
  }

  console.warn('[afterPack] ⚠️ 检测到 package.json 已损坏！正在修复 ...')

  // 解包整个 asar
  const tmpDir = path.join(resourcesDir, '_asar_repair_tmp')
  asar.extractAll(asarPath, tmpDir)

  // 用项目根目录下的 package.json 覆盖损坏的文件
  const srcPkgPath = path.join(context.packager.projectDir, 'package.json')
  const destPkgPath = path.join(tmpDir, 'package.json')
  fs.copyFileSync(srcPkgPath, destPkgPath)

  // 重新打包 asar（保留 unpack 配置）
  const unpackedDir = asarPath + '.unpacked'
  const hasUnpacked = fs.existsSync(unpackedDir)

  // 读取 asar 的 unpack glob 模式
  let unpackGlob
  if (hasUnpacked) {
    // 通过读取 electron-builder 配置来获取 asarUnpack 模式
    unpackGlob = '**/*.{node,dll}'
  }

  // 删除旧 asar
  fs.unlinkSync(asarPath)

  // 重新打包
  if (unpackGlob) {
    await asar.createPackageWithOptions(tmpDir, asarPath, { unpack: unpackGlob })
  } else {
    await asar.createPackage(tmpDir, asarPath)
  }

  // 清理临时目录
  fs.rmSync(tmpDir, { recursive: true, force: true })

  // 验证修复结果
  const repairedContent = asar.extractFile(asarPath, 'package.json')
  try {
    JSON.parse(repairedContent.toString('utf8'))
    console.log('[afterPack] ✅ package.json 修复成功！')
  } catch {
    console.error('[afterPack] ❌ 修复后 package.json 仍然无效')
  }
}
