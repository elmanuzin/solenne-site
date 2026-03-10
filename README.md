# Solenne 💋  
### Elegant Fashion Store powered by WhatsApp Commerce

[![Next.js](https://img.shields.io/badge/Next.js-14-black)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)]()
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green)]()
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-black)]()
[![License](https://img.shields.io/badge/license-private-red)]()

Solenne is a **WhatsApp-first fashion ecommerce platform** designed for fast purchasing and high conversion rates.

Customers browse products on the website and finalize purchases directly via **WhatsApp conversation with the store**.

The platform focuses on:

- simple purchase flow  
- mobile-first experience  
- high conversion optimization  
- fast product management  

---

# 🌐 Live Store

Production:


https://usesolenne.shop


---

# 🖼 Preview

Homepage Hero

![Solenne Preview](docs/preview-home.png)

Product Page

![Product Preview](docs/preview-product.png)

Admin Panel

![Admin Preview](docs/preview-admin.png)

*(optional: add screenshots later in /docs folder)*

---

# 🚀 Core Features

## Product Catalog

- product filtering
- search by name
- filter by size
- filter by color
- price sorting
- category navigation

---

## WhatsApp Checkout

Instead of a traditional checkout, purchases happen via WhatsApp.

Generated message example:


Olá! Vi este produto no site Solenne.

Produto: Vestido Maia
Tamanho: P
Cor: Preto

Você pode confirmar se está disponível?

Link do produto:
https://usesolenne.shop/produto/vestido-maia


This drastically reduces checkout friction.

---

# 📈 Conversion Optimization

Solenne includes several CRO features used in large fashion stores:

### Hero Banner Clickable
Entire banner links to catalog.

### Scarcity Signals


🔥 Alta procura hoje
Restam apenas X unidades


### Social Proof


Mais de 120 clientes satisfeitas


### Sticky Mobile CTA

Mobile users see:


Comprar no WhatsApp


### Product Badges


🔥 Mais vendido
✨ Novo
💋 Destaque


### Most Loved Section

Homepage automatically shows best sellers.

---

# 🧠 Analytics Events

Events tracked for performance analysis:


banner_click
product_view
add_to_cart
whatsapp_click


These allow conversion tracking like:


conversion_rate = whatsapp_click / product_view


---

# 💋 Loyalty System

Customers earn **kiss stamps 💋**.

Database structure:


clientes
fidelidade
selos_fidelidade
selos_indicacao


This allows campaigns such as:

- loyalty rewards
- referral bonuses
- returning customer discounts

---

# ⚙ Admin Panel

Admin dashboard allows:

- add products
- edit products
- upload product images
- import products via CSV
- manage customers
- manage banner
- mark products as:


destaque
novidade
mais_vendido


---

# 🏗 Architecture


Frontend
│
├── Next.js (App Router)
├── React
├── TailwindCSS
│
Backend
│
├── Supabase
│ ├── PostgreSQL
│ ├── Auth
│ ├── Storage
│
Infrastructure
│
├── Vercel (hosting)
├── GitHub (version control)


---

# 🗄 Database Schema

Main tables:


produtos
produto_tamanhos
product_views
clientes
fidelidade
pedidos
admins
site_config


---

## Entity Diagram


clientes
│
└── fidelidade

produtos
│
├── produto_tamanhos
└── product_views

pedidos
│
├── produto_id
└── cliente_id


---

# 📂 Project Structure


app/
components/
context/
lib/
services/
types/
docs/


---

# ⚡ Installation

Clone repository


git clone https://github.com/your-repo/solenne-site.git


Enter project


cd solenne-site


Install dependencies


npm install


Run development server


npm run dev


Open


http://localhost:3000


---

# 🚀 Deployment

Deployment runs automatically through **Vercel**.

Push changes:


git add .
git commit -m "update"
git push origin main


Vercel builds and deploys automatically.

---

# 🔒 Security

Security measures include:

- admin route protection
- safe Supabase queries
- upload validation
- sanitized WhatsApp messages

---

# 🛣 Product Roadmap

Upcoming features:

### Phase 1
- coupon system
- WhatsApp capture popup
- abandoned cart recovery

### Phase 2
- AI product recommendations
- complete look suggestions
- product ranking

### Phase 3
- SEO automation
- influencer tracking
- automated marketing campaigns

---

# 👩‍💻 Development

Built for **Solenne Fashion**.

Elegant fashion pieces designed for confidence and individuality.


Peças únicas para brilhar sem medo ✨


---
