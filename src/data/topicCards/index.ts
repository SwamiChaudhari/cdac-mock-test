// Re-export topic cards with proper typing
import data from './cards.json'
import type { TopicCard } from '../../types/topicCard'

export const topicCards: TopicCard[] = data as unknown as TopicCard[]
