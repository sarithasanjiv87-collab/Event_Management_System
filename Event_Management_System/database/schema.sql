CREATE DATABASE IF NOT EXISTS event_management;
USE event_management;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user','organizer','admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  description TEXT,
  category VARCHAR(80) DEFAULT 'General',
  venue VARCHAR(160) NOT NULL,
  event_date DATETIME NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  capacity INT NOT NULL DEFAULT 100,
  image_url VARCHAR(500),
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_events_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  tickets INT NOT NULL DEFAULT 1,
  status ENUM('confirmed','cancelled') NOT NULL DEFAULT 'confirmed',
  booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_event (user_id, event_id)
);

INSERT INTO events (title, description, category, venue, event_date, price, capacity, image_url)
SELECT 'Tech Innovation Summit', 'A day of talks, demos, and networking for technology enthusiasts.', 'Technology', 'Chennai Trade Centre', DATE_ADD(NOW(), INTERVAL 14 DAY), 499.00, 250, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title='Tech Innovation Summit');

INSERT INTO events (title, description, category, venue, event_date, price, capacity, image_url)
SELECT 'Creative Arts Festival', 'Explore art, music, design, and creative workshops.', 'Arts', 'Kalaivanar Arangam, Chennai', DATE_ADD(NOW(), INTERVAL 21 DAY), 299.00, 180, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title='Creative Arts Festival');

INSERT INTO events (title, description, category, venue, event_date, price, capacity, image_url)
SELECT 'Startup Connect', 'Meet founders, students, and local business communities.', 'Business', 'IIT Madras Research Park', DATE_ADD(NOW(), INTERVAL 30 DAY), 199.00, 120, 'https://images.unsplash.com/photo-1511578314322-379afb476865'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title='Startup Connect');
