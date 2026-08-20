import path from 'path';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return;
          if (id.includes('@react-pdf') || id.includes('pdfjs-dist')) return 'pdf';
          return 'vendor';
        }
      },
      plugins: [
        {
          name: 'skip-eslint',
          buildStart() {
            this.warn('Skipping ESLint check');
          }
        }
      ]
    }
  }
});
