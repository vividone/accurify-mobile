import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { helpCategories, searchArticles } from '@/data/help-articles';
import {
  MagnifyingGlassIcon,
  RocketLaunchIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CalculatorIcon,
  BuildingLibraryIcon,
  BookOpenIcon,
  ChartBarIcon,
  WalletIcon,
  ShoppingCartIcon,
  BuildingStorefrontIcon,
  UserIcon,
  Cog6ToothIcon,
  DevicePhoneMobileIcon,
  QuestionMarkCircleIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Rocket: RocketLaunchIcon,
  Document: DocumentTextIcon,
  Receipt: ClipboardDocumentListIcon,
  UserMultiple: UserGroupIcon,
  Calculator: CalculatorIcon,
  Bank: BuildingLibraryIcon,
  Book: BookOpenIcon,
  ChartColumn: ChartBarIcon,
  Wallet: WalletIcon,
  ShoppingCart: ShoppingCartIcon,
  Store: BuildingStorefrontIcon,
  Person: UserIcon,
  SettingsAdjust: Cog6ToothIcon,
  MobileCheck: DevicePhoneMobileIcon,
  Help: QuestionMarkCircleIcon,
};

export function HelpCenterPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => searchArticles(query), [query]);
  const isSearching = query.trim().length > 0;

  return (
    <>
      <PageHeader title="Help Center" backTo="/app/settings" />
      <div className="page-content space-y-4">
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-40" />
          <input
            type="text"
            placeholder="Search help articles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {isSearching ? (
          /* Search results */
          searchResults.length === 0 ? (
            <div className="text-center py-8">
              <QuestionMarkCircleIcon className="w-12 h-12 text-gray-30 mx-auto mb-3" />
              <p className="text-body-01 text-gray-70">No results found</p>
              <p className="text-label-01 text-gray-50 mt-1">
                Try different keywords or browse categories below.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-label-01 text-gray-50">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
              </p>
              {searchResults.map((article) => (
                <Card
                  key={article.id}
                  onClick={() => navigate(`/app/help/${article.category}/${article.id}`)}
                >
                  <p className="text-body-01 font-medium text-gray-100">{article.title}</p>
                  <p className="text-label-01 text-gray-50 mt-0.5">{article.summary}</p>
                  <p className="text-helper-01 text-primary mt-1">
                    {helpCategories.find((c) => c.id === article.category)?.title}
                  </p>
                </Card>
              ))}
            </div>
          )
        ) : (
          /* Category grid */
          <div className="space-y-2">
            {helpCategories.map((category) => {
              const Icon = ICON_MAP[category.icon] || QuestionMarkCircleIcon;
              return (
                <Card
                  key={category.id}
                  onClick={() => navigate(`/app/help/${category.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-01 font-medium text-gray-100">{category.title}</p>
                      <p className="text-label-01 text-gray-50">{category.description}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-helper-01 text-gray-40">
                        {category.articles.length}
                      </span>
                      <ChevronRightIcon className="w-4 h-4 text-gray-40" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Contact support */}
        <div className="text-center py-4">
          <p className="text-label-01 text-gray-50 mb-1">Still need help?</p>
          <a
            href="mailto:support@accurify.co"
            className="text-body-01 text-primary font-medium"
          >
            Email support@accurify.co
          </a>
        </div>
      </div>
    </>
  );
}
