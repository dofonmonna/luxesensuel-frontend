try {
  require('./backend/services/aliexpress.js');
} catch (err) {
  console.log(err.stack);
}
