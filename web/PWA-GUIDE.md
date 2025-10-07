# Guia do PWA - SpeechAI

Este guia explica como o PWA (Progressive Web App) foi implementado no SpeechAI e como utilizá-lo.

## 🚀 O que foi implementado

### 1. Configuração Base
- ✅ **Manifest.json**: Configuração completa do PWA
- ✅ **Service Worker**: Cache automático e funcionalidades offline
- ✅ **Meta Tags**: Otimização para diferentes dispositivos
- ✅ **Ícones**: Estrutura preparada para todos os tamanhos necessários

### 2. Funcionalidades PWA
- ✅ **Instalação**: Prompt automático para instalar o app
- ✅ **Atualizações**: Notificação quando há novas versões
- ✅ **Modo Offline**: Indicador visual quando offline
- ✅ **Cache Inteligente**: Cache de APIs e imagens
- ✅ **Atalhos**: Shortcuts para funcionalidades principais

### 3. Componentes React
- ✅ **PWAUpdatePrompt**: Gerencia instalação e atualizações
- ✅ **OfflineIndicator**: Mostra status de conexão
- ✅ **usePWA Hook**: Hook personalizado para estado PWA

## 📱 Como testar o PWA

### 1. Desenvolvimento Local
```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

### 2. Teste de Instalação
1. Abra o app no navegador
2. Procure pelo ícone de instalação na barra de endereços
3. Ou use o prompt automático que aparece
4. Teste a instalação em diferentes dispositivos

### 3. Teste Offline
1. Abra o DevTools (F12)
2. Vá para a aba "Network"
3. Marque "Offline"
4. Verifique se o app funciona offline

## 🎨 Personalização dos Ícones

### Ícones Necessários
Crie os seguintes ícones e coloque em `public/icons/`:

```
icon-16x16.png      (16x16px)
icon-32x32.png      (32x32px)
icon-72x72.png      (72x72px)
icon-96x96.png      (96x96px)
icon-128x128.png    (128x128px)
icon-144x144.png    (144x144px)
icon-152x152.png    (152x152px)
icon-192x192.png    (192x192px)
icon-384x384.png    (384x384px)
icon-512x512.png    (512x512px)
```

### Ferramentas Recomendadas
- **PWA Builder**: https://www.pwabuilder.com/
- **Favicon Generator**: https://realfavicongenerator.net/
- **Figma**: Para criar os ícones

## 🔧 Configurações Avançadas

### 1. Cache Personalizado
Edite `vite.config.mts` para personalizar o cache:

```typescript
workbox: {
  globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\./,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 7 // 7 dias
        }
      }
    }
  ]
}
```

### 2. Atalhos Personalizados
Edite `manifest.json` para adicionar atalhos:

```json
"shortcuts": [
  {
    "name": "Dashboard",
    "short_name": "Dashboard",
    "description": "Acessar o painel principal",
    "url": "/dashboard",
    "icons": [{"src": "/icons/dashboard-icon.png", "sizes": "96x96"}]
  }
]
```

## 📊 Monitoramento

### 1. Analytics PWA
Adicione analytics para monitorar:
- Taxa de instalação
- Uso offline
- Performance do cache

### 2. Métricas Importantes
- **Install Rate**: % de usuários que instalam
- **Offline Usage**: Uso quando offline
- **Cache Hit Rate**: Eficiência do cache
- **Update Adoption**: Adoção de atualizações

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. PWA não aparece para instalação
- Verifique se está servindo via HTTPS
- Confirme se o manifest.json está acessível
- Teste em diferentes navegadores

#### 2. Service Worker não funciona
- Verifique o console para erros
- Confirme se o arquivo sw.js está sendo gerado
- Teste em modo incógnito

#### 3. Cache não funciona
- Verifique as configurações do Workbox
- Limpe o cache do navegador
- Teste com DevTools abertos

### Debug
```bash
# Verificar se o PWA está funcionando
npx lighthouse https://seu-dominio.com --only-categories=pwa

# Testar localmente
npx serve dist
```

## 🚀 Deploy

### 1. Build para Produção
```bash
npm run build
```

### 2. Verificações Pré-Deploy
- [ ] Todos os ícones estão presentes
- [ ] Manifest.json está correto
- [ ] HTTPS está configurado
- [ ] Service Worker está funcionando
- [ ] Teste em diferentes dispositivos

### 3. Deploy
- Faça upload da pasta `dist` para seu servidor
- Configure HTTPS (obrigatório para PWA)
- Teste a instalação em produção

## 📚 Recursos Adicionais

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [PWA Builder](https://www.pwabuilder.com/)
- [Lighthouse PWA Audit](https://developers.google.com/web/tools/lighthouse)

## 🎯 Próximos Passos

1. **Criar os ícones** seguindo o guia em `public/icons/README.md`
2. **Testar em diferentes dispositivos** (mobile, tablet, desktop)
3. **Configurar analytics** para monitorar uso
4. **Otimizar performance** baseado em métricas reais
5. **Adicionar funcionalidades offline** específicas do SpeechAI

---

**Nota**: Este PWA está configurado para funcionar perfeitamente com a arquitetura React + Vite + TypeScript do SpeechAI. Todas as configurações seguem as melhores práticas e padrões modernos de PWA.
