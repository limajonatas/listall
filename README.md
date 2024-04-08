<!DOCTYPE html>
<html lang="pt-BR">
<body>

<h1>CountAll (countall)</h1>
<p>A Quasar Project</p>

<h2>Instalar as dependências</h2>
<pre><code>yarn
# ou
npm install
</code></pre>

<h3>Iniciar o aplicativo em modo de desenvolvimento (recarregamento de código em tempo real, relatório de erros, etc.)</h3>
<pre><code>quasar dev
</code></pre>

<h3>Lint nos arquivos</h3>
<pre><code>yarn lint
# ou
npm run lint
</code></pre>

<h3>Formatar os arquivos</h3>
<pre><code>yarn format
# ou
npm run format
</code></pre>

<h2>Configurando as variáveis de ambiente no Windows</h2>
<ol>
  <li>Pressione a tecla Windows e digite "Variáveis de ambiente" e clique em "Editar as variáveis de ambiente do sistema".</li>
  <li>Na janela que se abre, clique em "Variáveis de ambiente...".</li>
  <li>Na seção "Variáveis de usuário", clique em "Novo..." para adicionar uma nova variável de ambiente.</li>
  <li>Digite o nome da variável (por exemplo, <code>ANDROID_HOME</code>) e o valor (o caminho para o diretório onde o Android SDK está instalado).</li>
  <li>Repita os passos 3 e 4 para cada variável de ambiente que você precisa adicionar (<code>ANDROID_SDK_ROOT</code>, <code>JAVA_HOME</code>).</li>
  <li>Adicionar ao path do sistema o diretorio do <code>grandle</code> (pasta bin) assim como <code>%ANDROID_SDK_ROOT%\platform-tools</code> e <code>%ANDROID_SDK_ROOT%\tools</code> se necessário </li>
</ol>

<h2>Gerando a versão de depuração</h2>
<p>Para gerar a versão de depuração (DEBUG) do seu aplicativo, você pode usar o seguinte comando:</p>
<pre><code>quasar build -m cordova -T android -d
# ou
cordova build android
</code></pre>
<p>(na pasta src-cordova)</p>

<h3>Compilar o aplicativo para produção</h3>
<pre><code>quasar build
</code></pre>

<h3>Personalizar a configuração</h3>
<p>Veja <a href="https://v2.quasar.dev/quasar-cli-vite/quasar-config-js">Configurando quasar.config.js</a>.</p>

<h2>Progresso do Aplicativo</h2>
<p>Últimas Atualizações (Versão 0.1.0 - Atual):</p>
<ul>
  <li>Editar item da lista</li>
  <li>Configurações</li>
  <li>Contato para dar feedback</li>
</ul>

<h2>Download do APK DEBUG</h2>
<p>Você pode baixar a versão DEBUG do APK <a href="https://github.com/limajonatas/listall/tree/release/v.0.1.0/dist/cordova/android/apk/debug/app-debug.apk" download>aqui</a>.</p>


</body>
</html>
