# ListAll (list-all)

Um aplicativo Quasar para gerenciamento de listas 3 em 1.

---

## Instalação das dependências

```bash
yarn
# ou
npm install
```

## Desenvolvimento

### Iniciar o aplicativo em modo de desenvolvimento

> Recarregamento de código em tempo real, relatório de erros, etc.

```bash
quasar dev
```

### Lint nos arquivos

```bash
yarn lint
# ou
npm run lint
```

### Formatar os arquivos

```bash
yarn format
# ou
npm run format
```

---

## Configurando variáveis de ambiente no Windows

1. Pressione a tecla Windows, digite **"Variáveis de ambiente"** e clique em **"Editar as variáveis de ambiente do sistema"**.
2. Na janela que se abre, clique em **"Variáveis de ambiente..."**.
3. Na seção **"Variáveis de usuário"**, clique em **"Novo..."** para adicionar uma nova variável.
4. Digite o nome (ex: `ANDROID_HOME`) e o valor (caminho para o diretório do Android SDK).
5. Repita os passos 3 e 4 para cada variável necessária (`ANDROID_SDK_ROOT`, `JAVA_HOME`).
6. Adicione ao PATH do sistema o diretório do `gradle` (pasta `bin`), assim como `%ANDROID_SDK_ROOT%\platform-tools` e `%ANDROID_SDK_ROOT%\tools`, se necessário.

---

## Build

### Gerar a versão de depuração (DEBUG)

```bash
quasar build -m cordova -T android -d
# ou (na pasta src-cordova)
cordova build android
```

### Compilar para produção

```bash
quasar build
```

### Personalizar a configuração

Veja [Configurando quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).

---

## Progresso do Aplicativo

### Versão 0.3.0-alpha (atual)

- Refatoração do formulário de criação/edição de itens como dialog
- Dialog de detalhes do item
- Lógica de duplicação de item

### Versão 0.1.0

- Editar item da lista
- Configurações
- Contato para feedback

---

## Download do APK DEBUG

Baixe a versão DEBUG do APK [aqui](https://github.com/limajonatas/listall/tree/release/v.0.1.0/dist/cordova/android/apk/debug/app-debug.apk).
