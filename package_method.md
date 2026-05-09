# Life Protocol APP 打包方法

## 打包工具选择

### 对比

| 工具 | 优点 | 缺点 |
|------|------|------|
| **Capacitor** | 轻量、原生体验、支持插件生态 | 需要额外配置 |
| Cordova | 成熟、插件多 | 较重、逐渐淘汰 |
| Tauri | 小体积、Rust后端 | 移动端支持不完善 |
| React Native | 性能好 | 需要原生开发基础 |

**最终选择：Capacitor**

---

## 打包流程

### 1. 安装依赖

```bash
cd frontend
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### 2. 初始化 Capacitor

```bash
npx cap init "Life Protocol" "com.lifeprotocol.app" --web-dir=dist
```

### 3. 构建前端

```bash
npm run build
```

### 4. 同步到 Android

```bash
npx cap sync android
```

### 5. 修改 Gradle 配置

**gradle-wrapper.properties** (使用 Gradle 8.9):
```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-8.9-bin.zip
```

**variables.gradle** (compileSdk 改为 35):
```groovy
compileSdkVersion = 35
```

**android/app/build.gradle** (添加 Kotlin 版本强制):
```groovy
configurations.all {
    resolutionStrategy {
        force 'org.jetbrains.kotlin:kotlin-stdlib:1.8.22'
        force 'org.jetbrains.kotlin:kotlin-stdlib-jdk7:1.8.22'
        force 'org.jetbrains.kotlin:kotlin-stdlib-jdk8:1.8.22'
    }
}
```

### 6. 构建 APK

**方式一：使用本地 Gradle（推荐）**

Gradle 本地路径：
```
C:\Users\18301\.gradle\wrapper\dists\gradle-8.9-bin\d3x0641q7zvyxj470aijz0e22\gradle-8.9\bin\gradle
```

```bash
cd android
"$HOME/.gradle/wrapper/dists/gradle-8.9-bin/d3x0641q7zvyxj470aijz0e22/gradle-8.9/bin/gradle" assembleDebug
```

**方式二：使用 gradlew（需确保 Gradle 下载完整）**

```bash
cd android
./gradlew assembleDebug
```

---

## 遇到的问题及解决方法

### 问题1：Gradle 缓存被 Windows Defender 锁定

**现象**：
```
Failed to create Jar file C:\Users\xxx\.gradle\caches\jars-9\xxx\init.jar
```

**原因**：Windows Defender 实时保护锁定 Gradle 缓存文件

**解决**：
```bash
# 添加排除项
powershell.exe -Command "Add-MpPreference -ExclusionPath '$env:USERPROFILE\.gradle\caches\jars-9'"

# 或使用临时 Gradle 目录
GRADLE_USER_HOME=/tmp/gradle-home ./gradlew assembleDebug --no-daemon
```

---

### 问题2：compileSdk 34 不支持 Android 15 API

**现象**：
```
错误: 找不到符号 VANILLA_ICE_CREAM
```

**原因**：Capacitor 源码使用了 Android 15 (API 35) 的新 API，但项目配置的是 compileSdk 34

**解决**：修改 `variables.gradle`:
```groovy
compileSdkVersion = 35
```

---

### 问题3：Kotlin stdlib 版本冲突

**现象**：
```
Duplicate class kotlin.stdx.jdk8.PlatformThreadLocalRandom
```

**原因**：不同 Kotlin 版本依赖冲突

**解决**：在 `android/app/build.gradle` 添加:
```groovy
configurations.all {
    resolutionStrategy {
        force 'org.jetbrains.kotlin:kotlin-stdlib:1.8.22'
        force 'org.jetbrains.kotlin:kotlin-stdlib-jdk7:1.8.22'
        force 'org.jetbrains.kotlin:kotlin-stdlib-jdk8:1.8.22'
    }
}
```

---

### 问题4：图标导致 APP 闪退

**现象**：安装后立即闪退

**原因**：
1. adaptive icon 配置错误
2. mipmap 目录图标尺寸错误（生成 48x48, 72x72 等正确尺寸后反而闪退）

**解决**：
1. 删除 `mipmap-anydpi-v26/` 中的 adaptive icon 文件
2. 直接使用原始 1254x1254 图片作为图标

```bash
# 恢复原始图标
cp image.png android/app/src/main/res/mipmap-hdpi/ic_launcher.png
# ... 对所有密度重复此操作
```

**重要教训**：不要过度优化图标尺寸，Android 对大图的缩放处理比小尺寸错误图标更稳定。

---

### 问题5：设置按钮点击后 APP 卡死

**现象**：点击"设置"按钮后整个 APP 卡死

**原因**：Zustand store 使用不当导致无限循环重渲染

**错误代码**：
```tsx
const { player, fetchStatus } = usePlayerStore()  // 每次返回新引用
const { hasKey, loadConfig } = useConfigStore()   // hasKey是函数，每次都不同
useEffect(..., [hasKey])  // 无限触发
```

**解决**：使用 selector 语法：
```tsx
const player = usePlayerStore(s => s.player)
const fetchStatus = usePlayerStore(s => s.fetchStatus)
const config = useConfigStore(s => s.config)
const loadConfig = useConfigStore(s => s.loadConfig)
```

---

### 问题6：useApi.ts 调用不存在的后端

**现象**：APP 无故卡顿

**原因**：`useApi.ts` 中调用不存在的 `/api` 后端，导致请求超时

**解决**：移除 `useApi.ts` 中所有 API 调用，改为纯 localStorage 管理

---

## APK 输出位置

```
frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 数据存储说明

### 当前存储方式
- 使用 **localStorage** 存储玩家数据和 AI 配置
- 路径：`/data/data/com.lifeprotocol.app/app_webview/Local Storage/`

### 数据持久性
| 操作 | 数据是否丢失 |
|------|-------------|
| 手机重启 | ❌ 不丢失 |
| APP 更新 | ❌ 不丢失 |
| 清除缓存 | ⚠️ 可能丢失 |
| 卸载 APP | ❌ 丢失 |

---

## 常用命令

```bash
# 重新打包完整流程（推荐使用本地 Gradle）
cd frontend
npm run build
npx cap sync android
cd android
"$HOME/.gradle/wrapper/dists/gradle-8.9-bin/d3x0641q7zvyxj470aijz0e22/gradle-8.9/bin/gradle" assembleDebug

# 带清理的重新打包
cd android
"$HOME/.gradle/wrapper/dists/gradle-8.9-bin/d3x0641q7zvyxj470aijz0e22/gradle-8.9/bin/gradle" clean assembleDebug
```