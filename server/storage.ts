import { db } from "./db";
import { projects, templates, chatMessages, users, coupons, platformSettings, subscriptions, knowledgeBase, leads, autoLearnedKnowledge, visitorQuestions, userFeedback, creditPurchases } from "@shared/schema";
import type { Project, InsertProject, Template, InsertTemplate, ChatMessage, InsertChatMessage, Coupon, InsertCoupon, PlatformSetting, Subscription, InsertSubscription, KnowledgeBase, InsertKnowledgeBase, Lead, InsertLead, AutoLearnedKnowledge, UserFeedback, InsertUserFeedback, CreditPurchase, InsertCreditPurchase } from "@shared/schema";
import { eq, desc, sql, count, like } from "drizzle-orm";

export interface IStorage {
  getProjectsByUser(userId: string): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, data: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<void>;

  getTemplates(): Promise<Template[]>;
  getTemplatesSummary(): Promise<Omit<Template, "previewHtml" | "previewCss">[]>;
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

  async getTemplatesSummary(): Promise<Omit<Template, "previewHtml" | "previewCss">[]> {
    return db.select({
      id: templates.id,
      name: templates.name,
      nameAr: templates.nameAr,
      description: templates.description,
      descriptionAr: templates.descriptionAr,
      category: templates.category,
      thumbnail: templates.thumbnail,
      isPremium: templates.isPremium,
      createdAt: templates.createdAt,
    }).from(templates).orderBy(desc(templates.createdAt)) as any;
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
}

export const storage = new DatabaseStorage();
