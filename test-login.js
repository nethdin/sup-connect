const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

const config = {
  host: "turntable.proxy.rlwy.net",
  port: 52451,
  user: "root",
  password: "oOBEhYalVgQVDYnMsNHHIaJYmVhTNiFC",
  database: "railway",
};

async function testLogin(email, password) {
  try {
    console.log("\n=== Testing Login ===");
    console.log("Email:", email);
    console.log("Password:", password);

    const conn = await mysql.createConnection(config);

    // Get user from database
    const [rows] = await conn.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      console.log("❌ User not found in database");
      await conn.end();
      return;
    }

    const user = rows[0];
    console.log("\n✅ User found:");
    console.log("  - ID:", user.id);
    console.log("  - Name:", user.name);
    console.log("  - Email:", user.email);
    console.log("  - Role:", user.role);
    console.log("  - Password Hash:", user.password);

    // Test password verification
    console.log("\n🔐 Testing password verification...");
    const isValid = await bcrypt.compare(password, user.password);

    if (isValid) {
      console.log("✅ Password is CORRECT! Login should work.");
    } else {
      console.log("❌ Password is INCORRECT! Login will fail.");
      console.log("\nTrying to verify the hash format...");
      console.log(
        "Hash starts with $2b$10$?",
        user.password.startsWith("$2b$10$")
      );
      console.log("Hash length:", user.password.length);
    }

    await conn.end();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Test with the users in the database
// Replace with your actual test credentials
const testEmail = "nadeeshafernando2020@gmail.com";
const testPassword = "your-password-here"; // Replace with the actual password you used during registration

testLogin(testEmail, testPassword);
