import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").default("draft").notNull(),
  templateId: integer("template_id").default(0),
  generatedHtml: text("generated_html"),
  generatedCss: text("generated_css"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  colorPalette: jsonb("color_palette"),
  sections: jsonb("sections"),
  editCount: integer("edit_count").default(0).notNull(),
  designStyle: text("design_style").default("modern"),
  htmlHistory: jsonb("html_history").default(sql`'[]'::jsonb`),
  websiteLanguage: varchar("website_language").default("ar"),
  websiteLanguages: text("website_languages").array().default(sql`ARRAY['ar']::text[]`),
  publishedUrl: text("published_url"),
  vercelDeploymentId: text("vercel_deployment_id"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  category: text("category").notNull(),
  thumbnail: text("thumbnail"),
  previewHtml: text("preview_html"),
  previewCss: text("preview_css"),
  isPremium: boolean("is_premium").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
});

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discountType: text("discount_type").notNull(),
  discountValue: integer("discount_value").notNull(),
  maxUses: integer("max_uses").default(0),
  usedCount: integer("used_count").default(0),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertCouponSchema = createInsertSchema(coupons).omit({
  id: true,
  usedCount: true,
  createdAt: true,
});

export const platformSettings = pgTable("platform_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  plan: varchar("plan").notNull().default("free"),
  status: varchar("status").notNull().default("active"),
  paymobOrderId: varchar("paymob_order_id"),
  paymobTransactionId: varchar("paymob_transaction_id"),
  amountCents: integer("amount_cents"),
  currency: varchar("currency").default("SAR"),
  startDate: timestamp("start_date").default(sql`CURRENT_TIMESTAMP`),
  endDate: timestamp("end_date"),
  invoiceIsCompany: boolean("invoice_is_company").default(false),
  invoiceCompanyName: varchar("invoice_company_name"),
  invoiceTaxNumber: varchar("invoice_tax_number"),
  invoiceCustomerName: varchar("invoice_customer_name"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertPlatformSettingSchema = createInsertSchema(platformSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

// ─── Chatbot System Tables ───────────────────────────────────────────────────

export const visitorQuestions = pgTable("visitor_questions", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  detectedLanguage: text("detected_language").default("ar"),
  detectedDialect: text("detected_dialect").default("msa"),
  aiResponse: text("ai_response"),
  sessionId: text("session_id"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const autoLearnedKnowledge = pgTable("auto_learned_knowledge", {
  id: serial("id").primaryKey(),
  questionPattern: text("question_pattern").notNull(),
  answer: text("answer").notNull(),
  usageCount: integer("usage_count").default(1),
  language: text("language").default("ar"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const knowledgeBase = pgTable("knowledge_base", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").default("general"),
  language: text("language").default("ar"),
  isApproved: boolean("is_approved").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const chatbotConversations = pgTable("chatbot_conversations", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  userId: text("user_id"),
  detectedLanguage: text("detected_language").default("ar"),
  detectedDialect: text("detected_dialect").default("msa"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const chatbotMessages = pgTable("chatbot_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  sender: text("sender").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  businessType: text("business_type"),
  sessionId: text("session_id"),
  source: text("source").default("chatbot"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// ─── Component Library & Learning System ────────────────────────────────────
export const aiGeneratedBlocks = pgTable("ai_generated_blocks", {
  id: serial("id").primaryKey(),
  businessType: text("business_type").notNull(),
  designStyle: text("design_style").default("dark-modern"),
  websiteLanguage: text("website_language").default("ar"),
  prompt: text("prompt").notNull(),
  htmlContent: text("html_content").notNull(),
  seoTitle: text("seo_title"),
  colorPalette: jsonb("color_palette"),
  usageCount: integer("usage_count").default(1),
  rating: integer("rating").default(0),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const generationLogs = pgTable("generation_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"),
  businessType: text("business_type"),
  designStyle: text("design_style"),
  websiteLanguage: text("website_language").default("ar"),
  prompt: text("prompt"),
  success: boolean("success").default(true),
  generationMs: integer("generation_ms"),
  usedCachedBlock: boolean("used_cached_block").default(false),
  cachedBlockId: integer("cached_block_id"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type AiGeneratedBlock = typeof aiGeneratedBlocks.$inferSelect;
export type GenerationLog = typeof generationLogs.$inferSelect;

// ─── Self-Improving Learning System ─────────────────────────────────────────

/**
 * Stores extracted patterns from successful website generations, per industry.
 * The system learns from every generation and injects past successes into future prompts.
 */
export const industryPatterns = pgTable("industry_patterns", {
  id: serial("id").primaryKey(),
  industry: text("industry").notNull(),
  patternType: text("pattern_type").notNull(), // tagline | service_title | cta_text | about_opening | faq_question | stat_label
  content: text("content").notNull(),          // the actual text that worked well
  language: text("language").default("ar"),    // ar | en
  usageCount: integer("usage_count").default(1).notNull(),
  qualityScore: integer("quality_score").default(50).notNull(), // 0-100; boosted by publish/export, reduced by regen
  sourcePrompt: text("source_prompt"),         // snippet of original user prompt
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

/**
 * Extended generation log — links generation to the spec produced, for learning purposes.
 */
export const generationInsights = pgTable("generation_insights", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"),
  projectId: integer("project_id"),
  industry: text("industry"),
  language: text("language").default("ar"),
  prompt: text("prompt"),
  specJson: jsonb("spec_json"),                // full WebsiteContentSpec that was generated
  primaryColor: varchar("primary_color", { length: 10 }),
  accentColor: varchar("accent_color", { length: 10 }),
  generationMs: integer("generation_ms"),
  qualityScore: integer("quality_score").default(50), // 50=neutral, 100=exported, 0=immediately_regenerated
  regeneratedAfterMs: integer("regenerated_after_ms"), // null = not regenerated
  exportedAt: timestamp("exported_at"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type IndustryPattern = typeof industryPatterns.$inferSelect;
export type GenerationInsight = typeof generationInsights.$inferSelect;

export const creditPurchases = pgTable("credit_purchases", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  credits: integer("credits").notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: varchar("currency").default("SAR"),
  status: varchar("status").default("pending").notNull(),
  paymobOrderId: varchar("paymob_order_id"),
  paymobTransactionId: varchar("paymob_transaction_id"),
  invoiceIsCompany: boolean("invoice_is_company").default(false),
  invoiceCompanyName: varchar("invoice_company_name"),
  invoiceTaxNumber: varchar("invoice_tax_number"),
  invoiceCustomerName: varchar("invoice_customer_name"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const userFeedback = pgTable("user_feedback", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"),
  userName: text("user_name"),
  userEmail: text("user_email"),
  type: text("type").notNull().default("bug"), // bug | suggestion | question | praise
  message: text("message").notNull(),
  page: text("page"), // which page/feature the feedback is about
  status: text("status").notNull().default("new"), // new | read | resolved
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertCreditPurchaseSchema = createInsertSchema(creditPurchases).omit({ id: true, createdAt: true });

// Insert schemas
export const insertVisitorQuestionSchema = createInsertSchema(visitorQuestions).omit({ id: true, createdAt: true });
export const insertKnowledgeBaseSchema = createInsertSchema(knowledgeBase).omit({ id: true, createdAt: true });
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true });
export const insertChatbotMessageSchema = createInsertSchema(chatbotMessages).omit({ id: true, createdAt: true });
export const insertChatbotConversationSchema = createInsertSchema(chatbotConversations).omit({ id: true, createdAt: true });
export const insertUserFeedbackSchema = createInsertSchema(userFeedback).omit({ id: true, createdAt: true, status: true, adminNote: true });

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  userId: varchar("user_id").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

// Types
export type CreditPurchase = typeof creditPurchases.$inferSelect;
export type InsertCreditPurchase = z.infer<typeof insertCreditPurchaseSchema>;

export type VisitorQuestion = typeof visitorQuestions.$inferSelect;
export type AutoLearnedKnowledge = typeof autoLearnedKnowledge.$inferSelect;
export type KnowledgeBase = typeof knowledgeBase.$inferSelect;
export type ChatbotConversation = typeof chatbotConversations.$inferSelect;
export type ChatbotMessage = typeof chatbotMessages.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type UserFeedback = typeof userFeedback.$inferSelect;
export type InsertUserFeedback = z.infer<typeof insertUserFeedbackSchema>;
export type InsertKnowledgeBase = z.infer<typeof insertKnowledgeBaseSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type PlatformSetting = typeof platformSettings.$inferSelect;
export type InsertPlatformSetting = z.infer<typeof insertPlatformSettingSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

// ── Domain & Hosting Orders ───────────────────────────────────────────────────
export const domainOrders = pgTable("domain_orders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  domain: varchar("domain", { length: 255 }).notNull(),
  tld: varchar("tld", { length: 20 }).notNull(),
  years: integer("years").default(1).notNull(),
  type: varchar("type", { length: 20 }).default("register").notNull(), // register | renew | transfer
  status: varchar("status", { length: 30 }).default("pending").notNull(), // pending | paid | active | failed | cancelled
  priceAr: integer("price_sar").notNull(),
  paymobOrderId: varchar("paymob_order_id"),
  paymobTransactionId: varchar("paymob_transaction_id"),
  rcOrderId: varchar("rc_order_id"),
  customerEmail: varchar("customer_email"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const hostingOrders = pgTable("hosting_orders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  planId: varchar("plan_id", { length: 50 }).notNull(), // starter | business | pro
  billingCycle: varchar("billing_cycle", { length: 10 }).default("yearly").notNull(), // monthly | yearly
  status: varchar("status", { length: 30 }).default("pending").notNull(),
  priceAr: integer("price_sar").notNull(),
  domainName: varchar("domain_name", { length: 255 }),
  paymobOrderId: varchar("paymob_order_id"),
  paymobTransactionId: varchar("paymob_transaction_id"),
  rcOrderId: varchar("rc_order_id"),
  customerEmail: varchar("customer_email"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertDomainOrderSchema = createInsertSchema(domainOrders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertHostingOrderSchema = createInsertSchema(hostingOrders).omit({ id: true, createdAt: true, updatedAt: true });

export type DomainOrder = typeof domainOrders.$inferSelect;
export type InsertDomainOrder = z.infer<typeof insertDomainOrderSchema>;
export type HostingOrder = typeof hostingOrders.$inferSelect;
export type InsertHostingOrder = z.infer<typeof insertHostingOrderSchema>;
