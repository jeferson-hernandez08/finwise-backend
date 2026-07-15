======================
English
======================
-- Create database
CREATE DATABASE IF NOT EXISTS finwise_db;
USE finwise_db;

-- Table: users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),          -- NULL if using Google
    google_id VARCHAR(255) UNIQUE,       -- Google identifier
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: monthly income (fixed salary per month)
CREATE TABLE monthly_income (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_monthly_income (user_id, year, month)
);

-- Table: expense categories (for organization)
CREATE TABLE expense_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);
-- Insert default categories
INSERT INTO expense_categories (name) VALUES 
('Food'), ('Housing'), ('Transportation'), ('Health'), 
('Education'), ('Entertainment'), ('Debts'), ('Savings'), ('Others');

-- Table: expenses
CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    description VARCHAR(255),
    amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
    date DATE NOT NULL,                      -- to know month/year
    debt_id INT NULL,                        -- optional: if it's a debt payment
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES expense_categories(id),
    FOREIGN KEY (debt_id) REFERENCES debts(id) ON DELETE SET NULL
);

-- Table: debts (loans, credit cards, etc.)
CREATE TABLE debts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,              -- e.g. "Car loan", "BBVA credit card"
    total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
    remaining_amount DECIMAL(12,2) NOT NULL CHECK (remaining_amount >= 0),
    minimum_monthly_payment DECIMAL(12,2),   -- optional
    interest_rate DECIMAL(5,2),              -- optional
    due_date DATE,                           -- debt deadline
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (remaining_amount <= total_amount)
);

-- Table: debt payments (history, optional but recommended)
-- Not strictly necessary because each payment is already an expense with debt_id,
-- but it helps to track independently. Kept for quick queries.
CREATE TABLE debt_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    debt_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
    payment_date DATE NOT NULL,
    FOREIGN KEY (debt_id) REFERENCES debts(id) ON DELETE CASCADE
);

-- Table: savings goals (multiple, e.g., motorcycle, house, trip)
CREATE TABLE savings_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,              -- "Motorcycle", "House", "Trip to Europe"
    target_amount DECIMAL(12,2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(12,2) DEFAULT 0 CHECK (current_amount >= 0),
    deadline DATE,                           -- optional: to meet the goal
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (current_amount <= target_amount)
);

-- Table: savings contributions (each time the person saves)
CREATE TABLE savings_contributions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    savings_goal_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL,                      -- allows grouping by month/year
    note VARCHAR(255),
    FOREIGN KEY (savings_goal_id) REFERENCES savings_goals(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_expenses_user_date ON expenses(user_id, date);
CREATE INDEX idx_monthly_income_user_month ON monthly_income(user_id, year, month);
CREATE INDEX idx_debts_user ON debts(user_id);
CREATE INDEX idx_savings_goals_user ON savings_goals(user_id);

======================
Spanish
======================
-- Crear base de datos
CREATE DATABASE IF NOT EXISTS finwise_db;
USE finwise_db;

-- Tabla: usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),          -- NULL si usa Google
    google_id VARCHAR(255) UNIQUE,       -- identificador de Google
    nombre_completo VARCHAR(255),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: ingreso mensual (sueldo fijo de cada mes)
CREATE TABLE ingreso_mensual (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    monto DECIMAL(12,2) NOT NULL CHECK (monto >= 0),
    mes INT NOT NULL CHECK (mes BETWEEN 1 AND 12),
    anio INT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_ingreso_mensual (usuario_id, anio, mes)
);

-- Tabla: categorías de gastos (opcional, para organización)
CREATE TABLE categorias_gasto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);
-- Insertar categorías por defecto
INSERT INTO categorias_gasto (nombre) VALUES 
('Alimentación'), ('Vivienda'), ('Transporte'), ('Salud'), 
('Educación'), ('Entretenimiento'), ('Deudas'), ('Ahorro'), ('Otros');

-- Tabla: gastos
CREATE TABLE gastos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    categoria_id INT NOT NULL,
    descripcion VARCHAR(255),
    monto DECIMAL(12,2) NOT NULL CHECK (monto >= 0),
    fecha DATE NOT NULL,                      -- para saber mes/año
    deuda_id INT NULL,                       -- opcional: si es pago de deuda
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias_gasto(id),
    FOREIGN KEY (deuda_id) REFERENCES deudas(id) ON DELETE SET NULL
);

-- Tabla: deudas (préstamos, tarjetas, etc.)
CREATE TABLE deudas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,            -- ej. "Préstamo coche", "Tarjeta BBVA"
    monto_total DECIMAL(12,2) NOT NULL CHECK (monto_total >= 0),
    monto_restante DECIMAL(12,2) NOT NULL CHECK (monto_restante >= 0),
    pago_mensual_minimo DECIMAL(12,2),       -- opcional
    tasa_interes DECIMAL(5,2),               -- opcional
    fecha_vencimiento DATE,                  -- fecha límite de la deuda
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CHECK (monto_restante <= monto_total)
);

-- Tabla: pagos de deudas (historial, opcional pero recomendado)
-- No es estrictamente necesaria porque cada pago ya es un gasto con deuda_id,
-- pero ayuda a llevar un control independiente del gasto. La dejamos por si se quiere consultar rápidamente.
CREATE TABLE pagos_deuda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deuda_id INT NOT NULL,
    monto DECIMAL(12,2) NOT NULL CHECK (monto >= 0),
    fecha_pago DATE NOT NULL,
    FOREIGN KEY (deuda_id) REFERENCES deudas(id) ON DELETE CASCADE
);

-- Tabla: objetivos de ahorro (múltiples, ej. moto, casa, viaje)
CREATE TABLE objetivos_ahorro (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,            -- "Moto", "Casa", "Viaje a Europa"
    monto_objetivo DECIMAL(12,2) NOT NULL CHECK (monto_objetivo > 0),
    monto_actual DECIMAL(12,2) DEFAULT 0 CHECK (monto_actual >= 0),
    fecha_limite DATE,                       -- opcional: para cumplir la meta
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CHECK (monto_actual <= monto_objetivo)
);

-- Tabla: contribuciones al ahorro (cada vez que la persona ahorra)
CREATE TABLE contribuciones_ahorro (
    id INT AUTO_INCREMENT PRIMARY KEY,
    objetivo_id INT NOT NULL,
    monto DECIMAL(12,2) NOT NULL CHECK (monto > 0),
    fecha DATE NOT NULL,                     -- permite agrupar por mes/año
    nota VARCHAR(255),
    FOREIGN KEY (objetivo_id) REFERENCES objetivos_ahorro(id) ON DELETE CASCADE
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_gastos_usuario_fecha ON gastos(usuario_id, fecha);
CREATE INDEX idx_ingreso_usuario_mes ON ingreso_mensual(usuario_id, anio, mes);
CREATE INDEX idx_deudas_usuario ON deudas(usuario_id);
CREATE INDEX idx_objetivos_usuario ON objetivos_ahorro(usuario_id);