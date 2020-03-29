-- phpMyAdmin SQL Dump
-- version 5.0.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: מרץ 29, 2020 בזמן 01:43 PM
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
-- מבנה טבלה עבור טבלה `countries`
--

CREATE TABLE `countries` (
  `America` varchar(20) DEFAULT NULL,
  `Belgium` varchar(20) DEFAULT NULL,
  `China` varchar(20) DEFAULT NULL,
  `Denmark` varchar(20) DEFAULT NULL,
  `Ethipoia` varchar(20) DEFAULT NULL,
  `France` varchar(20) DEFAULT NULL,
  `Germany` varchar(20) DEFAULT NULL,
  `South Africa` varchar(20) DEFAULT NULL,
  `Hungary` varchar(20) DEFAULT NULL,
  `Israel` varchar(20) DEFAULT NULL,
  `Italy` varchar(20) DEFAULT NULL,
  `Japan` varchar(20) DEFAULT NULL,
  `Korea` varchar(20) DEFAULT NULL,
  `Luxemburg` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- מבנה טבלה עבור טבלה `trainers`
--

CREATE TABLE `trainers` (
  `id` int(11) NOT NULL,
  `username` varchar(20) NOT NULL,
  `password` varchar(20) NOT NULL,
  `video_url` varchar(250) NOT NULL,
  `country` varchar(20) NOT NULL,
  `city` varchar(20) NOT NULL,
  `role` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- הוצאת מידע עבור טבלה `trainers`
--

INSERT INTO `trainers` (`id`, `username`, `password`, `video_url`, `country`, `city`, `role`) VALUES
(1, '', '', '', '', '', NULL);

-- --------------------------------------------------------

--
-- מבנה טבלה עבור טבלה `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(20) NOT NULL,
  `password` int(11) NOT NULL,
  `email` varchar(20) NOT NULL,
  `country` varchar(20) NOT NULL,
  `city` varchar(20) NOT NULL,
  `role` varchar(10) NOT NULL,
  `creditcard` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- אינדקסים לטבלה `trainers`
--
ALTER TABLE `trainers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `trainer_video_url` (`video_url`),
  ADD KEY `trainer_country` (`country`) USING BTREE;

--
-- אינדקסים לטבלה `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_name` (`username`),
  ADD UNIQUE KEY `user_password` (`password`),
  ADD UNIQUE KEY `user_email` (`email`),
  ADD KEY `user_country` (`country`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `trainers`
--
ALTER TABLE `trainers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- הגבלות לטבלאות שהוצאו
--

--
-- הגבלות לטבלה `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `country` FOREIGN KEY (`country`) REFERENCES `trainers` (`country`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
