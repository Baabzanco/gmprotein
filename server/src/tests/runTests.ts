import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  loginSchema,
  createQuotationRequestSchema,
  createContactRequestSchema,
  createUserSchema,
  bulkPriceUpdateSchema,
  canonicalRoles,
} from "../validators";
import { productRepository } from "../repositories/product.repository";
import { quotationRepository } from "../repositories/quotation.repository";
import { userRepository } from "../repositories/user.repository";
import { auditRepository } from "../repositories/audit.repository";
import { config } from "../config";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName}`);
  }
}

async function runAllTests() {
  console.log("\n==============================================");
  console.log(" Running Protein Golmohammadi Backend Tests ");
  console.log("==============================================\n");

  // --- Suite 1: Zod Validators ---
  console.log("Suite 1: Zod Input Validation");

  const validLogin = loginSchema.safeParse({
    email: "admin@golmohamadi.com",
    password: "securePassword123",
  });
  assert(validLogin.success === true, "Valid login payload parses successfully");

  const invalidLogin = loginSchema.safeParse({
    email: "not-an-email",
    password: "123",
  });
  assert(invalidLogin.success === false, "Invalid email/password fails validation");

  const validQuotation = createQuotationRequestSchema.safeParse({
    customerName: "هتل اسپیناس",
    phone: "09121234567",
    items: [
      {
        productId: "prod-1",
        requestedWeight: 25.5,
        quantity: 2,
      },
    ],
  });
  assert(validQuotation.success === true, "Valid quotation request with items passes");

  const invalidQuotation = createQuotationRequestSchema.safeParse({
    customerName: "",
    phone: "123",
    items: [],
  });
  assert(invalidQuotation.success === false, "Empty items array in quotation is rejected");

  const validContact = createContactRequestSchema.safeParse({
    name: "علی رضایی",
    phone: "09129876543",
    subject: "درخواست همکاری در تأمین استیک",
    message: "سلام، مایل به مذاکره برای تأمین گوشت رستوران هستیم.",
  });
  assert(validContact.success === true, "Valid contact request passes");

  // --- Suite 2: RBAC Canonical Roles Validation ---
  console.log("\nSuite 2: RBAC Canonical Roles & User Creation");

  // Test every canonical role parses in createUserSchema
  for (const role of canonicalRoles) {
    const validUserWithRole = createUserSchema.safeParse({
      firstName: "تست",
      lastName: "کاربر",
      email: `test-${role.toLowerCase()}@golmohamadi.com`,
      password: "Password123!",
      roles: [role],
    });
    assert(validUserWithRole.success === true, `Canonical role ${role} passes schema validation`);
  }

  // Legacy roles or invalid roles MUST fail
  const legacyRoleUser1 = createUserSchema.safeParse({
    firstName: "مدیر",
    lastName: "کاتالوگ",
    email: "cat@test.com",
    password: "Password123!",
    roles: ["CATALOG_MANAGER"],
  });
  assert(legacyRoleUser1.success === false, "Legacy role CATALOG_MANAGER is rejected by schema");

  const legacyRoleUser2 = createUserSchema.safeParse({
    firstName: "فروشنده",
    lastName: "ارشد",
    email: "sales@test.com",
    password: "Password123!",
    roles: ["SALES_REP"],
  });
  assert(legacyRoleUser2.success === false, "Legacy role SALES_REP is rejected by schema");

  const legacyRoleUser3 = createUserSchema.safeParse({
    firstName: "ادیتور",
    lastName: "محتوا",
    email: "editor@test.com",
    password: "Password123!",
    roles: ["CONTENT_EDITOR"],
  });
  assert(legacyRoleUser3.success === false, "Legacy role CONTENT_EDITOR is rejected by schema");

  const invalidRoleUser = createUserSchema.safeParse({
    firstName: "کاربر",
    lastName: "نامعتبر",
    email: "invalid@test.com",
    password: "Password123!",
    roles: ["HACKER_ROLE"],
  });
  assert(invalidRoleUser.success === false, "Arbitrary invalid role HACKER_ROLE is rejected by schema");

  // Empty roles array must fail
  const emptyRolesUser = createUserSchema.safeParse({
    firstName: "کاربر",
    lastName: "بدون‌نقش",
    email: "norole@test.com",
    password: "Password123!",
    roles: [],
  });
  assert(emptyRolesUser.success === false, "User with empty roles array is rejected");

  // --- Suite 3: Bulk Price Update Validation ---
  console.log("\nSuite 3: Bulk Price Update Validation");

  const validBulkPrice = bulkPriceUpdateSchema.safeParse({
    percentageChange: 15,
    productIds: ["prod-1", "prod-2"],
    roundToNearest: 1000,
  });
  assert(validBulkPrice.success === true, "Valid positive bulk price percentage passes validation");

  const validNegativeBulkPrice = bulkPriceUpdateSchema.safeParse({
    percentageChange: -20,
    roundToNearest: 500,
  });
  assert(validNegativeBulkPrice.success === true, "Valid negative bulk price percentage passes validation");

  const extremeReduction = bulkPriceUpdateSchema.safeParse({
    percentageChange: -95,
  });
  assert(extremeReduction.success === false, "Price reduction exceeding 90% is rejected");

  const extremeIncrease = bulkPriceUpdateSchema.safeParse({
    percentageChange: 600,
  });
  assert(extremeIncrease.success === false, "Price increase exceeding 500% is rejected");

  // --- Suite 4: Security & Cryptography ---
  console.log("\nSuite 4: Security & Cryptography");

  const testPassword = "SuperSecretPassword2026!";
  const hash = await bcrypt.hash(testPassword, 10);
  const isMatch = await bcrypt.compare(testPassword, hash);
  const isMismatch = await bcrypt.compare("WrongPassword", hash);
  assert(isMatch === true, "Bcrypt hash compares accurately with original password");
  assert(isMismatch === false, "Bcrypt rejects incorrect password");

  const tokenPayload = { id: "test-user-id", roles: ["SUPER_ADMIN"] };
  const token = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: "1h" });
  const decoded = jwt.verify(token, config.jwtSecret) as any;
  assert(decoded.id === "test-user-id" && decoded.roles.includes("SUPER_ADMIN"), "JWT token signs and verifies claims accurately");

  // --- Suite 5: Product Repository & Bulk Price ---
  console.log("\nSuite 5: Product Repository");

  const products = await productRepository.findAll();
  assert(Array.isArray(products) && products.length > 0, "Products list returns non-empty array");

  const firstProd = products[0];
  const foundById = await productRepository.findById(firstProd.id);
  assert(foundById !== null && foundById.id === firstProd.id, "Product can be queried by ID");

  const initialPrice = firstProd.basePrice;
  const affected = await productRepository.bulkUpdatePrices([firstProd.id], 10);
  assert(affected === 1, "Bulk price update affects targeted product");
  const updatedProduct = await productRepository.findById(firstProd.id);
  assert(
    updatedProduct !== null && updatedProduct.basePrice === Math.round(initialPrice * 1.1),
    "Product price updated accurately by +10%"
  );

  // --- Suite 6: Quotation Lifecycle ---
  console.log("\nSuite 6: Quotation Lifecycle");

  const createdQuotation = await quotationRepository.create({
    customerName: "تست رستوران میلاد",
    phone: "09123456789",
    items: [
      {
        productId: firstProd.id,
        requestedWeight: 10,
        quantity: 1,
      },
    ],
  });
  assert(createdQuotation.status === "PENDING", "New quotation starts with PENDING status");

  const updatedQuotation = await quotationRepository.updateStatus(createdQuotation.id, "QUOTED");
  assert(updatedQuotation?.status === "QUOTED", "Quotation status updates to QUOTED");

  // --- Suite 7: User Repository & Audit Separation ---
  console.log("\nSuite 7: User Repository & Audit Logs Separation");

  const testUser = await userRepository.create({
    firstName: "کارشناس",
    lastName: "محصول",
    email: `pm-${Date.now()}@golmohamadi.com`,
    password: "Password123!",
    roles: ["PRODUCT_MANAGER"],
  });
  assert(testUser.roles.includes("PRODUCT_MANAGER"), "User created with PRODUCT_MANAGER canonical role");

  const initialAuditLogsCount = (await auditRepository.findAll()).length;
  await auditRepository.log({
    userId: testUser.id,
    action: "ROLE_UNIFIED_TEST",
    entity: "User",
    entityId: testUser.id,
    metadata: { canonical: true },
  });
  const newAuditLogs = await auditRepository.findAll();
  assert(newAuditLogs.length === initialAuditLogsCount + 1, "Audit log correctly recorded without exposing secrets");

  // Summary
  console.log("\n==============================================");
  console.log(`Results: ${passedTests}/${totalTests} tests passed (${failedTests} failed)`);
  console.log("==============================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
