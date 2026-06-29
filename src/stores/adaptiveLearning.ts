// Adaptive Learning Engine for CDAC Mock Test Platform
// Tracks: correct/incorrect answers, time taken, accuracy by topic, weak/strong concepts
// Generates: adaptive tests based on weakness, spaced repetition scheduling

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface QuestionAttempt {
  questionId: string;
  subject: string;
  topic: string;
  difficulty: string;
  correct: boolean;
  timeTaken: number; // seconds
  timestamp: number;
  level: string;
}

export interface TopicMastery {
  topic: string;
  subject: string;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  averageTime: number;
  lastAttempt: number;
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'mastered';
  streak: number; // consecutive correct answers
}

export interface SpacedRepetitionItem {
  questionId: string;
  interval: number; // days until next review
  easeFactor: number; // SM-2 ease factor (starts at 2.5)
  repetitions: number; // number of consecutive correct reviews
  nextReview: number; // timestamp
  lastReview: number;
}

export interface AdaptiveLearningState {
  // Performance tracking
  attempts: QuestionAttempt[];
  topicMastery: Record<string, TopicMastery>;
  spacedRepetition: Record<string, SpacedRepetitionItem>;
  
  // User stats
  totalTestsTaken: number;
  totalQuestionsAttempted: number;
  totalCorrect: number;
  totalTimeSpent: number;
  currentStreak: number;
  bestStreak: number;
  xp: number;
  level: number;
  
  // Weak/Strong areas
  weakTopics: string[];
  strongTopics: string[];
  predictedScore: number;
  
  // Actions
  recordAttempt: (attempt: QuestionAttempt) => void;
  updateTopicMastery: (topic: string, subject: string, correct: boolean, timeTaken: number) => void;
  updateSpacedRepetition: (questionId: string, quality: number) => void;
  getWeakTopics: (threshold?: number) => string[];
  getStrongTopics: (threshold?: number) => string[];
  getDueReviews: () => string[];
  generateAdaptiveTest: (count: number) => string[];
  getPredictedScore: () => number;
  getTopicRecommendations: () => { topic: string; priority: string; reason: string }[];
  resetProgress: () => void;
}

const MASTERY_THRESHOLDS = {
  beginner: { accuracy: 0.4, attempts: 0 },
  intermediate: { accuracy: 0.6, attempts: 5 },
  advanced: { accuracy: 0.8, attempts: 10 },
  mastered: { accuracy: 0.9, attempts: 15 },
};

const XP_PER_CORRECT = 10;
const XP_STREAK_BONUS = 5;
const XP_DIFFICULTY_BONUS = { easy: 0, medium: 5, hard: 10 };

