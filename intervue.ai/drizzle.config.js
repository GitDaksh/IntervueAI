/** @type { import("drizzle-kit").Config } */

export default {
    schema: './utils/schema.js',
    dialect: 'postgresql',
    dbCredentials: {
        url: 'postgresql://neondb_owner:qyTKtL5C0UGR@ep-frosty-math-a5whd54l.us-east-2.aws.neon.tech/neondb?sslmode=require',
    }
}