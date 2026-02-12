import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { getArticleById, getCategoryById } from '@/data/help-articles';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

export function HelpArticlePage() {
  const navigate = useNavigate();
  const { categoryId, articleId } = useParams<{
    categoryId: string;
    articleId: string;
  }>();

  const article = getArticleById(articleId!);
  const category = getCategoryById(categoryId!);

  if (!article || !category) {
    return (
      <>
        <PageHeader title="Help" backTo="/app/help" />
        <div className="page-content">
          <EmptyState
            icon={QuestionMarkCircleIcon}
            title="Article not found"
            description="This help article doesn't exist."
          />
        </div>
      </>
    );
  }

  // Find prev/next articles in the same category
  const articleIndex = category.articles.findIndex((a) => a.id === article.id);
  const prevArticle = articleIndex > 0 ? category.articles[articleIndex - 1] : null;
  const nextArticle =
    articleIndex < category.articles.length - 1
      ? category.articles[articleIndex + 1]
      : null;

  return (
    <>
      <PageHeader title={category.title} backTo={`/app/help/${categoryId}`} />
      <div className="page-content space-y-4">
        <div>
          <h2 className="text-heading-02 text-gray-100">{article.title}</h2>
          <p className="text-label-01 text-gray-50 mt-1">{article.summary}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {article.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-gray-10 text-helper-01 text-gray-50 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Article content */}
        <Card>
          <div
            className="help-article-content text-body-01 text-gray-100 [&_h3]:text-heading-03 [&_h3]:text-gray-100 [&_h3]:mt-4 [&_h3]:mb-2 [&_h4]:text-label-01 [&_h4]:font-medium [&_h4]:text-gray-70 [&_h4]:mt-3 [&_h4]:mb-1.5 [&_p]:mb-2 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_ol]:space-y-1 [&_li]:leading-relaxed [&_table]:w-full [&_table]:mb-3 [&_table]:text-label-01 [&_th]:text-left [&_th]:py-1.5 [&_th]:px-2 [&_th]:bg-gray-10 [&_th]:text-gray-70 [&_th]:font-medium [&_td]:py-1.5 [&_td]:px-2 [&_td]:border-b [&_td]:border-gray-10 [&_strong]:font-medium [&_em]:italic [&_em]:text-gray-50 [&_a]:text-primary [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </Card>

        {/* Prev/Next navigation */}
        {(prevArticle || nextArticle) && (
          <div className="flex gap-3 pt-2 pb-4">
            {prevArticle ? (
              <button
                onClick={() => navigate(`/app/help/${categoryId}/${prevArticle.id}`)}
                className="flex-1 p-3 bg-white rounded-lg border border-gray-20 text-left"
              >
                <p className="text-helper-01 text-gray-40">Previous</p>
                <p className="text-label-01 text-primary font-medium mt-0.5 line-clamp-2">
                  {prevArticle.title}
                </p>
              </button>
            ) : (
              <div className="flex-1" />
            )}
            {nextArticle ? (
              <button
                onClick={() => navigate(`/app/help/${categoryId}/${nextArticle.id}`)}
                className="flex-1 p-3 bg-white rounded-lg border border-gray-20 text-right"
              >
                <p className="text-helper-01 text-gray-40">Next</p>
                <p className="text-label-01 text-primary font-medium mt-0.5 line-clamp-2">
                  {nextArticle.title}
                </p>
              </button>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        )}
      </div>
    </>
  );
}
