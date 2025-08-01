import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Function to generate a strong random password (16 characters)
function generateRandomPassword() {
  return crypto.randomBytes(12)     // 12 bytes = 16 chars in base64
    .toString('base64')
    .replace(/[+/=]/g, '')          // Remove special chars for simplicity
    .slice(0, 16);                  // Ensure 16 characters
}

// Main function
async function hashPassword() {
  // Generate a random password
  const password = generateRandomPassword();
  console.log('Generated Password:', password);

  // Hash the password
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);

  console.log('Hashed Password:', hash);
  
  // Verify the hash (demo)
  const isMatch = await bcrypt.compare(password, hash);
  console.log('Password Matches:', isMatch);
}

// Run the example
hashPassword();