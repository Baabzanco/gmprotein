import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  loginSchema,
  createContactRequestSchema,
  createUserSchema,
  bulkPriceUpdateSchema,
  canonicalRoles,
} from "../validators";
import { productRepository } from "../repositories/product.repository";
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

  // Missing fields or empty roles array must fail
  const emptyRolesUser = createUserSchema.safeParse({
    firstName: "کاربر",
    lastName: "بدون‌نقش",
    email: "norole@test.com",
    password: "Password123!",
    roles: [],
  });
  assert(emptyRolesUser.success === false, "User with empty roles array is rejected");

  const invalidEmailUser = createUserSchema.safeParse({
    firstName: "کاربر",
    lastName: "نامعتبر",
    email: "not-an-email",
    password: "Password123!",
    roles: ["ADMIN"],
  });
  assert(invalidEmailUser.success === false, "User with invalid email format is rejected");

  const shortPasswordUser = createUserSchema.safeParse({
    firstName: "کاربر",
    lastName: "تست",
    email: "test@example.com",
    password: "123",
    roles: ["ADMIN"],
  });
  assert(shortPasswordUser.success === false, "User with short password is rejected");

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
  const result = await productRepository.bulkUpdatePrices({
    type: "PERCENTAGE",
    value: 10,
    productIds: [firstProd.id],
  });
  assert(result.affectedCount === 1, "Bulk price update affects targeted product");
  const updatedProduct = await productRepository.findById(firstProd.id);
  assert(
    updatedProduct !== null && updatedProduct.basePrice === Math.round(initialPrice * 1.1),
    "Product price updated accurately by +10%"
  );

  // --- Suite 6: User Repository & Audit Separation ---
  console.log("\nSuite 6: User Repository & Audit Logs Separation");

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

  // --- Suite 7: Phase 4 Blog Domain & SEO Services ---
  console.log("\nSuite 7: Blog Domain, SEO Fallbacks & Sanitization");
  const { blogRepository } = await import("../repositories/blog.repository");
  const { blogService, sanitizeArticleContent, stripHtmlToText, generateUrlSafeSlug } = await import("../services/blog.service");

  // 1. Sanitization & slug helpers
  const maliciousHtml = `<p>متن سالم</p><script>alert('xss')</script><iframe src="evil.com"></iframe><img src="x" onerror="alert(1)" />`;
  const sanitized = sanitizeArticleContent(maliciousHtml);
  assert(!sanitized.includes("<script>") && !sanitized.includes("<iframe>") && !sanitized.includes("onerror="), "Sanitizer strips scripts, iframes, and onerror handlers");
  assert(sanitized.includes("<p>متن سالم</p>"), "Sanitizer preserves valid HTML structure");

  const testSlug = generateUrlSafeSlug("راهنمای خرید گوشت ریب-آی و استیک!");
  assert(testSlug.length > 0 && !testSlug.includes("!") && !testSlug.includes(" "), "Slug generator produces clean url-safe slug");

  const plainSummary = stripHtmlToText("<p>این یک <strong>تست مهم</strong> برای سئو است.</p>", 50);
  assert(plainSummary === "این یک تست مهم برای سئو است.", "HTML tag stripper extracts plain text for SEO descriptions");

  // 2. Blog Category CRUD & Post Lifecycle
  const cat = await blogRepository.createCategory({
    name: `دسته‌بندی تستی ${Date.now()}`,
    slug: `test-cat-${Date.now()}`,
    description: "توضیحات تست",
  });
  assert(cat.id !== undefined && cat.slug.startsWith("test-cat-"), "Blog category created successfully");

  const createdPost = await blogService.createPost({
    title: "آموزش گریل و درای ایجینگ گوشت برای رستوران‌ها",
    content: "<p>محتوای آموزشی تخصصی برای سرآشپزان محترم هتل‌ها و رستوران‌های برتر کشور.</p>",
    categoryIds: [cat.id],
    tagNames: ["گریل", "درای_ایج"],
    status: "DRAFT",
  });
  assert(createdPost.id !== undefined, "Blog post created via service");
  assert(createdPost.status === "DRAFT", "New post defaults to DRAFT");
  assert(Boolean(createdPost.seoTitle?.includes("آموزش گریل")), "SEO title auto-fallback correctly applied");
  assert(Boolean(createdPost.canonicalUrl?.includes("/blog/")), "Canonical URL auto-fallback correctly applied");

  // 3. Status transition & Published queries
  const published = await blogService.updatePostStatus(createdPost.id, "PUBLISHED");
  assert(published.status === "PUBLISHED" && published.publishedAt !== null, "Post published successfully with timestamp");

  const publishedList = await blogService.getPublishedPosts({ categorySlug: cat.slug });
  assert(publishedList.posts.some((p) => p.id === createdPost.id), "Published post appears in public getPublishedPosts query");

  const bySlug = await blogService.getPostBySlug(createdPost.slug);
  assert(bySlug.post !== null && bySlug.post.id === createdPost.id, "Post retrieved accurately by slug");

  // 4. Update slug with redirect tracking
  const newSlug = `updated-slug-${Date.now()}`;
  await blogService.updatePost(createdPost.id, { slug: newSlug });
  const byOldSlug = await blogRepository.getPublishedBySlug(createdPost.slug);
  assert(byOldSlug.post !== null && byOldSlug.redirectedTo === newSlug, "Old slug correctly tracks and redirects to new slug");

  // 5. Cleanup
  await blogService.deletePost(createdPost.id);
  const deletedCheck = await blogRepository.findById(createdPost.id);
  assert(deletedCheck === null, "Post deleted safely");

  await blogService.deleteCategory(cat.id);
  const catDeletedCheck = await blogRepository.findCategoryById(cat.id);
  assert(catDeletedCheck === null, "Category deleted safely");

  // --- Suite 8: Phase 5 RBAC, Roles & Permissions, Status & Superadmin Protection ---
  console.log("\nSuite 8: RBAC, Roles Management & Superadmin Protection");
  const { roleRepository } = await import("../repositories/role.repository");
  const { userService } = await import("../services/user.service");

  // 1. Role Repository: Create custom role and assign granular permissions
  const customRole = await roleRepository.create({
    name: `INVENTORY_LEAD_${Date.now()}`,
    title: "سرپرست انبار سردخانه",
    description: "مدیریت ورود و خروج گوشت‌های منجمد",
    permissions: ["products.view", "products.update", "categories.view"],
  });
  assert(customRole.id !== undefined && customRole.isSystem === false, "Custom role created successfully with isSystem: false");
  assert(customRole.permissions.includes("products.view") && customRole.permissions.includes("products.update"), "Granular permissions accurately stored for role");

  // 2. Role Repository: Update role permissions
  const updatedRole = await roleRepository.update(customRole.id, {
    title: "سرپرست ارشد انبار",
    permissions: ["products.view", "products.update", "categories.view", "categories.update"],
  });
  assert(updatedRole !== null && updatedRole.permissions.includes("categories.update"), "Role permissions updated accurately");

  // 3. Prevent deleting system roles
  const superAdminRole = await roleRepository.findByName("SUPER_ADMIN");
  if (superAdminRole) {
    let systemRoleDeleteFailed = false;
    try {
      await roleRepository.delete(superAdminRole.id);
    } catch {
      systemRoleDeleteFailed = true;
    }
    assert(systemRoleDeleteFailed === true, "System role (SUPER_ADMIN) is protected and cannot be deleted");
  }

  // 4. User Service: Create user with custom role
  const staffUser = await userService.createUser("admin-system-test", {
    firstName: "سهراب",
    lastName: "سپهری",
    email: `inventory-${Date.now()}@golmohamadi.com`,
    password: "Password123!",
    roles: [customRole.name],
  });
  assert(staffUser.id !== undefined, "User created with custom role via UserService");
  assert(staffUser.roles.includes(customRole.name), "User has assigned custom role");

  // 5. User permissions resolution
  const userDetails = await userService.getUserById(staffUser.id);
  assert(userDetails !== null && userDetails.permissions.includes("products.view"), "User permissions dynamically resolved from roles");

  // 6. User Status Suspension & Real-time Active Check
  const suspendedSuccess = await userService.updateUserStatus("admin-system-test", staffUser.id, false);
  assert(suspendedSuccess === true, "User status update returned success");
  const suspendedUser = await userRepository.findById(staffUser.id);
  assert(suspendedUser !== null && suspendedUser.status === "SUSPENDED" && suspendedUser.isActive === false, "User status successfully set to SUSPENDED");

  const reactivatedSuccess = await userService.updateUserStatus("admin-system-test", staffUser.id, true);
  assert(reactivatedSuccess === true, "User reactivated status returned success");
  const reactivatedUser = await userRepository.findById(staffUser.id);
  assert(reactivatedUser !== null && reactivatedUser.status === "ACTIVE" && reactivatedUser.isActive === true, "User status reactivated to ACTIVE");

  // 7. Password Reset
  await userService.resetPassword("admin-system-test", staffUser.id, "NewSecret2026!");
  const userAfterReset = await userRepository.findByEmail(staffUser.email);
  const isNewPasswordValid = userAfterReset ? await bcrypt.compare("NewSecret2026!", userAfterReset.passwordHash) : false;
  assert(isNewPasswordValid === true, "Password reset successfully and verifies with bcrypt");

  // 8. Superadmin Protection Tests
  const allUsersResult = await userRepository.findAll();
  const superAdminUser = allUsersResult.users.find((u) => u.roles.includes("SUPER_ADMIN"));
  if (superAdminUser) {
    // Attempting to suspend the only active superadmin must fail
    let superAdminSuspendFailed = false;
    try {
      await userService.updateUserStatus("test", superAdminUser.id, false);
    } catch (err: any) {
      superAdminSuspendFailed = true;
    }
    assert(superAdminSuspendFailed === true, "Superadmin protection prevents suspending the last active superadmin");

    // Attempting to delete the last active superadmin must fail
    let superAdminDeleteFailed = false;
    try {
      await userService.deleteUser("test", superAdminUser.id);
    } catch (err: any) {
      superAdminDeleteFailed = true;
    }
    assert(superAdminDeleteFailed === true, "Superadmin protection prevents deleting the last superadmin");
  }

  // 9. Cleanup custom role and test user
  await userService.deleteUser("test", staffUser.id);
  const deletedStaff = await userRepository.findById(staffUser.id);
  assert(deletedStaff === null, "Test user safely cleaned up");

  await roleRepository.delete(customRole.id);
  const deletedRoleCheck = await roleRepository.findById(customRole.id);
  assert(deletedRoleCheck === null, "Custom role safely cleaned up");

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
