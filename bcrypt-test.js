const bcrypt = require('bcrypt');

const hash = '$2b$10$4zIQijoZApuoW1BlCqoeZu2.pXYOWx4epymsNfdWUG6.Jn5A18Rw2';

// Replace this with the exact password you want to test
const password = 'admin123456';

bcrypt.compare(password, hash).then(result => {
  console.log('bcrypt compare result:', result); // true means password matches hash
});
