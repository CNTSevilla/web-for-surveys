/**
 * astro.config.mjs - Configuración principal de Astro.
 *
 * Configura la aplicación en modo servidor (SSR) con el adaptador
 * de Node.js en modo standalone. Esto genera un ejecutable Node.js
 * autocontenido que incluye el servidor HTTP.
 *
 * output: 'server' - Habilita Server-Side Rendering (SSR)
 * adapter: node({ mode: 'standalone' }) - Genera servidor Node.js autocontenido
 */

import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  })
});