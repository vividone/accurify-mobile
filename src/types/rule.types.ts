import { TransactionCategory } from './enums';

export interface CategorizationRule {
    id: string;
    name: string;
    keyword: string;
    category: TransactionCategory;
    priority: number;
    createdAt: string;
}

export interface CreateRuleRequest {
    name: string;
    keyword: string;
    category: TransactionCategory;
    priority?: number;
}
