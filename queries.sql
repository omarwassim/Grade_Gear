DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS engineers CASCADE;
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100),
    name VARCHAR(100),
    contact_mail VARCHAR(100) ,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE engineers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    experience_years INTEGER,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    bio TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    engineer_id INTEGER REFERENCES engineers(id),
    project_name VARCHAR(100) NOT NULL,
    contact_mail VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    project_type VARCHAR(50)[] NOT NULL, 
    description TEXT,
    price DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO engineers (name, specialization, experience_years, email, phone, bio, image_url)
VALUES 
    ('Youssef', 'Embedded systems Engineering', 3, 'youssefbasem1@.com', '+201117551565', 'Expert in Embedded systems and networking.', '/images/youssef.jpg'),
    ('Yasser', 'Newtork Engineering', 3, 'yasserlashin12@gmail.com', '+201002543806', 'Specialized in CCNA routing.', '/images/yasser.jpg'),
    ('Omar', 'Cyber security Engineering', 3, 'omarwassim05@gmail.com', '+201062264831', 'cyber security and networking expert.', '/images/omar.jpg'),
    ('Michael', 'Artificial intelligent Engineering', 3, 'akrammichael10@gmail.com', '+201289390073', 'Expert in LLm, ML , NLP', '/images/michael.jpg'),
    ('Mohamed', 'web developerEngineering', 3, 'mohamedfawzy@gmail.com', '+201205789358', 'Full-stack developer with DevOps experience.', '/images/mohamed.jpg'),
    ('Eyad', 'Embedded systems  Engineering', 3, 'eyadahmed@gmail.com', '+201027423162', 'Software engineering and optimization.', '/images/eyad.jpg');