export const useAdaptiveLearning = create<AdaptiveLearningState>()(
  persist(
    (set, get) => ({
      attempts: [],
      topicMastery: {},
      spacedRepetition: {},
      totalTestsTaken: 0,
      totalQuestionsAttempted: 0,
      totalCorrect: 0,
      totalTimeSpent: 0,
      currentStreak: 0,
      bestStreak: 0,
      xp: 0,
      level: 1,
      weakTopics: [],
      strongTopics: [],
      predictedScore: 0,

      recordAttempt: (attempt) => {
        const state = get();
        const newAttempts = [...state.attempts, attempt];
        
        // Update streak
        const newStreak = attempt.correct ? state.currentStreak + 1 : 0;
        const newBestStreak = Math.max(state.bestStreak, newStreak);
        
        // Calculate XP
        let xpGain = attempt.correct ? XP_PER_CORRECT : 0;
        if (attempt.correct && newStreak >= 3) xpGain += XP_STREAK_BONUS * Math.floor(newStreak / 3);
        if (attempt.correct) xpGain += XP_DIFFICULTY_BONUS[attempt.difficulty as keyof typeof XP_DIFFICULTY_BONUS] || 0;
        
        const newXP = state.xp + xpGain;
        const newLevel = Math.floor(newXP / 100) + 1;
        
        set({
          attempts: newAttempts,
          totalQuestionsAttempted: state.totalQuestionsAttempted + 1,
          totalCorrect: state.totalCorrect + (attempt.correct ? 1 : 0),
          totalTimeSpent: state.totalTimeSpent + attempt.timeTaken,
          currentStreak: newStreak,
          bestStreak: newBestStreak,
          xp: newXP,
          level: newLevel,
        });
        
        // Update topic mastery
        get().updateTopicMastery(attempt.topic, attempt.subject, attempt.correct, attempt.timeTaken);
      },

      updateTopicMastery: (topic, subject, correct, timeTaken) => {
        const state = get();
        const key = `${subject}::${topic}`;
        const existing = state.topicMastery[key] || {
          topic, subject, totalAttempts: 0, correctAttempts: 0,
          accuracy: 0, averageTime: 0, lastAttempt: 0, masteryLevel: 'beginner', streak: 0
        };
        
        const newTotal = existing.totalAttempts + 1;
        const newCorrect = existing.correctAttempts + (correct ? 1 : 0);
        const newAccuracy = newCorrect / newTotal;
        const newAverageTime = (existing.averageTime * existing.totalAttempts + timeTaken) / newTotal;
        const newStreak = correct ? existing.streak + 1 : 0;
        
        // Determine mastery level
        let masteryLevel: TopicMastery['masteryLevel'] = 'beginner';
        if (newAccuracy >= MASTERY_THRESHOLDS.mastered.accuracy && newTotal >= MASTERY_THRESHOLDS.mastered.attempts) {
          masteryLevel = 'mastered';
        } else if (newAccuracy >= MASTERY_THRESHOLDS.advanced.accuracy && newTotal >= MASTERY_THRESHOLDS.advanced.attempts) {
          masteryLevel = 'advanced';
        } else if (newAccuracy >= MASTERY_THRESHOLDS.intermediate.accuracy && newTotal >= MASTERY_THRESHOLDS.intermediate.attempts) {
          masteryLevel = 'intermediate';
        }
        
        const updatedMastery: TopicMastery = {
          topic, subject,
          totalAttempts: newTotal,
          correctAttempts: newCorrect,
          accuracy: newAccuracy,
          averageTime: newAverageTime,
          lastAttempt: Date.now(),
          masteryLevel,
          streak: newStreak,
        };
        
        const newTopicMastery = { ...state.topicMastery, [key]: updatedMastery };
        
        // Update weak/strong topics
        const allTopics = Object.values(newTopicMastery);
        const weak = allTopics.filter(t => t.accuracy < 0.6 && t.totalAttempts >= 3).map(t => t.topic);
        const strong = allTopics.filter(t => t.accuracy >= 0.8 && t.totalAttempts >= 5).map(t => t.topic);
        
        set({ topicMastery: newTopicMastery, weakTopics: weak, strongTopics: strong });
      },

      updateSpacedRepetition: (questionId, quality) => {
        // SM-2 Algorithm
        const state = get();
        const existing = state.spacedRepetition[questionId] || {
          questionId, interval: 1, easeFactor: 2.5, repetitions: 0, nextReview: 0, lastReview: 0
        };
        
        let { interval, easeFactor, repetitions } = existing;
        
        if (quality >= 3) {
          // Correct response
          if (repetitions === 0) interval = 1;
          else if (repetitions === 1) interval = 6;
          else interval = Math.round(interval * easeFactor);
          repetitions += 1;
        } else {
          // Incorrect response - reset
          repetitions = 0;
          interval = 1;
        }
        
        // Update ease factor
        easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (easeFactor < 1.3) easeFactor = 1.3;
        
        const nextReview = Date.now() + interval * 24 * 60 * 60 * 1000;
        
        const updated: SpacedRepetitionItem = {
          questionId, interval, easeFactor, repetitions, nextReview, lastReview: Date.now()
        };
        
        set({ spacedRepetition: { ...state.spacedRepetition, [questionId]: updated } });
      },

      getWeakTopics: (threshold = 0.6) => {
        const state = get();
        return Object.values(state.topicMastery)
          .filter(t => t.accuracy < threshold && t.totalAttempts >= 2)
          .sort((a, b) => a.accuracy - b.accuracy)
          .map(t => `${t.subject}::${t.topic}`);
      },

      getStrongTopics: (threshold = 0.8) => {
        const state = get();
        return Object.values(state.topicMastery)
          .filter(t => t.accuracy >= threshold && t.totalAttempts >= 5)
          .sort((a, b) => b.accuracy - a.accuracy)
          .map(t => `${t.subject}::${t.topic}`);
      },

      getDueReviews: () => {
        const state = get();
        const now = Date.now();
        return Object.values(state.spacedRepetition)
          .filter(item => item.nextReview <= now)
          .map(item => item.questionId);
      },

      generateAdaptiveTest: (count) => {
        const state = get();
        const weakTopics = get().getWeakTopics(0.7);
        const dueReviews = get().getDueReviews();
        
        // Priority: 1) Due reviews, 2) Weak topics, 3) New topics
        const selectedIds: string[] = [];
        
        // Add due reviews first (up to 30% of test)
        const reviewCount = Math.min(Math.floor(count * 0.3), dueReviews.length);
        selectedIds.push(...dueReviews.slice(0, reviewCount));
        
        // Add weak topic questions (up to 50% of test)
        // This would filter from the question bank based on weak topics
        // For now, return the IDs that should be prioritized
        
        return selectedIds;
      },

      getPredictedScore: () => {
        const state = get();
        if (state.totalQuestionsAttempted === 0) return 0;
        
        // CDAC Section A weight: English(10) + Quant(12) + Reasoning(12) + CF(11) = 45
        // CDAC Section B weight: C(15) + DSA(8) + OOP(10) + OS(5) + NW(5) + DBMS(4) + AI(3) = 50
        // Total = ~100 marks (approximate)
        
        const overallAccuracy = state.totalCorrect / state.totalQuestionsAttempted;
        
        // Weight by topic mastery
        const masteryScores = Object.values(state.topicMastery);
        if (masteryScores.length === 0) return Math.round(overallAccuracy * 100);
        
        // CDAC topic weights (approximate marks contribution)
        const topicWeights: Record<string, number> = {
          'Percentages': 3, 'Ratio & Proportion': 2, 'Profit & Loss': 3, 'Averages': 2,
          'Time & Work': 3, 'Time, Speed & Distance': 3, 'Probability': 2,
          'Pointers': 4, 'Arrays': 3, 'Strings': 3, 'Functions': 2,
          'Stack': 2, 'Queue': 2, 'Linked List': 2, 'Binary Search': 2, 'Sorting Complexities': 2,
          'Class & Object': 2, 'Constructor': 2, 'Virtual Function': 2, 'Inheritance': 2,
          'Process States': 2, 'CPU Scheduling': 2, 'Deadlock': 2, 'Paging': 2, 'Virtual Memory': 2,
          'OSI Model': 2, 'TCP vs UDP': 2, 'DNS': 1, 'HTTP & HTTPS': 1,
        };
        
        let totalWeight = 0;
        let weightedScore = 0;
        
        masteryScores.forEach(mastery => {
          const weight = topicWeights[mastery.topic] || 1;
          weightedScore += mastery.accuracy * weight;
          totalWeight += weight;
        });
        
        const predictedScore = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : overallAccuracy * 100;
        const roundedScore = Math.round(predictedScore);
        
        set({ predictedScore: roundedScore });
        return roundedScore;
      },

      getTopicRecommendations: () => {
        const state = get();
        const recommendations: { topic: string; priority: string; reason: string }[] = [];
        
        Object.values(state.topicMastery).forEach(mastery => {
          if (mastery.accuracy < 0.5 && mastery.totalAttempts >= 3) {
            recommendations.push({
              topic: `${mastery.subject} - ${mastery.topic}`,
              priority: 'HIGH',
              reason: `Accuracy: ${Math.round(mastery.accuracy * 100)}% — needs immediate attention`
            });
          } else if (mastery.accuracy < 0.7 && mastery.totalAttempts >= 5) {
            recommendations.push({
              topic: `${mastery.subject} - ${mastery.topic}`,
              priority: 'MEDIUM',
              reason: `Accuracy: ${Math.round(mastery.accuracy * 100)}% — practice more`
            });
          } else if (mastery.totalAttempts < 3) {
            recommendations.push({
              topic: `${mastery.subject} - ${mastery.topic}`,
              priority: 'LOW',
              reason: `Only ${mastery.totalAttempts} attempts — need more practice`
            });
          }
        });
        
        return recommendations.sort((a, b) => {
          const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
          return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
        });
      },

      resetProgress: () => {
        set({
          attempts: [],
          topicMastery: {},
          spacedRepetition: {},
          totalTestsTaken: 0,
          totalQuestionsAttempted: 0,
          totalCorrect: 0,
          totalTimeSpent: 0,
          currentStreak: 0,
          bestStreak: 0,
          xp: 0,
          level: 1,
          weakTopics: [],
          strongTopics: [],
          predictedScore: 0,
        });
      },
    }),
    {
      name: 'cdac-adaptive-learning',
    }
  )
);
