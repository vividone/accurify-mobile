import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { getCategoryById } from '@/data/help-articles';
import { QuestionMarkCircleIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export function HelpCategoryPage() {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = getCategoryById(categoryId!);

  if (!category) {
    return (
      <>
        <PageHeader title="Help" backTo="/app/help" />
        <div className="page-content">
          <EmptyState
            icon={QuestionMarkCircleIcon}
            title="Category not found"
            description="This help category doesn't exist."
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title={category.title} backTo="/app/help" />
      <div className="page-content space-y-4">
        <p className="text-label-01 text-gray-50">{category.description}</p>

        <div className="space-y-2">
          {category.articles.map((article) => (
            <Card
              key={article.id}
              onClick={() => navigate(`/app/help/${categoryId}/${article.id}`)}
            >
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-body-01 font-medium text-gray-100">{article.title}</p>
                  <p className="text-label-01 text-gray-50 mt-0.5">{article.summary}</p>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-gray-40 flex-shrink-0" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
