import portuguesData from './portugues.json';
import raciocinioData from './raciocinio_logico.json';
import informaticaData from './informatica.json';
import legislacaoData from './legislacao.json';
import especificosData from './conhecimentos_especificos.json';
import { Question, SubjectId, SubjectMeta, DifficultyLevel } from '../types';

export const SUBJECTS_META: SubjectMeta[] = [
  {
    id: 'portugues',
    name: 'Língua Portuguesa',
    shortName: 'Português',
    description: 'Compreensão de texto, sintaxe, pontuação, crase, regência e concordância verbal e nominal.',
    iconName: 'BookOpen',
    topics: ['Compreensão de Texto', 'Crase', 'Regência Verbal/Nominal', 'Concordância Verbal/Nominal', 'Pontuação', 'Classes Gramaticais']
  },
  {
    id: 'raciocinio_logico',
    name: 'Raciocínio Lógico e Matemático',
    shortName: 'RLM',
    description: 'Tabelas-verdade, equivalências lógicas, diagramas de Venn, análise combinatória e probabilidade.',
    iconName: 'Brain',
    topics: ['Equivalências Lógicas', 'Tabela-Verdade', 'Negação de Proposições', 'Diagramas Lógicos', 'Probabilidade', 'Combinatória']
  },
  {
    id: 'informatica',
    name: 'Noções de Informática',
    shortName: 'Informática',
    description: 'Hardware, Windows 10/11, Linux Ubuntu, Word/Excel 2016, Segurança, Redes e IA Generativa.',
    iconName: 'Laptop',
    topics: ['Excel 2016 (Fórmulas)', 'Word 2016', 'Segurança da Informação', 'Windows 10/11 e Linux', 'Nuvem e E-mails', 'IA Generativa']
  },
  {
    id: 'legislacao',
    name: 'Legislação',
    shortName: 'Legislação',
    description: 'Lei Orgânica de Curitiba, Estatuto dos Servidores (Lei 1.656), CF/88, Improbidade e LGPD.',
    iconName: 'Scale',
    topics: ['CF/88 (arts. 5º e 37)', 'Estatuto de Curitiba (Lei 1.656)', 'Lei de Improbidade (Lei 8.429/14.230)', 'LGPD (Lei 13.709)', 'LAI (Lei 12.527)', 'ECA']
  },
  {
    id: 'conhecimentos_especificos',
    name: 'Conhecimentos Específicos',
    shortName: 'Específicos',
    description: 'Redação Oficial (Manual da Presidência), Protocolo, Arquivo, Licitações (Lei 14.133/2021) e Gestão Patrimonial.',
    iconName: 'FolderCheck',
    topics: ['Nova Lei de Licitações (14.133)', 'Redação Oficial e Padrão Ofício', 'Teoria das 3 Idades Arquivísticas', 'Protocolo e Tramitação', 'Gestão de Materiais e Estoque', 'Patrimônio Público']
  }
];

export const ALL_QUESTIONS: Question[] = [
  ...(portuguesData as Question[]),
  ...(raciocinioData as Question[]),
  ...(informaticaData as Question[]),
  ...(legislacaoData as Question[]),
  ...(especificosData as Question[])
];

export const QUESTIONS_BY_ID: Record<string, Question> = ALL_QUESTIONS.reduce((acc, q) => {
  acc[q.id] = q;
  return acc;
}, {} as Record<string, Question>);

export function getQuestionsBySubjectAndLevel(subject: SubjectId, levelNumber: 1 | 2 | 3): Question[] {
  const difficultyMap: Record<number, DifficultyLevel> = {
    1: 'basico',
    2: 'intermediario',
    3: 'avancado'
  };
  const diff = difficultyMap[levelNumber];
  return ALL_QUESTIONS.filter(q => q.subject === subject && q.difficulty === diff);
}

export function getQuestionsForFullExam(): Question[] {
  // Simulado Geral com 40 questões conforme solicitado:
  // Língua Portuguesa - 05
  // Raciocínio Lógico - 05
  // Noções de Informática - 05
  // Legislação - 05
  // Conhecimentos Específicos - 20
  // Valor por questão: 2,50 pontos (40 * 2,50 = 100 pontos)
  const pickRandom = (items: Question[], count: number) => {
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const port = pickRandom(ALL_QUESTIONS.filter(q => q.subject === 'portugues'), 5);
  const rlm = pickRandom(ALL_QUESTIONS.filter(q => q.subject === 'raciocinio_logico'), 5);
  const info = pickRandom(ALL_QUESTIONS.filter(q => q.subject === 'informatica'), 5);
  const leg = pickRandom(ALL_QUESTIONS.filter(q => q.subject === 'legislacao'), 5);
  const esp = pickRandom(ALL_QUESTIONS.filter(q => q.subject === 'conhecimentos_especificos'), 20);

  return [...port, ...rlm, ...info, ...leg, ...esp];
}

export function getAvailableExamBoards(): string[] {
  const boards = new Set<string>();
  ALL_QUESTIONS.forEach(q => boards.add(q.examBoard));
  return Array.from(boards);
}

export function getAvailableYears(): number[] {
  const years = new Set<number>();
  ALL_QUESTIONS.forEach(q => years.add(q.year));
  return Array.from(years).sort((a, b) => b - a);
}
