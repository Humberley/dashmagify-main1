
-- Create a table for financial entries
CREATE TABLE public.entradas_financeiras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa_fixa', 'despesa_variavel', 'investimento', 'divida_parcela')),
  nome TEXT NOT NULL,
  descricao TEXT,
  valor NUMERIC NOT NULL,
  data_pagamento TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comments for easier understanding
COMMENT ON TABLE public.entradas_financeiras IS 'Stores user-created financial entries like income, expenses, etc.';
COMMENT ON COLUMN public.entradas_financeiras.tipo IS 'Type of entry: receita, despesa_fixa, despesa_variavel, investimento, divida_parcela';

-- Add Row Level Security (RLS) for financial entries
ALTER TABLE public.entradas_financeiras ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own entries
CREATE POLICY "Users can view their own entries" 
  ON public.entradas_financeiras 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own entries
CREATE POLICY "Users can create their own entries" 
  ON public.entradas_financeiras 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own entries
CREATE POLICY "Users can update their own entries" 
  ON public.entradas_financeiras 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own entries
CREATE POLICY "Users can delete their own entries" 
  ON public.entradas_financeiras 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at column
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.entradas_financeiras
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
