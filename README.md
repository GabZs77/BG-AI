# BG-AI

Primeira versão experimental da assistente da BG SCRIPTS.

## Tecnologias
- Vite
- Transformers.js
- ONNX Runtime Web
- Qwen2.5-0.5B-Instruct (ONNX, hospedado no Hugging Face)

## Executar localmente
```bash
npm install
npm run dev
```

## Gerar versão de produção
```bash
npm run build
```
A pasta `dist/` será criada pelo Vite.

## Publicar no Vercel
Importe este repositório no Vercel e use:
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

## Modelo
O projeto usa `onnx-community/Qwen2.5-0.5B-Instruct` via Transformers.js. O modelo é baixado pelo navegador na primeira utilização e armazenado em cache pelo navegador quando possível. A disponibilidade de WebGPU depende do navegador/dispositivo; há fallback para WASM/CPU.

Modelo: https://huggingface.co/onnx-community/Qwen2.5-0.5B-Instruct

## Privacidade e segurança
Esta versão é um protótipo de interface e inferência local. Ela **não implementa autenticação segura por senha**. Não coloque uma senha fixa no JavaScript: qualquer pessoa pode inspecionar o código e removê-la.

Para manter o site privado no Vercel, ative Deployment Protection > Vercel Authentication > All Deployments e conceda acesso somente à sua conta. A proteção de produção com Vercel Authentication está disponível em todos os planos, conforme a documentação atual: https://vercel.com/docs/deployment-protection

## Limitações da versão 1.0
- O primeiro download do modelo pode ser grande e demorar.
- O desempenho depende do navegador, memória disponível e suporte a WebGPU.
- O modelo 0.5B é pequeno; pode errar, repetir ou responder de forma limitada.
- Histórico ainda não é salvo entre sessões.
- Esta versão não envia as mensagens para um servidor próprio; a inferência ocorre no dispositivo.
