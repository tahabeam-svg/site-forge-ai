import { db } from "./db";
import { projects, templates, chatMessages, users, coupons, platformSettings, subscriptions, knowledgeBase, leads, autoLearnedKnowledge, visitorQuestions, userFeedback, creditPurchases, aiGeneratedBlocks, generationLogs, domainOrders, hostingOrders } from "@shared/schema";
import type { Project, InsertProject, Template, InsertTemplate, ChatMessage, InsertChatMessage, Coupon, InsertCoupon, PlatformSetting, Subscription, InsertSubscription, KnowledgeBase, InsertKnowledgeBase, Lead, InsertLead, AutoLearnedKnowledge, UserFeedback, InsertUserFeedback, CreditPurchase, InsertCreditPurchase, AiGeneratedBlock, GenerationLog, DomainOrder, InsertDomainOrder, HostingOrder, InsertHostingOrder } from "@shared/schema";
import { eq, desc, sql, count, like, and, gte } from "drizzle-orm";

export interface IStorage {
  getProjectsByUser(userId: string): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, data: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<void>;

  getTemplates(): Promise<Template[]>;
  getTemplatesSummary(opts?: { category?: string; page?: number; limit?: number }): Promise<{ data: Omit<Template, "previewHtml" | "previewCss">[]; total: number; page: number; limit: number }>;
  getTemplate(id: number): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;

  getChatMessages(projectId: number): Promise<ChatMessage[]>;
  addChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  getCoupons(): Promise<Coupon[]>;
  getCoupon(id: number): Promise<Coupon | undefined>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: number, data: Partial<Coupon>): Promise<Coupon | undefined>;
  deleteCoupon(id: number): Promise<void>;

  getUser(id: string): Promise<any | undefined>;
  getAllProjects(): Promise<Project[]>;
  getAllUsers(): Promise<any[]>;
  getStats(): Promise<{ totalUsers: number; totalProjects: number; publishedProjects: number }>;

  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string): Promise<void>;
  getSettingsByPrefix(prefix: string): Promise<PlatformSetting[]>;
  deleteSetting(key: string): Promise<void>;

  getSubscriptionByUser(userId: string): Promise<Subscription | undefined>;
  getSubscriptionByOrderId(orderId: string): Promise<Subscription | undefined>;
  createSubscription(sub: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, data: Partial<Subscription>): Promise<Subscription | undefined>;
  getSubscriptions(): Promise<Subscription[]>;

  // Chatbot
  getKnowledgeBase(language?: string): Promise<KnowledgeBase[]>;
  createKnowledgeEntry(entry: InsertKnowledgeBase): Promise<KnowledgeBase>;
  updateKnowledgeEntry(id: number, data: Partial<KnowledgeBase>): Promise<KnowledgeBase | undefined>;
  deleteKnowledgeEntry(id: number): Promise<void>;
  getVisitorQuestions(limit?: number): Promise<any[]>;
  deleteVisitorQuestion(id: number): Promise<void>;
  getAutoLearnedKnowledge(): Promise<AutoLearnedKnowledge[]>;
  approveAutoLearned(id: number): Promise<void>;
  deleteAutoLearned(id: number): Promise<void>;
  getLeads(): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;

  // Feedback
  getFeedback(): Promise<UserFeedback[]>;
  createFeedback(feedback: InsertUserFeedback): Promise<UserFeedback>;
  updateFeedbackStatus(id: number, status: string, adminNote?: string): Promise<void>;
  getNewFeedbackCount(): Promise<number>;

  // Credit Purchases
  createCreditPurchase(purchase: InsertCreditPurchase): Promise<CreditPurchase>;
  getCreditPurchaseByOrderId(orderId: string): Promise<CreditPurchase | undefined>;
  updateCreditPurchase(id: number, data: Partial<CreditPurchase>): Promise<CreditPurchase | undefined>;
  getCreditPurchasesByUser(userId: string): Promise<CreditPurchase[]>;
  getAllCreditPurchases(): Promise<CreditPurchase[]>;

  // Domain & Hosting Orders
  createDomainOrder(order: InsertDomainOrder): Promise<DomainOrder>;
  getDomainOrder(id: number): Promise<DomainOrder | undefined>;
  getDomainOrdersByUser(userId: string): Promise<DomainOrder[]>;
  getAllDomainOrders(): Promise<DomainOrder[]>;
  updateDomainOrder(id: number, data: Partial<DomainOrder>): Promise<void>;
  createHostingOrder(order: InsertHostingOrder): Promise<HostingOrder>;
  getHostingOrder(id: number): Promise<HostingOrder | undefined>;
  getHostingOrdersByUser(userId: string): Promise<HostingOrder[]>;
  getAllHostingOrders(): Promise<HostingOrder[]>;
  updateHostingOrder(id: number, data: Partial<HostingOrder>): Promise<void>;

  // Component Library & Learning System
  saveGeneratedBlock(block: { businessType: string; designStyle?: string; websiteLanguage?: string; prompt: string; htmlContent: string; seoTitle?: string; colorPalette?: any }): Promise<AiGeneratedBlock>;
  findSimilarBlock(businessType: string, designStyle?: string, websiteLanguage?: string): Promise<AiGeneratedBlock | undefined>;
  incrementBlockUsage(id: number): Promise<void>;
  getTopBlocks(limit?: number): Promise<AiGeneratedBlock[]>;
  logGeneration(log: { userId?: string; businessType?: string; designStyle?: string; websiteLanguage?: string; prompt?: string; success?: boolean; generationMs?: number; usedCachedBlock?: boolean; cachedBlockId?: number }): Promise<void>;
  getGenerationStats(): Promise<{ totalGenerations: number; successRate: number; topBusinessTypes: { type: string; count: number }[]; avgGenerationMs: number; cacheHitRate: number }>;
}

