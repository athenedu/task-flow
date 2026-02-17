export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          color: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          color?: string;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          priority: 'urgente' | 'alta' | 'média' | 'baixa';
          due_date: string;
          status: 'na fila' | 'em preparação' | 'iniciada' | 'em revisão' | 'concluída';
          project_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          priority: 'urgente' | 'alta' | 'média' | 'baixa';
          due_date: string;
          status: 'na fila' | 'em preparação' | 'iniciada' | 'em revisão' | 'concluída';
          project_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          priority?: 'urgente' | 'alta' | 'média' | 'baixa';
          due_date?: string;
          status?: 'na fila' | 'em preparação' | 'iniciada' | 'em revisão' | 'concluída';
          project_id?: string;
          created_at?: string;
        };
      };
    };
  };
};
