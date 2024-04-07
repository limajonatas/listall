# CountAll (countall)

A Quasar Project

## Install the dependencies
```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```


### Lint the files
```bash
yarn lint
# or
npm run lint
```


### Format the files
```bash
yarn format
# or
npm run format
```

## Configurando as variáveis de ambiente no Windows

1. Pressione a tecla Windows e digite "Variáveis de ambiente" e clique em "Editar as variáveis de ambiente do sistema".
2. Na janela que se abre, clique em "Variáveis de ambiente...".
3. Na seção "Variáveis de usuário", clique em "Novo..." para adicionar uma nova variável de ambiente.
4. Digite o nome da variável (por exemplo, `ANDROID_HOME`) e o valor (o caminho para o diretório onde o Android SDK está instalado).
5. Repita os passos 3 e 4 para cada variável de ambiente que você precisa adicionar (`ANDROID_SDK_ROOT`, `JAVA_HOME`, `GRADLE_HOME`, etc.).

## Gerando a versão de depuração

Para gerar a versão de depuração (DEBUG) do seu aplicativo, você pode usar o seguinte comando:

```bash
quasar build -m cordova -T android -d
# or
cordova build android
```
(na pasta src-cordova)


### Build the app for production
```bash
quasar build
```

### Customize the configuration
See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).


