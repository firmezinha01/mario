# 🚗 Meu Driver Pro - Base GigU / StopClub

Aplicativo completo de cálculo de rentabilidade em tempo real, simulação de overlay flutuante, histórico financeiro e personalização da marca para motoristas de app (**Uber, 99, inDrive, Lyft, DiDi**).

---

## 🚀 Como Subir para o GitHub e Vercel

### 1. Subir para o seu Repositório GitHub (`firmezinha01/mario`)

No terminal, dentro da pasta do projeto `app_customizado`:

```bash
git init
git add .
git commit -m "feat: initial commit gigu driver pro app"
git branch -M main
git remote add origin https://github.com/firmezinha01/mario.git
git push -u origin main
```

---

### 2. Como Fazer o Deploy Gratuito na Vercel

1. Acesse **[vercel.com](https://vercel.com)** e faça login com a sua conta GitHub.
2. Clique em **"Add New..."** ➔ **"Project"**.
3. Selecione o repositório **`mario`** e clique em **"Import"**.
4. A Vercel detectará automaticamente as configurações (já incluídas no `vercel.json` e `index.html`).
5. Clique em **"Deploy"**! Em menos de 30 segundos seu app estará online em um link seguro HTTPS (ex: `https://mario-firmezinha01.vercel.app`).

---

## 🗄️ Qual é o Melhor Banco de Dados? (Recomendação)

Para aplicações hospedadas na **Vercel**, a melhor opção disparada é o **[Supabase](https://supabase.com)** (PostgreSQL Serverless).

### Por que o Supabase é a melhor escolha?
1. **Integração Nativa com a Vercel:** Conexão com 1 clique no marketplace da Vercel.
2. **Plano Gratuito Generoso:** 500 MB de banco, 50.000 usuários ativos por mês e requisições ilimitadas.
3. **Autenticação Pronta:** Login com Google, Telefone/WhatsApp ou Email sem precisar criar backend do zero.
4. **Row Level Security (RLS):** Garante que nenhum motorista consiga ver as corridas de outro motorista.
5. **Realtime WebSockets:** Se o motorista estiver com o app aberto no celular e no computador, os dados sincronizam instantaneamente na tela.

### Como Configurar o Banco de Dados no Supabase:
1. Crie um projeto gratuito no [Supabase](https://supabase.com).
2. No menu lateral, acerte em **"SQL Editor"**.
3. Abra o arquivo [`supabase_schema.sql`](supabase_schema.sql) deste projeto, copie todo o conteúdo e cole no SQL Editor do Supabase.
4. Clique em **"Run"**. Todas as tabelas (`drivers`, `trips`, `vehicle_expenses`) e regras de segurança serão criadas automaticamente!
5. Copie sua `Project URL` e `anon key` em **Project Settings ➔ API** e cole no arquivo `js/supabase.js`.

---

## 💻 Como Rodar e Testar Localmente

```bash
# Iniciar servidor local
node server.js
```

* **No Computador:** `http://localhost:3000`
* **No Celular (Wi-Fi):** `http://192.168.15.4:3000`

---

## 📂 Arquitetura do Projeto

* `index.html`: Interface visual responsiva para celular e desktop.
* `css/style.css`: Estilização e fontes originais extraídas do GigU (`Gigu.ttf`, `NunitoSans`, `Lato`).
* `js/calculator.js`: Motor de cálculo matemático de R$/km, R$/hora, custo de combustível e veredito.
* `js/overlay.js`: Simulador do card flutuante sobreposto ao app da Uber/99.
* `js/settings.js`: Gerenciador de preferências locais e temas.
* `js/supabase.js`: Módulo de conexão e sincronização com banco de dados em nuvem.
* `supabase_schema.sql`: Script SQL pronto para criar as tabelas no Supabase.
* `vercel.json`: Configuração de roteamento e deploy na Vercel.
