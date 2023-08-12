// vite.config.js
export default {
  proxy: {
    '/api': {
      target: 'https://hewego.azurewebsites.net/',
      changeOrigin: true,
      secure: false,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
};

