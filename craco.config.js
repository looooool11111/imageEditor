const path = require('path');

module.exports = {
  // webpack配置
  webpack: {
    // 配置别名
    alias: {
      // 约定制定
      '@': path.resolve(__dirname, 'src'),
    },
  },
};
