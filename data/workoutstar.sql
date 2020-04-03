-- phpMyAdmin SQL Dump
-- version 5.0.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: אפריל 03, 2020 בזמן 01:40 PM
-- גרסת שרת: 10.4.11-MariaDB
-- PHP Version: 7.4.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `workoutstar`
--

-- --------------------------------------------------------

--
-- מבנה טבלה עבור טבלה `users`
--

CREATE TABLE `users` (
  `id` varchar(11) NOT NULL,
  `username` varchar(20) NOT NULL,
  `email` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- מבנה טבלה עבור טבלה `videos`
--

CREATE TABLE `videos` (
  `videoId` varchar(20) NOT NULL,
  `equipment` varchar(20) NOT NULL,
  `type` varchar(20) NOT NULL,
  `title` varchar(20) NOT NULL,
  `duration` time(6) NOT NULL,
  `length` varchar(11) NOT NULL,
  `url` varchar(100) NOT NULL,
  `img` varchar(250) NOT NULL,
  `userID` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- הוצאת מידע עבור טבלה `videos`
--

INSERT INTO `videos` (`videoId`, `equipment`, `type`, `title`, `duration`, `length`, `url`, `img`, `userID`) VALUES
('uUWxteM9xUU', 'No equipment', 'Yoga', '36 minute Diet Dance', '00:37:17.000000', '', 'https://www.youtube.com/watch?v=uUWxteM9xUU', 'https://i.ytimg.com/vi/uUWxteM9xUU/mqdefault.jpg', '');

--
-- Indexes for dumped tables
--

--
-- אינדקסים לטבלה `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_name` (`username`);

--
-- אינדקסים לטבלה `videos`
--
ALTER TABLE `videos`
  ADD PRIMARY KEY (`videoId`),
  ADD UNIQUE KEY `url` (`url`),
  ADD UNIQUE KEY `userID` (`userID`),
  ADD KEY `equipment` (`equipment`),
  ADD KEY `type` (`type`),
  ADD KEY `title` (`title`),
  ADD KEY `length` (`length`);

--
-- הגבלות לטבלאות שהוצאו
--

--
-- הגבלות לטבלה `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`id`) REFERENCES `videos` (`videoId`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
