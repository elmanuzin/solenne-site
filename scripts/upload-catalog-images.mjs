/**
 * Script: upload-catalog-images.mjs
 * Faz upload das imagens para Supabase Storage e atualiza os produtos no banco.
 *
 * Uso: node scripts/upload-catalog-images.mjs
 * Requisito: SUPABASE_SERVICE_ROLE_KEY no .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, extname, basename } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Lê variáveis do .env.local
function loadEnv() {
    const envPath = join(ROOT, ".env.local");
    const content = readFileSync(envPath, "utf-8");
    const env = {};
    content.split("\n").forEach((line) => {
        const [key, ...rest] = line.split("=");
        if (key && rest.length) env[key.trim()] = rest.join("=").trim();
    });
    return env;
}

const env = loadEnv();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY || SERVICE_KEY.includes("xxxxx")) {
    console.error("❌ SUPABASE_SERVICE_ROLE_KEY não configurada no .env.local");
    console.error("   Adicione a chave service_role do painel Supabase > Settings > API");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Mapeamento: nome do produto → arquivos de imagem
const PRODUTOS_IMAGENS = {
    "Conjunto Amarelo": [
        "1-IMG_0001.JPEG","2-IMG_0002.JPEG","3-IMG_0003.JPEG",
        "4-IMG_0004.JPEG","5-IMG_0005.JPEG","6-IMG_0007.JPEG","7-IMG_0008.JPEG"
    ],
    "Vestido Longo Vermelho": [
        "8-IMG_0009.JPEG","9-IMG_0010.JPEG","10-IMG_0011.JPEG",
        "11-IMG_0012.JPEG","12-IMG_0013.JPEG","13-IMG_0014.JPEG"
    ],
    "Vestido Mini Vermelho": [
        "14-IMG_0023.JPEG","16-IMG_0025.JPEG","17-IMG_0026.JPEG","18-IMG_0027.JPEG"
    ],
    "Conjunto Preto Costas Abertas": [
        "20-IMG_0029.JPEG","21-IMG_0030.JPEG","22-IMG_0031.JPEG","23-IMG_0032.JPEG"
    ],
    "Body Amarelo Manga Única": [
        "24-IMG_0033.JPEG","25-IMG_0038.JPEG","26-IMG_0039.JPEG",
        "27-IMG_0040.JPEG","28-IMG_0041.JPEG","29-IMG_0042.JPEG","30-IMG_0043.JPEG"
    ],
    "Vestido Preto Longo Cut-outs": [
        "31-IMG_0044.JPEG","32-IMG_0045.JPEG","33-IMG_0046.JPEG",
        "34-IMG_0047.JPEG","35-IMG_0048.JPEG","36-IMG_0050.JPEG"
    ],
    "Vestido Preto Longo Alça": [
        "37-IMG_0065.JPEG","38-IMG_0066.JPEG","39-IMG_0067.JPEG","40-IMG_0068.JPEG"
    ],
    "Conjunto Azul Bebê": [
        "IMG_3815.JPG","IMG_3847.JPG"
    ],
    "Conjunto Lilás": [
        "IMG_3816.JPG","IMG_3817.JPG","IMG_3818.JPG"
    ],
    "Conjunto Paetê Prata": [
        "IMG_3835.JPG","IMG_3836.JPG","IMG_3840.JPG","IMG_3841.JPG","IMG_3842.JPG"
    ],
    "Body Preto Costas Abertas": [
        "IMG_3843.JPG","IMG_3844.JPG","IMG_3845.JPG","IMG_3846.JPG"
    ],
    "Conjunto Branco Cetim": [
        "IMG_4166 2.jpg","IMG_4167 2.jpg","IMG_4168 2.jpg",
        "IMG_4169 2.jpg","IMG_4170 2.jpg"
    ],
    "Vestido Preto Mini Choker": [
        "IMG_4175 2.jpg","IMG_4177 2.jpg","IMG_4178 2.jpg"
    ],
    "Body Preto Cut-out": [
        "IMG_4181 2.jpg","IMG_4182 2.jpg","IMG_4184 2.jpg"
    ],
    "Vestido Terracota Mini": [
        "IMG_4188 2.jpg","IMG_4189 2.jpg","IMG_4190 2.jpg",
        "IMG_4191 2.jpg","IMG_4192 2.jpg"
    ],
    "Saia Midi Azul Royal": [
        "IMG_4193 2.jpg","IMG_4194 2.jpg","IMG_4195 2.jpg",
        "IMG_4196 2.jpg","IMG_4197 2.jpg","IMG_4198 2.jpg","IMG_4199 2.jpg","IMG_4200 2.jpg"
    ],
    "Conjunto Azul Royal": [
        "IMG_4201 2.jpg","IMG_4202 2.jpg","IMG_4203 2.jpg",
        "IMG_4204 2.jpg","IMG_4208 2.jpg","IMG_4209 2.jpg","IMG_4210 2.jpg"
    ],
    "Vestido Azul Royal Mini": [
        "IMG_4211 2.jpg","IMG_4212 2.jpg","IMG_4213 2.jpg",
        "IMG_4215 2.jpg","IMG_4216 2.jpg","IMG_4217 2.jpg",
        "IMG_4218 3.jpg","IMG_4219 3.jpg","IMG_4220 3.jpg"
    ],
    "Cropped Preto Cold-shoulder": [
        "IMG_4221 3.jpg","IMG_4222 3.jpg","IMG_4223 3.jpg",
        "IMG_4224 3.jpg","IMG_4225 3.jpg","IMG_4226 2.jpg","IMG_4227 2.jpg"
    ],
    "Conjunto Cinza": [
        "IMG_4228 2.jpg","IMG_4229 2.jpg","IMG_4230 2.jpg",
        "IMG_4231 2.jpg","IMG_4232 2.jpg","IMG_4233 2.jpg","IMG_4235 2.jpg"
    ],
    "Conjunto Paetê Azul Marinho": [
        "IMG_3674.jpg","IMG_3675.jpg","IMG_3676.jpg",
        "IMG_3677.jpg","IMG_3678.jpg","IMG_3679.jpg","IMG_3680.jpg"
    ],
};

const ASSETS_DIR = join(ROOT, "assets-produtos");
const HEIC_DIR = join(ROOT, "assets-heic-converted");

function slugify(name) {
    return name
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

function getContentType(filename) {
    const ext = extname(filename).toLowerCase();
    if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
    if (ext === ".png") return "image/png";
    return "image/jpeg";
}

async function uploadImage(productId, productSlug, filename, index) {
    // Tenta na pasta principal, depois na pasta HEIC convertida
    let filePath = join(ASSETS_DIR, filename);
    if (!existsSync(filePath)) {
        filePath = join(HEIC_DIR, filename);
        if (!existsSync(filePath)) {
            console.log(`  ⚠️  Arquivo não encontrado: ${filename}`);
            return null;
        }
    }

    const fileBuffer = readFileSync(filePath);
    const storagePath = `${productId}/${slugify(productSlug)}-${index + 1}.jpg`;

    const { data, error } = await supabase.storage
        .from("produtos")
        .upload(storagePath, fileBuffer, {
            contentType: "image/jpeg",
            upsert: true,
        });

    if (error) {
        console.log(`  ❌ Erro upload ${filename}: ${error.message}`);
        return null;
    }

    const { data: urlData } = supabase.storage
        .from("produtos")
        .getPublicUrl(storagePath);

    return urlData.publicUrl;
}

async function main() {
    console.log("🚀 Iniciando upload de imagens do catálogo Solenne...\n");

    // Busca produtos inseridos
    const { data: produtos, error } = await supabase
        .from("produtos")
        .select("id, nome")
        .in("nome", Object.keys(PRODUTOS_IMAGENS));

    if (error) {
        console.error("❌ Erro ao buscar produtos:", error.message);
        process.exit(1);
    }

    console.log(`📦 ${produtos.length} produtos encontrados no banco\n`);

    for (const produto of produtos) {
        const arquivos = PRODUTOS_IMAGENS[produto.nome] || [];
        if (!arquivos.length) {
            console.log(`⏭️  ${produto.nome}: sem imagens mapeadas`);
            continue;
        }

        console.log(`📸 ${produto.nome} (${arquivos.length} imagens)...`);

        const urls = [];
        for (let i = 0; i < arquivos.length; i++) {
            const url = await uploadImage(produto.id, produto.nome, arquivos[i], i);
            if (url) urls.push(url);
        }

        if (urls.length === 0) {
            console.log(`  ⚠️  Nenhuma imagem carregada\n`);
            continue;
        }

        // Atualiza imagem principal no produto
        const { error: updateError } = await supabase
            .from("produtos")
            .update({ imagem: urls[0] })
            .eq("id", produto.id);

        if (updateError) {
            console.log(`  ❌ Erro ao atualizar produto: ${updateError.message}`);
        } else {
            console.log(`  ✅ ${urls.length} imagens enviadas. Principal: ${urls[0]}\n`);
        }

        // Adiciona imagens extras na tabela product_images
        if (urls.length > 1) {
            const imageRows = urls.map((url, i) => ({
                product_id: produto.id,
                image_url: url,
                sort_order: i,
            }));

            // Tenta inserir (ignora se tabela não existir)
            await supabase.from("product_images").upsert(imageRows).then(() => {});
        }
    }

    console.log("✅ Upload concluído!");
    console.log("\n📋 Acesse o site para verificar o catálogo:");
    console.log("   http://localhost:3000/catalogo");
}

main().catch(console.error);
