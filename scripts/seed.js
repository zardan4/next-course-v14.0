const { sql } = require('@vercel/postgres');
const {
  invoices,
  customers,
  revenue,
  users,
} = require('../app/lib/placeholder-data.js');
const bcrypt = require('bcrypt');

(async () => {
  const hashedPassword = await bcrypt.hash("123456", 10);
  console.log(hashedPassword)
  sql`
    INSERT INTO users (id, name, email, password)
    VALUES ('13D07535-A59E-4157-A011-F8D2EF4E0CBB', 'KRavchen', 'oleksandr.kravch@gmail.com', ${hashedPassword})
    ON CONFLICT (id) DO NOTHING;
  `;
})()
