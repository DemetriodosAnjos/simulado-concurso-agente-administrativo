export type SubjectId = 
  | 'portugues' 
  | 'raciocinio_logico' 
  | 'informatica' 
  | 'legislacao' 
  | 'conhecimentos_especificos';

export type DifficultyLevel = 'basico' | 'intermediario' | 'avancado';

export interface QuestionOption {
  id: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
}

export interface Question {
  id: string;
  subject: SubjectId;
  difficulty: DifficultyLevel;
  levelNumber: 1 | 2 | 3;
  statement: string;
  options: QuestionOption[];
  correctOption: 'A' | 'B' | 'C' | 'D' | 'E';
  explanation: string;
  subtopic: string;
  examBoard: string;
  year: number;
}

export interface SubjectMeta {
  id: SubjectId;
  name: string;
  shortName: string;
  description: string;
  iconName: string;
  topics: string[];
}

export interface QuizResultSummary {
  id: string;
  title: string;
  type: 'level' | 'exam' | 'errors_review' | 'custom_filter';
  subjectId?: SubjectId;
  difficulty?: DifficultyLevel;
  levelNumber?: number;
  totalQuestions: number;
  correctAnswersCount: number;
  score: number; // 0 to 100
  passed: boolean;
  minScoreNeeded: number;
  timeSpentSeconds: number;
  completedAt: string;
  answers: Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>;
  questionIds: string[];
}

export interface ActiveSession {
  id: string;
  type: 'level' | 'exam' | 'errors_review' | 'custom_filter';
  title: string;
  subjectId?: SubjectId;
  difficulty?: DifficultyLevel;
  levelNumber?: number;
  questionIds: string[];
  userAnswers: Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>;
  flaggedQuestionIds: Record<string, boolean>;
  currentIndex: number;
  timeRemainingSeconds: number;
  totalTimeSeconds: number;
  isPracticeMode: boolean; // instant feedback toggle
  startedAt: string;
}

export interface UserPerformance {
  unlockedLevels: Record<SubjectId, number>; // 1, 2, or 3
  levelHighScores: Record<string, number>; // key: `${subject}_${level}` -> score
  generalExamHighScore: number;
  history: QuizResultSummary[];
  errorQuestionIds: string[]; // caderno de erros
  theme: 'light' | 'dark';
}
