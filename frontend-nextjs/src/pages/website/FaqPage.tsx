import { useState } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/layout/PageLayout";
import { useGetData } from "@/hooks/useGetData";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MagnifyingGlass, Funnel } from "@phosphor-icons/react";
import { Spinner } from "@/components/ui/Spinner";

const MotionAccordionItem = motion(AccordionItem);

// FAQ interfaces – Node API uses title/description; legacy used question/answer
interface FAQ {
  id?: string | number;
  _id?: string;
  title?: string;
  description?: string;
  question?: string;
  answer?: string;
  category?: string | { _id?: string; title?: string; slug?: string };
}

interface FAQCategory {
  id?: number | string;
  _id?: string;
  name?: string;
  title?: string;
}

const faqQuestion = (faq: FAQ) => faq.title ?? faq.question ?? "";
const faqAnswer = (faq: FAQ) => faq.description ?? faq.answer ?? "";
const faqCategoryLabel = (faq: FAQ) =>
  typeof faq.category === "object" && faq.category !== null
    ? (faq.category as { title?: string }).title ?? ""
    : (faq.category as string) ?? "";
const faqId = (faq: FAQ) => faq.id ?? faq._id ?? "";
const categoryDisplayName = (cat: FAQCategory) => cat.name ?? cat.title ?? "";
const categoryId = (cat: FAQCategory) => cat.id ?? cat._id ?? "";

const FaqPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: faqs, isLoading } = useGetData<FAQ[]>('faqs');
  const { data: categoriesFromApi } = useGetData<FAQCategory[]>('faqCategories');

  const categories = (() => {
    if (categoriesFromApi?.length) return categoriesFromApi;
    const set = new Set<string>();
    faqs?.forEach((faq) => {
      const label = faqCategoryLabel(faq);
      if (label) set.add(label);
    });
    return Array.from(set).sort().map((title) => ({ title, _id: title }));
  })();

  const filteredFaqs = faqs?.filter((faq) => {
    const searchLower = searchQuery.toLowerCase();
    const question = faqQuestion(faq);
    const answer = faqAnswer(faq);
    const matchesSearch =
      !searchLower ||
      question.toLowerCase().includes(searchLower) ||
      answer.toLowerCase().includes(searchLower);
    const catLabel = faqCategoryLabel(faq);
    const matchesCategory =
      selectedCategory === "All" || catLabel === selectedCategory;

    return matchesSearch && matchesCategory;
  }) ?? [];

  return (
    <PageLayout isFullPage={false} hasPageTitle={true} hasBreadcrumb={true}>
      <div className="flex flex-col lg:flex-row gap-8">

        <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">

          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <Input
                placeholder="Search FAQs..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-gray-100 font-semibold border-b border-gray-100 dark:border-gray-700 pb-2">
              <Funnel size={18} className="text-primary-600" />
              <h6>Categories</h6>
            </div>

            <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
              <div className="flex items-center space-x-2 py-1">
                <RadioGroupItem value="All" id="cat-all" />
                <Label htmlFor="cat-all" className="cursor-pointer font-medium text-gray-700 dark:text-gray-300">All Categories</Label>
              </div>
              {categories.map((cat) => (
                <div key={String(categoryId(cat))} className="flex items-center space-x-2 py-1">
                  <RadioGroupItem value={categoryDisplayName(cat)} id={`cat-${categoryId(cat)}`} />
                  <Label htmlFor={`cat-${categoryId(cat)}`} className="cursor-pointer font-medium text-gray-700 dark:text-gray-300">{categoryDisplayName(cat)}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </aside>

        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
              <Spinner size="lg" />
            </div>
          ) : filteredFaqs.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <Accordion type="single" collapsible className="w-full">
                {filteredFaqs.map((faq, i) => (
                  <MotionAccordionItem
                    key={String(faqId(faq))}
                    value={String(faqId(faq))}
                    className="px-6 last:border-0 border-gray-100 dark:border-gray-700"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  >
                    <AccordionTrigger className="text-base text-gray-900 dark:text-gray-100 font-semibold hover:text-primary-600 hover:no-underline">
                      {faqQuestion(faq)}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {faqAnswer(faq)}
                      {faqCategoryLabel(faq) && (
                        <div className="mt-2 text-xs text-primary-500 dark:text-primary-400 font-medium bg-primary-50 dark:bg-primary-900/40 inline-block px-2 py-1 rounded">
                          {faqCategoryLabel(faq)}
                        </div>
                      )}
                    </AccordionContent>
                  </MotionAccordionItem>
                ))}
              </Accordion>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500">
              <MagnifyingGlass size={48} className="mb-4 opacity-50" />
              <p>No FAQs found matching your criteria.</p>
              <button
                onClick={() => { setSearchQuery(""); setSelectedCategory("All") }}
                className="mt-4 text-sm text-primary-600 hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default FaqPage;
