# Build Android Assinado — ListAll

> Guia pessoal para gerar o build Android assinado e publicar na Play Store.

---

## ✅ Pré-requisitos (configurar uma vez só)

### JDK 17

- Caminho: `C:\Program Files\Java\jdk-17`
- `JAVA_HOME` deve apontar para essa pasta
- Verificar: `java -version` → deve mostrar **Java 17**

> ⚠️ Se mostrar Java 11, ajuste a variável `JAVA_HOME`:
>
> ```powershell
> [System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-17", "User")
> ```
>
> Feche e reabra o terminal.

### Android Studio — SDKs necessários

| Componente   | Versão                      | Onde instalar                                  |
| ------------ | --------------------------- | ---------------------------------------------- |
| SDK Platform | **Android 16 (API 36)**     | SDK Manager → SDK Platforms                    |
| Build Tools  | **36.0.0** (exato, não 37!) | SDK Manager → SDK Tools → Show Package Details |

---

## 🚀 Gerar o Build

### Passo 1 — Instalar dependências (só se for a primeira vez ou após `git clone`)

```powershell
# Raiz do projeto
cd d:\Download\listall
npm install

# Pasta do Cordova — obrigatório!
cd src-cordova
npm install
cd ..
```

### Passo 2 — Incrementar a versão (obrigatório para updates na Play Store)

Editar `src-cordova/config.xml`, atributo `version`:

```xml
<widget id="com.listall" version="0.4.0" ...>
```

> O `versionCode` (número inteiro que a Play Store usa) é gerado automaticamente a partir dessa string.

### Passo 3 — Gerar o build

```powershell
cd d:\Download\listall
npx quasar build -m cordova -T android
```

Arquivo gerado:

```
src-cordova\platforms\android\app\build\outputs\bundle\release\app-release.aab
```

---

## 🔏 Assinar no Android Studio

1. Abra o Android Studio
2. **Open** → `d:\Download\listall\src-cordova\platforms\android`
3. Aguarde o Gradle sync
4. Menu → **Build → Generate Signed Bundle / APK**
5. Escolha **Android App Bundle** (`.aab`)
6. Selecione a keystore existente e preencha as senhas
7. Variant: **release** → **Finish**

---

## 🗝️ Keystore

| Info    | Valor                  |
| ------- | ---------------------- |
| Arquivo | `listall-keystore.jks` |
| Alias   | `listall-key`          |

> ⚠️ Guarde o arquivo `.jks` e as senhas em local seguro. Sem eles não é possível publicar updates.

---

## 🔄 Fluxo resumido para cada update

```
1. Incrementar version no src-cordova/config.xml
2. npx quasar build -m cordova -T android
3. Android Studio → Build → Generate Signed Bundle
4. Upload do .aab na Play Store
```

---

## 🆔 Identidade do app (nunca mudar!)

| O que identifica  | Onde fica                                     | Valor          |
| ----------------- | --------------------------------------------- | -------------- |
| **applicationId** | `src-cordova/config.xml` → `id` do `<widget>` | `com.listall`  |
| **Keystore**      | arquivo `.jks`                                | sempre a mesma |