export class DatabaseStorage implements IStorage {
  async getProjectsByUser(userId: string): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.createdAt));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: number, data: Partial<Project>): Promise<Project | undefined> {
    const [updated] = await db.update(projects).set({ ...data, updatedAt: new Date() }).where(eq(projects.id, id)).returning();
    return updated;
  }

  async deleteProject(id: number): Promise<void> {
    await db.delete(chatMessages).where(eq(chatMessages.projectId, id));
    await db.delete(projects).where(eq(projects.id, id));
  }

  async getTemplates(): Promise<Template[]> {
    return db.select().from(templates).orderBy(desc(templates.createdAt));
  }

  async getTemplatesSummary(opts?: { category?: string; page?: number; limit?: number }): Promise<{ data: Omit<Template, "previewHtml" | "previewCss">[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, opts?.page ?? 1);
    const limit = Math.min(100, Math.max(1, opts?.limit ?? 24));
    const offset = (page - 1) * limit;

    const baseQuery = db.select({
      id: templates.id,
      name: templates.name,
      nameAr: templates.nameAr,
      description: templates.description,
      descriptionAr: templates.descriptionAr,
      category: templates.category,
      thumbnail: templates.thumbnail,
      isPremium: templates.isPremium,
      createdAt: templates.createdAt,
    }).from(templates);

    const countQuery = db.select({ count: sql<number>`count(*)::int` }).from(templates);

    if (opts?.category && opts.category !== "all") {
      const data = await baseQuery.where(eq(templates.category, opts.category)).orderBy(desc(templates.createdAt)).limit(limit).offset(offset) as any[];
      const [{ count: total }] = await countQuery.where(eq(templates.category, opts.category));
      return { data, total, page, limit };
    }

    const data = await baseQuery.orderBy(desc(templates.createdAt)).limit(limit).offset(offset) as any[];
    const [{ count: total }] = await countQuery;
    return { data, total, page, limit };
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template;
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const [newTemplate] = await db.insert(templates).values(template).returning();
    return newTemplate;
  }

  async getChatMessages(projectId: number): Promise<ChatMessage[]> {
    return db.select().from(chatMessages).where(eq(chatMessages.projectId, projectId)).orderBy(chatMessages.createdAt);
  }

  async addChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  async getUser(id: string): Promise<any | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getAllProjects(): Promise<Project[]> {
    return db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getAllUsers(): Promise<any[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getStats(): Promise<{ totalUsers: number; totalProjects: number; publishedProjects: number }> {
    const [userCount] = await db.select({ value: count() }).from(users);
    const [projectCount] = await db.select({ value: count() }).from(projects);
    const [publishedCount] = await db.select({ value: count() }).from(projects).where(eq(projects.status, "published"));
    return {
      totalUsers: userCount?.value || 0,
      totalProjects: projectCount?.value || 0,
      publishedProjects: publishedCount?.value || 0,
    };
  }

  async getCoupons(): Promise<Coupon[]> {
    return db.select().from(coupons).orderBy(desc(coupons.createdAt));
  }

  async getCoupon(id: number): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id));
    return coupon;
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code));
    return coupon;
  }

  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const [newCoupon] = await db.insert(coupons).values(coupon).returning();
    return newCoupon;
  }

  async updateCoupon(id: number, data: Partial<Coupon>): Promise<Coupon | undefined> {
    const [updated] = await db.update(coupons).set(data).where(eq(coupons.id, id)).returning();
    return updated;
  }

  async deleteCoupon(id: number): Promise<void> {
    await db.delete(coupons).where(eq(coupons.id, id));
  }

  async getSetting(key: string): Promise<string | null> {
    const [setting] = await db.select().from(platformSettings).where(eq(platformSettings.key, key));
    return setting?.value ?? null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    await db.insert(platformSettings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: platformSettings.key,
        set: { value, updatedAt: new Date() },
      });
  }

  async getSettingsByPrefix(prefix: string): Promise<PlatformSetting[]> {
    return db.select().from(platformSettings).where(like(platformSettings.key, `${prefix}%`));
  }

  async deleteSetting(key: string): Promise<void> {
    await db.delete(platformSettings).where(eq(platformSettings.key, key));
  }

  async getSubscriptionByUser(userId: string): Promise<Subscription | undefined> {
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).orderBy(desc(subscriptions.createdAt));
    return sub;
  }

  async getSubscriptionByOrderId(orderId: string): Promise<Subscription | undefined> {
    const [sub] = await db.select().from(subscriptions)
      .where(eq(subscriptions.paymobOrderId, orderId))
      .limit(1);
    return sub;
  }

  async createSubscription(sub: InsertSubscription): Promise<Subscription> {
    const [newSub] = await db.insert(subscriptions).values(sub).returning();
    return newSub;
  }

  async updateSubscription(id: number, data: Partial<Subscription>): Promise<Subscription | undefined> {
    const [updated] = await db.update(subscriptions).set(data).where(eq(subscriptions.id, id)).returning();
    return updated;
  }

  async getSubscriptions(): Promise<Subscription[]> {
    return db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt));
  }

  // ─── Chatbot ─────────────────────────────────────────────────────────────
  async getKnowledgeBase(language?: string): Promise<KnowledgeBase[]> {
    if (language) {
      return db.select().from(knowledgeBase)
        .where(eq(knowledgeBase.language, language))
        .orderBy(desc(knowledgeBase.createdAt));
    }
    return db.select().from(knowledgeBase).orderBy(desc(knowledgeBase.createdAt));
  }

  async createKnowledgeEntry(entry: InsertKnowledgeBase): Promise<KnowledgeBase> {
    const [result] = await db.insert(knowledgeBase).values(entry).returning();
    return result;
  }

  async updateKnowledgeEntry(id: number, data: Partial<KnowledgeBase>): Promise<KnowledgeBase | undefined> {
    const [result] = await db.update(knowledgeBase).set(data).where(eq(knowledgeBase.id, id)).returning();
    return result;
  }

  async deleteKnowledgeEntry(id: number): Promise<void> {
    await db.delete(knowledgeBase).where(eq(knowledgeBase.id, id));
  }

  async getVisitorQuestions(limit = 50): Promise<any[]> {
    return db.select().from(visitorQuestions).orderBy(desc(visitorQuestions.createdAt)).limit(limit);
  }

  async deleteVisitorQuestion(id: number): Promise<void> {
    await db.delete(visitorQuestions).where(eq(visitorQuestions.id, id));
  }

  async getAutoLearnedKnowledge(): Promise<AutoLearnedKnowledge[]> {
    return db.select().from(autoLearnedKnowledge).orderBy(desc(autoLearnedKnowledge.usageCount));
  }

  async approveAutoLearned(id: number): Promise<void> {
    const [item] = await db.select().from(autoLearnedKnowledge).where(eq(autoLearnedKnowledge.id, id));
    if (!item) return;
    await db.insert(knowledgeBase).values({
      question: item.questionPattern,
      answer: item.answer,
      category: "auto_learned",
      language: item.language || "ar",
      isApproved: true,
    });
    await db.delete(autoLearnedKnowledge).where(eq(autoLearnedKnowledge.id, id));
  }

  async deleteAutoLearned(id: number): Promise<void> {
    await db.delete(autoLearnedKnowledge).where(eq(autoLearnedKnowledge.id, id));
  }

  async getLeads(): Promise<Lead[]> {
    return db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [result] = await db.insert(leads).values(lead).returning();
    return result;
  }

  async getFeedback(): Promise<UserFeedback[]> {
    return db.select().from(userFeedback).orderBy(desc(userFeedback.createdAt));
  }

  async createFeedback(feedback: InsertUserFeedback): Promise<UserFeedback> {
    const [result] = await db.insert(userFeedback).values(feedback).returning();
    return result;
  }

  async updateFeedbackStatus(id: number, status: string, adminNote?: string): Promise<void> {
    const updateData: any = { status };
    if (adminNote !== undefined) updateData.adminNote = adminNote;
    await db.update(userFeedback).set(updateData).where(eq(userFeedback.id, id));
  }

  async getNewFeedbackCount(): Promise<number> {
    const [r] = await db.select({ count: count() }).from(userFeedback).where(eq(userFeedback.status, "new"));
    return r?.count ?? 0;
  }

  // ─── Credit Purchases ────────────────────────────────────────────────────
  async createCreditPurchase(purchase: InsertCreditPurchase): Promise<CreditPurchase> {
    const [result] = await db.insert(creditPurchases).values(purchase).returning();
    return result;
  }

  async getCreditPurchaseByOrderId(orderId: string): Promise<CreditPurchase | undefined> {
    const [result] = await db.select().from(creditPurchases).where(eq(creditPurchases.paymobOrderId, orderId));
    return result;
  }

  async updateCreditPurchase(id: number, data: Partial<CreditPurchase>): Promise<CreditPurchase | undefined> {
    const [result] = await db.update(creditPurchases).set(data).where(eq(creditPurchases.id, id)).returning();
    return result;
  }

  async getCreditPurchasesByUser(userId: string): Promise<CreditPurchase[]> {
    return db.select().from(creditPurchases).where(eq(creditPurchases.userId, userId)).orderBy(desc(creditPurchases.createdAt));
  }

  async getAllCreditPurchases(): Promise<CreditPurchase[]> {
    return db.select().from(creditPurchases).orderBy(desc(creditPurchases.createdAt));
  }

  // ─── Component Library & Learning System ─────────────────────────────────
  async saveGeneratedBlock(block: { businessType: string; designStyle?: string; websiteLanguage?: string; prompt: string; htmlContent: string; seoTitle?: string; colorPalette?: any }): Promise<AiGeneratedBlock> {
    const [result] = await db.insert(aiGeneratedBlocks).values({
      businessType: block.businessType,
      designStyle: block.designStyle || "dark-modern",
      websiteLanguage: block.websiteLanguage || "ar",
      prompt: block.prompt,
      htmlContent: block.htmlContent,
      seoTitle: block.seoTitle,
      colorPalette: block.colorPalette,
      usageCount: 1,
      rating: 0,
      isPublic: true,
    }).returning();
    return result;
  }

  async findSimilarBlock(businessType: string, designStyle?: string, websiteLanguage?: string): Promise<AiGeneratedBlock | undefined> {
    const conditions: any[] = [eq(aiGeneratedBlocks.businessType, businessType)];
    if (designStyle) conditions.push(eq(aiGeneratedBlocks.designStyle, designStyle));
    if (websiteLanguage) conditions.push(eq(aiGeneratedBlocks.websiteLanguage, websiteLanguage));
    const [result] = await db.select().from(aiGeneratedBlocks)
      .where(and(...conditions))
      .orderBy(desc(aiGeneratedBlocks.usageCount))
      .limit(1);
    return result;
  }

  async incrementBlockUsage(id: number): Promise<void> {
    await db.update(aiGeneratedBlocks)
      .set({ usageCount: sql`${aiGeneratedBlocks.usageCount} + 1` })
      .where(eq(aiGeneratedBlocks.id, id));
  }

  async getTopBlocks(limit = 10): Promise<AiGeneratedBlock[]> {
    return db.select().from(aiGeneratedBlocks)
      .orderBy(desc(aiGeneratedBlocks.usageCount))
      .limit(limit);
  }

  async logGeneration(log: { userId?: string; businessType?: string; designStyle?: string; websiteLanguage?: string; prompt?: string; success?: boolean; generationMs?: number; usedCachedBlock?: boolean; cachedBlockId?: number }): Promise<void> {
    await db.insert(generationLogs).values({
      userId: log.userId,
      businessType: log.businessType,
      designStyle: log.designStyle,
      websiteLanguage: log.websiteLanguage,
      prompt: log.prompt?.slice(0, 500),
      success: log.success ?? true,
      generationMs: log.generationMs,
      usedCachedBlock: log.usedCachedBlock ?? false,
      cachedBlockId: log.cachedBlockId,
    });
  }

  async getGenerationStats(): Promise<{ totalGenerations: number; successRate: number; topBusinessTypes: { type: string; count: number }[]; avgGenerationMs: number; cacheHitRate: number }> {
    const [totals] = await db.select({
      total: count(),
      successful: sql<number>`SUM(CASE WHEN success = true THEN 1 ELSE 0 END)::int`,
      avgMs: sql<number>`AVG(generation_ms)::int`,
      cached: sql<number>`SUM(CASE WHEN used_cached_block = true THEN 1 ELSE 0 END)::int`,
    }).from(generationLogs);

    const byType = await db.select({
      type: generationLogs.businessType,
      count: count(),
    }).from(generationLogs)
      .where(sql`business_type IS NOT NULL`)
      .groupBy(generationLogs.businessType)
      .orderBy(desc(count()))
      .limit(10);

    const total = totals?.total ?? 0;
    const successful = totals?.successful ?? 0;
    const cached = totals?.cached ?? 0;
    return {
      totalGenerations: total,
      successRate: total > 0 ? Math.round((successful / total) * 100) : 0,
      topBusinessTypes: byType.map(r => ({ type: r.type || "unknown", count: Number(r.count) })),
      avgGenerationMs: totals?.avgMs ?? 0,
      cacheHitRate: total > 0 ? Math.round((cached / total) * 100) : 0,
    };
  }

  // ── Domain Orders ────────────────────────────────────────────────────────────
  async createDomainOrder(order: InsertDomainOrder): Promise<DomainOrder> {
    const [row] = await db.insert(domainOrders).values(order).returning();
    return row;
  }
  async getDomainOrder(id: number): Promise<DomainOrder | undefined> {
    const [row] = await db.select().from(domainOrders).where(eq(domainOrders.id, id));
    return row;
  }
  async getDomainOrdersByUser(userId: string): Promise<DomainOrder[]> {
    return db.select().from(domainOrders).where(eq(domainOrders.userId, userId)).orderBy(desc(domainOrders.createdAt));
  }
  async getAllDomainOrders(): Promise<DomainOrder[]> {
    return db.select().from(domainOrders).orderBy(desc(domainOrders.createdAt));
  }
  async updateDomainOrder(id: number, data: Partial<DomainOrder>): Promise<void> {
    await db.update(domainOrders).set({ ...data, updatedAt: new Date() }).where(eq(domainOrders.id, id));
  }

  // ── Hosting Orders ───────────────────────────────────────────────────────────
  async createHostingOrder(order: InsertHostingOrder): Promise<HostingOrder> {
    const [row] = await db.insert(hostingOrders).values(order).returning();
    return row;
  }
  async getHostingOrder(id: number): Promise<HostingOrder | undefined> {
    const [row] = await db.select().from(hostingOrders).where(eq(hostingOrders.id, id));
    return row;
  }
  async getHostingOrdersByUser(userId: string): Promise<HostingOrder[]> {
    return db.select().from(hostingOrders).where(eq(hostingOrders.userId, userId)).orderBy(desc(hostingOrders.createdAt));
  }
  async getAllHostingOrders(): Promise<HostingOrder[]> {
    return db.select().from(hostingOrders).orderBy(desc(hostingOrders.createdAt));
  }
  async updateHostingOrder(id: number, data: Partial<HostingOrder>): Promise<void> {
    await db.update(hostingOrders).set({ ...data, updatedAt: new Date() }).where(eq(hostingOrders.id, id));
  }
}

export const storage = new DatabaseStorage();
