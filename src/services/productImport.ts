/**
 * Product Import Service — الفرونت إند
 * يستدعي دالة السحابة scrapeProductFromUrl لسحب بيانات منتج من رابط خارجي
 * (أمازون، نون، على إكسبريس، شي إن، ... أي موقع يوفّر بيانات JSON-LD / Open Graph).
 */
import { getFunctions, httpsCallable } from "firebase/functions";

import { withStore } from "../config/store";

const functions = getFunctions();

export interface ScrapedProduct {
  name?: string;
  nameEn?: string;
  description?: string;
  price?: number;
  supplierPrice?: number;
  images: string[];
  brand?: string;
  siteName?: string;
}

/**
 * يسحب بيانات المنتج من الرابط. يتطلب أن يكون المستخدم مشرفاً (يتحقق الخادم).
 * يرمي خطأً برسالة عربية عند الفشل.
 */
export async function scrapeProductFromUrl(url: string): Promise<ScrapedProduct> {
  const callable = httpsCallable<{ url: string }, ScrapedProduct>(
    functions,
    "scrapeProductFromUrl"
  );
  const result = await callable(withStore({ url }));
  const data = result.data;
  return {
    ...data,
    images: Array.isArray(data.images) ? data.images : [],
  };
}
