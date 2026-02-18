import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from "@/layout/PageLayout";
import { useGetData } from "@/hooks/useGetData";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  MagnifyingGlass,
  Funnel,
  ArrowRight,
  Warning,
  FolderOpen,
} from '@phosphor-icons/react';
import { Spinner } from '@/components/ui/Spinner';

export type SearchTypeFilter = 'all' | 'faq' | 'news' | 'video' | 'magazine' | 'file';

interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  url: string;
  type: string;
}

const SEARCH_TYPES: { value: SearchTypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'faq', label: 'FAQs' },
  { value: 'news', label: 'News' },
  { value: 'video', label: 'Videos' },
  { value: 'magazine', label: 'Magazines' },
  { value: 'file', label: 'Files' },
];

const typeToBackend: Record<SearchTypeFilter, string | undefined> = {
  all: undefined,
  faq: 'faqs',
  news: 'news',
  video: 'videos',
  magazine: 'magazines',
  file: 'files',
};

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<SearchTypeFilter>('all');

  const params = {
    ...(query.trim() ? { q: query.trim() } : {}),
    ...(typeToBackend[typeFilter] ? { type: typeToBackend[typeFilter] } : {}),
  };

  const { data, isLoading, error, refetch } = useGetData<SearchResult[]>(
    'searchResults',
    Object.keys(params).length ? params : undefined,
    { enabled: query.trim().length >= 1 }
  );

  const results = data ?? [];
  const hasQuery = query.trim().length >= 1;

  const handleClearFilters = () => {
    setQuery("");
    setTypeFilter('all');
  };

  const loadingBlock = (
    <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
      <Spinner size="lg" className="mb-4" />
      <p className="text-gray-500 dark:text-gray-400">Searching...</p>
    </div>
  );

  const errorBlock = (
    <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-gray-800 rounded-xl border border-red-100 dark:border-red-900/50 text-center">
      <Warning size={56} className="text-red-500 dark:text-red-400 mb-4" weight="duotone" />
      <p className="text-gray-900 dark:text-gray-100 font-medium mb-1">Something went wrong</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">{error?.message ?? 'Failed to load search results.'}</p>
      <button
        type="button"
        onClick={() => refetch()}
        className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );

  const emptyBlock = (
    <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-600 text-center">
      <FolderOpen size={56} className="text-gray-400 dark:text-gray-500 mb-4" weight="duotone" />
      <p className="text-gray-900 dark:text-gray-100 font-medium mb-1">No results found</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
        Try a different search term or change the filter above.
      </p>
      <button
        type="button"
        onClick={handleClearFilters}
        className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
      >
        Clear search
      </button>
    </div>
  );

  const placeholderBlock = (
    <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-600 text-center">
      <MagnifyingGlass size={56} className="text-gray-400 dark:text-gray-500 mb-4" weight="duotone" />
      <p className="text-gray-900 dark:text-gray-100 font-medium mb-1">Search across FAQs, News, Videos & more</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
        Type a search term in the box and choose a filter to see results.
      </p>
    </div>
  );

  const resultsBlock = (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Found {results.length} result{results.length !== 1 ? 's' : ''}
        </p>
      </div>
      <ul className="divide-y divide-gray-100 dark:divide-gray-700">
        {results.map((result) => (
          <li key={`${result.type}-${result.id}`}>
            <Link
              to={result.url}
              className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-full inline-block mb-2">
                  {result.type}
                </span>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                  {result.title}
                </h3>
                {result.snippet && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{result.snippet}</p>
                )}
              </div>
              <ArrowRight size={20} className="shrink-0 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mt-1" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  const mainContent = !hasQuery
    ? placeholderBlock
    : isLoading
      ? loadingBlock
      : error
        ? errorBlock
        : results.length === 0
          ? emptyBlock
          : resultsBlock;

  return (
    <PageLayout isFullPage={false} hasPageTitle={true} hasBreadcrumb={true}>
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 shrink-0 space-y-6">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-gray-100 font-semibold border-b border-gray-100 dark:border-gray-700 pb-2">
              <Funnel size={18} className="text-primary-600 dark:text-primary-400" />
              <h2 className="text-sm">Filter by type</h2>
            </div>
            <RadioGroup value={typeFilter} onValueChange={(v) => setTypeFilter(v as SearchTypeFilter)}>
              {SEARCH_TYPES.map(({ value, label }) => (
                <div key={value} className="flex items-center space-x-2 py-1.5">
                  <RadioGroupItem value={value} id={`type-${value}`} />
                  <Label
                    htmlFor={`type-${value}`}
                    className="cursor-pointer font-medium text-gray-700 dark:text-gray-300 text-sm"
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </aside>

        <div className="flex-1 min-w-0 space-y-4">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" size={18} />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-9 bg-white dark:bg-gray-800"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search"
              />
            </div>
          </div>
          {mainContent}
        </div>
      </div>
    </PageLayout>
  );
};

export default SearchPage;
