-- ========================================================
-- SCHEMA DO BANCO DE DADOS: MARIO DRIVER PRO
-- Compatível com: Supabase / PostgreSQL (Recomendado para Vercel)
-- ========================================================

-- 1. Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Motoristas (Drivers & Configurações de Veículo)
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    driver_name VARCHAR(150) NOT NULL DEFAULT 'Motorista Parceiro',
    phone VARCHAR(30),
    vehicle_type VARCHAR(20) DEFAULT 'car', -- 'car' | 'moto'
    fuel_price NUMERIC(6, 2) DEFAULT 5.89,
    consumption_km_per_l NUMERIC(6, 2) DEFAULT 11.5,
    maintenance_per_km NUMERIC(6, 2) DEFAULT 0.22,
    min_gross_per_km NUMERIC(6, 2) DEFAULT 2.30,
    min_gross_per_hour NUMERIC(6, 2) DEFAULT 38.00,
    max_pickup_km NUMERIC(6, 2) DEFAULT 3.5,
    app_brand_name VARCHAR(100) DEFAULT 'Mario Driver Pro',
    brand_color VARCHAR(10) DEFAULT '#ff7024',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Histórico de Corridas (Trips)
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
    app_platform VARCHAR(50) NOT NULL, -- 'UberX', 'Uber Moto', '99Pop', 'inDrive'
    passenger_info VARCHAR(150),
    origin_address TEXT,
    destination_address TEXT,
    price NUMERIC(10, 2) NOT NULL,
    pickup_km NUMERIC(6, 2) DEFAULT 0,
    trip_km NUMERIC(6, 2) DEFAULT 0,
    total_km NUMERIC(6, 2) NOT NULL,
    time_minutes INTEGER NOT NULL,
    gross_per_km NUMERIC(6, 2),
    gross_per_hour NUMERIC(6, 2),
    fuel_cost NUMERIC(10, 2),
    maintenance_cost NUMERIC(10, 2),
    total_cost NUMERIC(10, 2),
    net_profit NUMERIC(10, 2),
    verdict VARCHAR(20), -- 'GOOD' | 'MEDIUM' | 'BAD'
    status VARCHAR(20) DEFAULT 'SIMULATED', -- 'ACCEPTED' | 'REJECTED' | 'SIMULATED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Despesas do Veículo (Abastecimento e Manutenções)
CREATE TABLE IF NOT EXISTS public.vehicle_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
    expense_type VARCHAR(50) NOT NULL, -- 'fuel', 'oil', 'tires', 'maintenance', 'other'
    amount NUMERIC(10, 2) NOT NULL,
    odometer_km INTEGER,
    liters NUMERIC(6, 2),
    notes TEXT,
    expense_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================
-- POLÍTICAS DE SEGURANÇA (Row Level Security - RLS)
-- Garante que cada motorista só acesse seus próprios dados
-- ========================================================

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_expenses ENABLE ROW LEVEL SECURITY;

-- Regras para drivers
CREATE POLICY "Drivers podem ver e editar seus próprios dados"
    ON public.drivers
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Regras para trips
CREATE POLICY "Motoristas acessam suas próprias corridas"
    ON public.trips
    FOR ALL
    USING (
        driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
    )
    WITH CHECK (
        driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
    );

-- Regras para despesas
CREATE POLICY "Motoristas acessam suas despesas"
    ON public.vehicle_expenses
    FOR ALL
    USING (
        driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
    )
    WITH CHECK (
        driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
    );

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_trips_driver ON public.trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_created_at ON public.trips(created_at DESC);
