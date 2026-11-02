<?php
/**
 * Database Abstraction Layer (PDO)
 * Supports SQLite3 (Primary / Zero-Config) and MySQL (XAMPP / MariaDB)
 * Compatible with PHP 5.6 through PHP 8.x
 * Course 4124941 Computational Science, RBRU
 */

class Database {
    private static $instance = null;
    private static $driver = 'sqlite'; // 'sqlite' or 'mysql'
    private static $sqlitePath = null;

    // MySQL connection settings (if switched)
    private static $mysqlHost = '127.0.0.1';
    private static $mysqlDb   = 'rbru_cs2027_db';
    private static $mysqlUser = 'root';
    private static $mysqlPass = '';
    private static $mysqlPort = 3306;

    public static function getConnection() {
        if (self::$sqlitePath === null) {
            self::$sqlitePath = __DIR__ . '/course_database.sqlite3';
        }

        if (self::$instance === null) {
            try {
                if (self::$driver === 'mysql') {
                    $dsn = "mysql:host=" . self::$mysqlHost . ";port=" . self::$mysqlPort . ";dbname=" . self::$mysqlDb . ";charset=utf8mb4";
                    self::$instance = new PDO($dsn, self::$mysqlUser, self::$mysqlPass, array(
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false,
                    ));
                } else {
                    if (!in_array('sqlite', PDO::getAvailableDrivers())) {
                        throw new Exception("PDO SQLite driver is not enabled on this server.");
                    }
                    // SQLite3 Primary Engine
                    $dsn = "sqlite:" . self::$sqlitePath;
                    self::$instance = new PDO($dsn, null, null, array(
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    ));
                    try {
                        self::$instance->exec("PRAGMA foreign_keys = ON;");
                        self::$instance->exec("PRAGMA journal_mode = WAL;");
                    } catch (Exception $pragmaEx) {
                        // In case permissions restrict journal mode changes, safely continue
                    }
                }
            } catch (Exception $e) {
                // If MySQL fails, fallback to SQLite
                if (self::$driver === 'mysql') {
                    self::$driver = 'sqlite';
                    return self::getConnection();
                }
                throw $e;
            }
        }
        return self::$instance;
    }

    public static function setDriver($driver) {
        self::$driver = strtolower($driver);
        self::$instance = null;
    }

    public static function getDriver() {
        return self::$driver;
    }

    public static function getSqlitePath() {
        if (self::$sqlitePath === null) {
            self::$sqlitePath = __DIR__ . '/course_database.sqlite3';
        }
        return self::$sqlitePath;
    }
}
